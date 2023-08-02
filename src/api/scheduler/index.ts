import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {addDays, format, set, setMinutes} from "date-fns";
import {jobsApi, NewJobRequest} from "../jobs";
import {boolean} from "yup";
// import * as moment from "moment/moment";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {Job} from "../../types/job.ts";
import {routeOptimizerApi} from "../route-optimizer";
import {NewServiceRequest, servicesApi} from "../services";
import {isEqual} from "lodash";

type GetScheduleRequest = {
    beginningOfWeek: Date;
};

type GetScheduleResponse = Promise<Schedule>;

type CreateScheduleServicesRequest = {
    beginningOfWeek: Date;
};

type CreateScheduleServicesResponse = Promise<{
    success: boolean;
    scheduledServices?: any[],
    unscheduledServices?: {
        service: ScheduleServiceConstraints,
        reason: string,
    }[],
}>;

export type ScheduleServiceConstraints = {
    id: string,
    date: string,
    job: Job,
}

export type Schedule = {
    unscheduledJobs: {
        job: Job,
        reason: string,
    }[],
    [day: number]: ScheduleServiceConstraints[]
};

type insertNewOnDemandJobRequest = {
    job: Job;
};

type insertNewOnDemandJobResponse = Promise<{
    success: boolean;
}>;

class SchedulerApi {

    async insertNewOnDemandJob(request: insertNewOnDemandJobRequest): Promise<insertNewOnDemandJobResponse> {
        const {job} = request;

        const NUM_ATTEMPTS = 31;

        let date = new Date();

        for (let i = 1; i <= NUM_ATTEMPTS; i++) {

            if (job.timestamp) {
                date = new Date(job.timestamp);
            } else {
                date = addDays(date, i - 1);
            }

            const {data: servicesOnDate, count} = await servicesApi.getServicesOnDate({
                date: date.toISOString(),
            });

            const scheduleServicesOnDate = servicesOnDate.map(service => ({
                id: service.id,
                location: {
                    lat: service.location.lat,
                    lng: service.location.lng,
                    name: service.location.name,
                },
                job_id: service.job.id,
                truck_id: service.truck.id,
                timestamp: service.timestamp,
                start_time_window: service.start_time_window,
                end_time_window: service.end_time_window,
                duration: service.duration,
            }));

            scheduleServicesOnDate.push({
                id: uuid(),
                location: {
                    lat: job.location.lat,
                    lng: job.location.lng,
                    name: job.location.name,
                },
                job_id: job.id,
                truck_id: null,
                timestamp: job.timestamp,
                start_time_window: job.start_time_window,
                end_time_window: job.end_time_window,
                duration: job.duration,
            });


            // Get updated route
            const route = await routeOptimizerApi.getReOptimizedRoute({
                services: scheduleServicesOnDate,
                date: date.toISOString(),
            });

            // New job conflicts with existing jobs -> return false
            if (route.error || route.unserved) {
                if (job.timestamp) {
                    return Promise.resolve({
                        success: false,
                    });
                }
            } else /* No conflicts */ {
                // Update existing services (and jobs) if their times or truck_id have changed
                for (const [truck_id, visits] of Object.entries(route.solution)) {
                    for (const visit of visits) {
                        if (visit.location_id === "depot") continue;
                        const service = scheduleServicesOnDate.find(service => service.id === visit.location_id);

                        let timestamp;

                        // Adjust arrival time if idle time is present and job has time restrictions
                        if (visit.idle_time && service.start_time_window) {
                            timestamp = set(job.timestamp ? Date.parse(job.timestamp) : date, {
                                hours: parseInt(service.start_time_window.split(":")[0]),
                                minutes: parseInt(service.start_time_window.split(":")[1]),
                            }).toISOString();
                        } else {
                            timestamp = set(job.timestamp ? Date.parse(job.timestamp) : date, {
                                hours: parseInt(visit.arrival_time.split(":")[0]),
                                minutes: parseInt(visit.arrival_time.split(":")[1]),
                            }).toISOString();
                        }

                        // New Job/Service
                        if (!service.truck_id) {
                            // Insert new on-demand job
                            const newJobRes = await jobsApi.createJob({
                                id: job.id,
                                client_id: job.client.id,
                                timestamp: timestamp,
                                start_time_window: service.start_time_window,
                                end_time_window: service.end_time_window,
                                duration: job.duration,
                                location_id: job.location.id,
                                status: "scheduled",
                                service_type: "On-Demand",
                                on_site_contact_id: job.on_site_contact.id,
                                driver_notes: job.driver_notes,
                                organization_id: job.organization_id,
                                summary: job.summary,
                            });
                            if (!newJobRes.success) {
                                if (job.timestamp) {
                                    return Promise.resolve({
                                        success: false,
                                    });
                                }
                                continue;
                            }

                            const newServiceRes = await servicesApi.createService({
                                id: service.id,
                                job_id: job.id,
                                truck_id: truck_id,
                                timestamp: timestamp,
                                start_time_window: service.start_time_window,
                                end_time_window: service.end_time_window,
                                duration: job.duration,
                                location_id: job.location.id,
                                status: "scheduled",
                                on_site_contact_id: job.on_site_contact.id,
                                client_id: job.client.id,
                                organization_id: job.organization_id,
                                summary: job.summary
                            });

                            if (!newServiceRes.success) {
                                if (job.timestamp) {
                                    return Promise.resolve({
                                        success: true,
                                    });
                                }
                            }
                        } else /* Existing Job/Service */ {
                            const [newHours, newMinutes] = visit.arrival_time.split(":");
                            const originalDate = new Date(service.timestamp);
                            const newDate = set(originalDate, {
                                hours: parseInt(newHours),
                                minutes: parseInt(newMinutes)
                            });

                            if (!isEqual(newDate, originalDate) || service.truck_id !== truck_id) {
                                console.log("Updating service");
                                const serviceUpdateRes = await servicesApi.updateService({
                                    id: service.id,
                                    updated_fields: {
                                        timestamp: timestamp,
                                        truck_id: truck_id,
                                    }
                                });
                                const jobUpdateRes = await jobsApi.updateJob({
                                    id: service.job_id,
                                    updated_fields: {
                                        timestamp: timestamp,
                                    }
                                });

                                if ((!serviceUpdateRes.success || !jobUpdateRes.success) && job.timestamp) {
                                    return Promise.resolve({
                                        success: false,
                                    });
                                }
                            }
                        }
                    }
                }
                // return success
                return Promise.resolve({
                    success: true,
                });
            }

        }

        // // Insert at specific date/time
        // if (job.timestamp) {
        //     const {data: servicesOnDate, count} = await servicesApi.getServicesOnDate({
        //         date: job.timestamp,
        //     });
        //
        //     const scheduleServicesOnDate = servicesOnDate.map(service => ({
        //         id: service.id,
        //         location: {
        //             lat: service.location.lat,
        //             lng: service.location.lng,
        //             name: service.location.name,
        //         },
        //         job_id: service.job.id,
        //         truck_id: service.truck.id,
        //         timestamp: service.timestamp,
        //         start_time_window: service.start_time_window,
        //         end_time_window: service.end_time_window,
        //         duration: service.duration,
        //     }));
        //
        //     scheduleServicesOnDate.push({
        //         id: uuid(),
        //         location: {
        //             lat: job.location.lat,
        //             lng: job.location.lng,
        //             name: job.location.name,
        //         },
        //         job_id: job.id,
        //         truck_id: null,
        //         timestamp: job.timestamp,
        //         start_time_window: job.start_time_window,
        //         end_time_window: job.end_time_window,
        //         duration: job.duration,
        //     });
        //
        //
        //     // Get updated route
        //     const route = await routeOptimizerApi.getReOptimizedRoute({
        //         services: scheduleServicesOnDate,
        //         date: job.timestamp,
        //     });
        //
        //     // New job conflicts with existing jobs -> return false
        //     if (route.error || route.unserved) {
        //         return Promise.resolve({
        //             success: false,
        //         });
        //     } else /* No conflicts */ {
        //         // Update existing services (and jobs) if their times or truck_id have changed
        //         for (const [truck_id, visits] of Object.entries(route.solution)) {
        //             for (const visit of visits) {
        //                 if (visit.location_id === 'depot') continue;
        //                 const service = scheduleServicesOnDate.find(service => service.id === visit.location_id);
        //
        //                 // New Job/Service
        //                 if (!service.truck_id) {
        //                     // Insert new on-demand job
        //                     const newJobRes = await jobsApi.createJob({
        //                         id: job.id,
        //                         client_id: job.client.id,
        //                         timestamp: job.timestamp,
        //                         start_time_window: job.start_time_window,
        //                         end_time_window: job.end_time_window,
        //                         duration: job.duration,
        //                         location_id: job.location.id,
        //                         status: 'scheduled',
        //                         service_type: 'On-Demand',
        //                         on_site_contact_id: job.on_site_contact.id,
        //                         driver_notes: job.driver_notes,
        //                         organization_id: job.organization_id,
        //                         summary: job.summary,
        //                     });
        //                     if (!newJobRes.success) {
        //                         return Promise.resolve({
        //                             success: false,
        //                         });
        //                     }
        //
        //                     const newServiceRes = await servicesApi.createService({
        //                         id: service.id,
        //                         job_id: job.id,
        //                         truck_id: truck_id,
        //                         timestamp: job.timestamp,
        //                         start_time_window: job.start_time_window,
        //                         end_time_window: job.end_time_window,
        //                         duration: job.duration,
        //                         location_id: job.location.id,
        //                         status: 'scheduled',
        //                         on_site_contact_id: job.on_site_contact.id,
        //                         client_id: job.client.id,
        //                         organization_id: job.organization_id,
        //                         summary: job.summary
        //                     });
        //
        //                     if (!newServiceRes.success) {
        //                         return Promise.resolve({
        //                             success: false,
        //                         });
        //                     }
        //                 } else /* Existing Job/Service */ {
        //                     const [newHours, newMinutes] = visit.arrival_time.split(':');
        //                     const originalDate = new Date(service.timestamp);
        //                     const newDate = set(originalDate, {hours: parseInt(newHours), minutes: parseInt(newMinutes)});
        //
        //                     if (!isEqual(newDate, originalDate) || service.truck_id !== truck_id) {
        //                         console.log('Updating service');
        //                         const serviceUpdateRes = await servicesApi.updateService({
        //                             id: service.id,
        //                             updated_fields: {
        //                                 timestamp: newDate.toISOString(),
        //                                 truck_id: truck_id,
        //                             }
        //                         });
        //                         const jobUpdateRes = await jobsApi.updateJob({
        //                             id: service.job_id,
        //                             updated_fields: {
        //                                 timestamp: newDate.toISOString(),
        //                             }
        //                         });
        //
        //                         if(!serviceUpdateRes.success || !jobUpdateRes.success) {
        //                             return Promise.resolve({
        //                                 success: false,
        //                             });
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //
        //         // Insert new service for new on-demand job
        //
        //         // return success
        //         return Promise.resolve({
        //             success: true,
        //         });
        //     }
        //
        // } else /* Insert as soon as possible */{
        //
        //     console.log('No timestamp');
        // }
    }

    async createScheduleServices(request: CreateScheduleServicesRequest): CreateScheduleServicesResponse {
        const scheduledServices = [];

        console.log("Creating schedule services");
        const schedule = await this.getSchedule({
            beginningOfWeek: request.beginningOfWeek,
        });

        const unscheduledJobs = [];

        console.log("Schedule", schedule);

        for (let i = 1; i < 6; i++) {
            console.log("Day", i);
            const services = schedule[i];

            console.log("Services", services);

            const route = await routeOptimizerApi.getOptimizedRoute({
                // @ts-ignore
                services,
                date: addDays(request.beginningOfWeek, i - 1).toISOString(),
            });

            if (route.unserved) {
                for (const [id, reason] of Object.entries(route.unserved)) {
                    unscheduledJobs.push({
                        service: services.find(service => service.id === id),
                        reason: reason,
                    });
                }
            }

            console.log("Route", route);

            for (const [truck_id, visits] of Object.entries(route.solution)) {
                console.log("Adding services for: ", truck_id);
                console.log("Visits", visits);
                for (const visit of visits) {
                    if (visit.location_id === "depot") continue;
                    const service = services.find(service => service.id === visit.location_id);

                    console.log("Service", service);
                    console.log(`${service.date}T${visit.arrival_time}`);
                    scheduledServices.push({
                        id: service.id,
                        truck_id,
                        truck: {id: truck_id},
                        timestamp: `${service.date}T${visit.arrival_time}`,
                        duration: service.job.duration,
                        client: service.job.client,
                        location_id: service.job.location.id,
                        organization_id: service.job.organization_id,
                        franchise_id: service.job.franchise_id,
                        summary: service.job.summary,
                        job_id: service.job.id,
                        job: service.job,
                        status: service.job.status,
                        issued_on: new Date().toString(),
                        start_time_window: service.job.start_time_window,
                        end_time_window: service.job.end_time_window,
                        on_site_contact_id: service.job.on_site_contact.id,
                    });

                    continue;
                    await supabase.from("client_services").upsert({
                        id: service.id,
                        truck_id,
                        timestamp: `${service.date}T${visit.arrival_time}:00.000Z`,
                        duration: service.job.duration,
                        client: service.job.client,
                        location_id: service.job.location.id,
                        organization_id: service.job.organization_id,
                        franchise_id: service.job.franchise_id,
                        summary: service.job.summary,
                        job_id: service.job.id,
                        status: service.job.status,
                        issued_on: new Date(),
                        start_time_window: service.job.start_time_window,
                        end_time_window: service.job.end_time_window,
                        on_site_contact_id: service.job.on_site_contact.id,
                    });
                }
            }
        }

        return Promise.resolve({
            success: unscheduledJobs.length <= 0,
            scheduledServices: scheduledServices.length > 0 ? scheduledServices : undefined,
            unscheduledServices: unscheduledJobs.length > 0 ? unscheduledJobs : undefined,
        });
    }


    async getSchedule(request: GetScheduleRequest): GetScheduleResponse {
        const {beginningOfWeek} = request;

        const jobsToBeScheduled = await jobsApi.getJobs({
            filters: {
                open: true,
                type: ["Recurring"],
            }
        }).then(response => {
            return response.data;
        });

        console.log("Jobs to be scheduled", jobsToBeScheduled);

        //TODO: add on-demand jobs for the week
        const schedule: Schedule = {
            unscheduledJobs: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
        };

        // Place jobs that have specified time window and days of week
        const jobsWithStartTimeAndDaysOfWeek = jobsToBeScheduled.filter(job => job.start_time_window && job.days_of_week);
        for (const job of jobsWithStartTimeAndDaysOfWeek) {
            let conflict = false;
            for (const day of job.days_of_week) {
                if (this.#isTimeConflict(schedule[day], job)) {
                    conflict = true;
                    break;
                }
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
                };
                schedule[day].push(service);
            }
            if (conflict) {
                schedule.unscheduledJobs.push({
                    job,
                    reason: "Could not be scheduled because there are conflicts with other jobs on these days and times"
                });
            }
            jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
        }

        // Sort Remaining Jobs by start time
        const jobsWithStartTime = jobsToBeScheduled.filter(job => job.start_time_window && !job.days_of_week);
        jobsWithStartTime.sort((a, b) => {
            if (a.start_time_window < b.start_time_window) {
                return -1;
            }
            return a.start_time_window > b.start_time_window ? 1 : -1;
        });

        // Place jobs with specified start time and no days of week
        for (const job of jobsWithStartTime) {
            const daysOfWeekOptions = this.#getDaysOfWeekOptions(job);
            let daysOfWeek;

            // For each possible days_of_week option, check if there is a conflict
            for (const days_of_week of daysOfWeekOptions) {
                let conflict = false;

                // If there is no conflict, place the job
                for (const day of days_of_week) {
                    if (this.#isTimeConflict(schedule[day], job)) {
                        conflict = true;
                        break;
                    }
                }

                if (!conflict) {
                    daysOfWeek = days_of_week;
                    break;
                }
            }

            if (!daysOfWeek) {
                console.log(`Job ${job.id} could not be scheduled`);
                schedule.unscheduledJobs.push({
                    job,
                    reason: "Could find service days that work for this time window",
                });
            } else {
                // Schedule service for daysOfWeek
                for (const day of daysOfWeek) {
                    const service = {
                        id: uuid(),
                        job: job,
                        date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
                    };
                    schedule[day].push(service);
                }
                jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
            }
        }

        // Place jobs with no start time and days of week
        const jobsWithNoStartTime = jobsToBeScheduled.filter(job => !job.start_time_window && job.days_of_week);

        for (const job of jobsWithNoStartTime) {
            // Place jobs with no start time and days of week
            for (const day of job.days_of_week) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
                };
                schedule[day].push(service);
            }
            jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
        }

        const jobsWithNoStartTimeAndDaysOfWeek = jobsToBeScheduled.filter(job => !job.start_time_window && !job.days_of_week);

        for (const job of jobsWithNoStartTimeAndDaysOfWeek) {
            const daysOfWeekOptions = this.#getDaysOfWeekOptions(job);

            for (const day of daysOfWeekOptions[0]) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
                };
                schedule[day].push(service);
            }
            jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
        }

        return Promise.resolve(schedule);
    }

    //TODO: Take into account average number of services per day
    #getDaysOfWeekOptions(job: Job): number[][] {
        if (job.services_per_week === 1) {
            return [
                [1],
                [2],
                [3],
                [4],
                [5],
            ];
        } else if (job.services_per_week === 2) {
            return [
                [2, 4],
                [1, 3],
                [1, 4],
                [2, 5],
                [1, 5],
            ];
        } else if (job.services_per_week === 3) {
            return [
                [1, 3, 5],
                [2, 4, 5],
            ];
        } else if (job.services_per_week === 4) {
            return [
                [1, 2, 3, 4],
                [2, 3, 4, 5],
                [1, 3, 4, 5],
                [1, 2, 4, 5],
                [1, 2, 3, 5],
            ];
        } else if (job.services_per_week === 5) {
            return [
                [1, 2, 3, 4, 5],
            ];
        }
    }

    #isTimeConflict(existingServices: ScheduleServiceConstraints[], newJob: Job): boolean {
        // Calculate the length of the new job's time window
        const newJobWindowLength = Date.parse(newJob.end_time_window) - Date.parse(newJob.start_time_window);

        // Initialize a variable to keep track of the total duration of overlapping services
        let totalOverlapDuration = 0;

        for (let i = 0; i < existingServices.length; i++) {
            const service = existingServices[i];
            // If the service's time window overlaps with the new job's time window
            if (service.job.start_time_window
                && (newJob.start_time_window < service.job.end_time_window
                    && newJob.end_time_window > service.job.start_time_window)) {
                // Add the service's duration to the total overlap duration
                totalOverlapDuration += service.job.duration;
            }
        }

        // If the total duration of overlapping services and the duration of the new job exceed the length of the new job's time window
        return totalOverlapDuration + newJob.duration > newJobWindowLength;
    }


}

export const schedulerApi = new SchedulerApi();
