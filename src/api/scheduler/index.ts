import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service, ServiceType} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {
    addDays,
    addMinutes, addWeeks,
    differenceInMinutes,
    format, isAfter, isBefore,
    isSameDay, isSameHour, isSameMinute,
    parse,
    set,
    setMinutes,
    startOfWeek
} from "date-fns";
import {jobsApi, NewJobRequest} from "../jobs";
import {boolean} from "yup";
// import * as moment from "moment/moment";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {Job} from "../../types/job.ts";
import {routeOptimizerApi} from "../route-optimizer";
import {NewServiceRequest, servicesApi} from "../services";
import {isEqual} from "lodash";
import {trucksApi} from "../trucks";

type GetScheduleRequest = {
    beginningOfWeek: Date;
    include_on_demand_jobs?: boolean;
    new_job?: Job;
    organization_id: string;
    franchise_id: string;
    num_trucks: number;
};

type GetScheduleResponse = Promise<Schedule>;

type FindClosestAvailableTimestampsRequest = {
    job: Job;
    operating_hours: {
        start: string;
        end: string;
    }
}

type FindClosestAvailableTimestampsResponse = Promise<{
    success: boolean;
    timestamps?: string[];
}>

type InsertRecurringJobRequest = {
    job: Job;
    operating_hours: {
        start: string;
        end: string;
    },
    operating_days: number[];
    organization_id: string;
    franchise_id: string;
};

type InsertRecurringJobResponse = Promise<{
    success: boolean;
    conflicts?: {
        service?: ScheduleServiceConstraints,
        job?: Job,
        reason: string,
    }[],
}>;

type InsertRecurringJobServicesForWeekRequest = {
    beginningOfWeek: Date;
    operating_hours: {
        start: string;
        end: string;
    },
    operating_days: number[];
    organization_id: string;
    franchise_id: string;
};

type InsertRecurringJobServicesForWeekResponse = Promise<{
    success: boolean;
    scheduledServices?: any[],
    unscheduledServices?: {
        service: ScheduleServiceConstraints,
        reason: string,
    }[],
}>;

type UpsertServicesForRouteRequest = {
    route: Route;
    updated_services_for_week: ScheduleServiceConstraints[];
    existing_services_for_week: ScheduleServiceConstraints[];
};

type UpsertServicesForRouteResponse = Promise<{
    success: boolean;
}>;

export type ScheduleServiceConstraints = {
    id: string,
    date: string,
    timestamp?: string,
    truck_id?: string,
    start_time_window?: string,
    end_time_window?: string,
    job: Job,
}

export type Schedule = {
    conflicts: {
        job: Job,
        reason: string,
    }[],
    [day: number]: ScheduleServiceConstraints[]
};

type insertOnDemandJobRequest = {
    job: Job;
    operating_hours: {
        start: string;
        end: string;
    },
    operating_days: number[];
};

type insertOnDemandJobResponse = Promise<{
    response: SchedulerResponse;
    message?: string;
}>;

export enum SchedulerResponse {
    SUCCESS = "SUCCESS",
    ERR_METADATA = "ERR_METADATA",
    ERR_UNABLE_TO_SQUEEZE_AT_TIME = "ERR_UNABLE_TO_SQUEEZE_AT_TIME",
    ERR_UNABLE_TO_SQUEEZE_ON_DAY = "ERR_UNABLE_TO_SQUEEZE_ON_DAY",
    ERR_UNKNOWN = "ERR_UNKNOWN",
}

class SchedulerApi {

    async insertOnDemandJob(request: insertOnDemandJobRequest): Promise<insertOnDemandJobResponse> {
        const {job, operating_hours, operating_days} = request;

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
                organization_id: job.organization_id,
                franchise_id: job.franchise_id,
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
                organization_id: job.organization_id,
                franchise_id: job.franchise_id,
                operating_hours: operating_hours,
            });

            console.log("Route", route)

            // New on-demand job conflicts with existing jobs
            if (route.error || route.unserved) {
                // Failed to insert new on-demand job on specified day
                if (route.error === 'ERR_UNABLE_TO_SQUEEZE_STOPS' && job.timestamp && job.start_time_window && job.end_time_window) {
                    return Promise.resolve({
                        response: SchedulerResponse.ERR_UNABLE_TO_SQUEEZE_AT_TIME,
                        message: "Unfortunately, we could not schedule your job at the specified time.",
                    });
                } else if (route.error === 'ERR_UNABLE_TO_SQUEEZE_STOPS' && job.timestamp) {
                    return Promise.resolve({
                        response: SchedulerResponse.ERR_UNABLE_TO_SQUEEZE_ON_DAY,
                        message: "Unfortunately, we could not schedule your job at the specified time.",
                    });
                }
                // else try again with next day
            } else /* No conflicts */ {
                // Update existing services (and jobs) if their times or truck_id have changed
                for (const [truck_id, visits] of Object.entries(route.solution)) {
                    for (const visit of visits) {
                        if (!visit.finish_time) continue;
                        const service = scheduleServicesOnDate.find(service => service.id === visit.location_id);

                        let serviceTimestamp;

                        // Adjust arrival time if idle time is present and job has time restrictions
                        if (visit.idle_time && service.start_time_window) {
                            serviceTimestamp = set(job.timestamp ? Date.parse(job.timestamp) : date, {
                                hours: parseInt(service.start_time_window.split(":")[0]),
                                minutes: parseInt(service.start_time_window.split(":")[1]),
                            }).toISOString();
                        } else {
                            serviceTimestamp = set(job.timestamp ? Date.parse(job.timestamp) : date, {
                                hours: parseInt(visit.arrival_time.split(":")[0]),
                                minutes: parseInt(visit.arrival_time.split(":")[1]),
                            }).toISOString();
                        }

                        // New Job/Service (because a truck has not yet been assigned)
                        if (!service.truck_id) {
                            // Insert new on-demand job
                            const newJobRes = await jobsApi.createJob({
                                id: job.id,
                                client_id: job.client.id,
                                timestamp: serviceTimestamp,
                                start_time_window: service.start_time_window,
                                end_time_window: service.end_time_window,
                                duration: job.duration,
                                location_id: job.location.id,
                                status: "scheduled",
                                service_type: "On-Demand",
                                on_site_contact_id: job.on_site_contact.id,
                                driver_notes: job.driver_notes,
                                organization_id: job.organization_id,
                                franchise_id: job.franchise_id,
                                summary: job.summary,
                                charge_unit: job.charge_unit,
                                charge_per_unit: job.charge_per_unit,
                            });
                            if (!newJobRes.success) {
                                return Promise.reject(`Failed to create new job: ${newJobRes.message}`);
                            }

                            const newServiceRes = await servicesApi.createService({
                                id: service.id,
                                job_id: job.id,
                                truck_id: truck_id,
                                timestamp: serviceTimestamp,
                                start_time_window: service.start_time_window,
                                end_time_window: service.end_time_window,
                                duration: job.duration,
                                location_id: job.location.id,
                                status: "scheduled",
                                on_site_contact_id: job.on_site_contact.id,
                                client_id: job.client.id,
                                organization_id: job.organization_id,
                                franchise_id: job.franchise_id,
                                summary: job.summary,
                                driver_notes: job.driver_notes,
                            });

                            if (!newServiceRes.success) {
                                // TODO: Delete job
                                return Promise.reject(`Failed to create new service for job: ${newServiceRes.message}`);
                            }
                        } else /* Existing Job/Service */ {
                            const originalServiceTimestamp = new Date(service.timestamp);
                            const updatedServiceTimestamp = new Date(serviceTimestamp);

                            // Update service if time or truck has changed
                            if ((!isSameHour(updatedServiceTimestamp, originalServiceTimestamp) && !isSameMinute(updatedServiceTimestamp, originalServiceTimestamp))
                                || service.truck_id !== truck_id) {
                                console.log("Updating Service ID: ", service.id);
                                console.log("Originally Scheduled For: ", format(originalServiceTimestamp, "MM/dd/yyyy hh:mm a"));
                                console.log("Now Scheduled For: ", format(updatedServiceTimestamp, "MM/dd/yyyy hh:mm a"));
                                console.log("Truck ID: ", truck_id);
                                console.log("Service", service.truck_id);
                                const serviceUpdateRes = await servicesApi.updateService({
                                    id: service.id,
                                    updated_fields: {
                                        timestamp: serviceTimestamp,
                                        truck_id: truck_id,
                                    }
                                });
                                const jobUpdateRes = await jobsApi.updateJob({
                                    id: service.job_id,
                                    updated_fields: {
                                        timestamp: serviceTimestamp,
                                    }
                                });

                                if ((!serviceUpdateRes.success || !jobUpdateRes.success) && job.timestamp) {
                                    return Promise.resolve({
                                        response: SchedulerResponse.ERR_METADATA,
                                        conflict: false,
                                    });
                                }
                            }
                        }
                    }
                }
                // return success
                return Promise.resolve({
                    response: SchedulerResponse.SUCCESS,
                });
            }
        }
        return Promise.reject("Failed to insert new on-demand job");
    }

    /**
     * Find the closest available timestamps for a given job on a given day
     * **ASSUMES THAT THE JOB HAS A TIMESTAMP AND START/END WINDOW**
     * @param request
     */
    async findClosestAvailableTimeslots(request: FindClosestAvailableTimestampsRequest): FindClosestAvailableTimestampsResponse {
        const {job, operating_hours} = request;

        const availableTimestamps = [];

        const startOfDay = set(new Date(job.timestamp), {
            hours: parseInt(operating_hours.start.split(":")[0]),
            minutes: parseInt(operating_hours.start.split(":")[1]),
        });

        const endOfDay = set(new Date(job.timestamp), {
            hours: parseInt(operating_hours.end.split(":")[0]),
            minutes: parseInt(operating_hours.end.split(":")[1]),
        });

        const {data: servicesOnDate, count} = await servicesApi.getServicesOnDate({
            date: job.timestamp,
            organization_id: job.organization_id,
            franchise_id: job.franchise_id,
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

        // ASSUME THAT THE JOB HAS A START/END WINDOW
        let beforeTimestamp = set(new Date(job.timestamp), {
            hours: parseInt(job.start_time_window.split(":")[0]),
            minutes: parseInt(job.start_time_window.split(":")[1]),
        });
        let afterTimestamp = set(new Date(job.timestamp), {
            hours: parseInt(job.start_time_window.split(":")[0]),
            minutes: parseInt(job.start_time_window.split(":")[1]),
        });

        // eslint-disable-next-line no-constant-condition
        while (1) {
            beforeTimestamp = addMinutes(beforeTimestamp, -job.duration);
            afterTimestamp = addMinutes(afterTimestamp, job.duration);

            if (!isBefore(startOfDay, beforeTimestamp) && !isBefore(afterTimestamp, endOfDay)) break;

            if (availableTimestamps.length >= 4) break;

            if (isBefore(startOfDay, beforeTimestamp)) {
                // Add potential timestamp
                scheduleServicesOnDate.push({
                    id: uuid(),
                    location: {
                        lat: job.location.lat,
                        lng: job.location.lng,
                        name: job.location.name,
                    },
                    job_id: job.id,
                    truck_id: null,
                    timestamp: beforeTimestamp.toISOString(),
                    start_time_window: format(beforeTimestamp, "HH:mm"),
                    end_time_window: format(addMinutes(beforeTimestamp, job.duration), "HH:mm"),
                    duration: job.duration,
                });

                // Get updated route
                const route = await routeOptimizerApi.getReOptimizedRoute({
                    services: scheduleServicesOnDate,
                    date: job.timestamp,
                    organization_id: job.organization_id,
                    franchise_id: job.franchise_id,
                    operating_hours: operating_hours,
                });

                if (route.solution) {
                    availableTimestamps.push(beforeTimestamp.toISOString());
                }

                scheduleServicesOnDate.pop();
            }

            if (isBefore(afterTimestamp, endOfDay)) {
                // Add potential timestamp
                scheduleServicesOnDate.push({
                    id: uuid(),
                    location: {
                        lat: job.location.lat,
                        lng: job.location.lng,
                        name: job.location.name,
                    },
                    job_id: job.id,
                    truck_id: null,
                    timestamp: afterTimestamp.toISOString(),
                    start_time_window: format(afterTimestamp, "HH:mm"),
                    end_time_window: format(addMinutes(afterTimestamp, job.duration), "HH:mm"),
                    duration: job.duration,
                });

                // Get updated route
                const route = await routeOptimizerApi.getReOptimizedRoute({
                    services: scheduleServicesOnDate,
                    date: job.timestamp,
                    organization_id: job.organization_id,
                    franchise_id: job.franchise_id,
                    operating_hours: operating_hours,
                });

                if (route.solution) {
                    availableTimestamps.push(afterTimestamp.toISOString());
                }

                scheduleServicesOnDate.pop();
            }
        }

        // for (let timestamp = startOfDay; isBefore(timestamp, endOfDay); timestamp = addMinutes(timestamp, job.duration)) {
        //     console.log("Timestamp", timestamp);
        //     // Add potential timestamp
        //     scheduleServicesOnDate.push({
        //         id: uuid(),
        //         location: {
        //             lat: job.location.lat,
        //             lng: job.location.lng,
        //             name: job.location.name,
        //         },
        //         job_id: job.id,
        //         truck_id: null,
        //         timestamp: timestamp.toISOString(),
        //         start_time_window: format(timestamp, "HH:mm"),
        //         end_time_window: format(addMinutes(timestamp, job.duration), "HH:mm"),
        //         duration: job.duration,
        //     });
        //
        //     // Get updated route
        //     const route = await routeOptimizerApi.getReOptimizedRoute({
        //         services: scheduleServicesOnDate,
        //         date: job.timestamp,
        //         organization_id: job.organization_id,
        //         franchise_id: job.franchise_id,
        //         operating_hours: operating_hours,
        //     });
        //
        //     if (route.solution) {
        //         availableTimestamps.push(timestamp.toISOString());
        //     }
        //
        //     scheduleServicesOnDate.pop();
        // }

        return Promise.resolve({
            success: true,
            timestamps: availableTimestamps,
        });
    }

    /**
     * Insert a recurring job
     * @param request
     */
    async insertRecurringJob(request: InsertRecurringJobRequest): InsertRecurringJobResponse {
        const {job, operating_hours, operating_days, organization_id, franchise_id} = request;

        // Beginning of the next week
        const beginningOfWeek = startOfWeek(addDays(new Date(), 7));

        // Get trucks
        const trucks = await trucksApi.getTrucks({
            organization_id: organization_id,
            franchise_id: franchise_id,
        });

        console.log("Inserting recurring job...");
        const schedule = await this.getSchedule({
            beginningOfWeek: beginningOfWeek,
            include_on_demand_jobs: false,
            new_job: job,
            organization_id: organization_id,
            franchise_id: franchise_id,
            num_trucks: trucks.data.length,
        });

        const unscheduledJobs = schedule.conflicts;

        if (unscheduledJobs.length > 0) {
            return Promise.resolve({
                success: false,
                conflicts: unscheduledJobs,
            });
        }

        for (let i = 0; i < 7; i++) {
            const services = schedule[i];

            // Don't create a route if there are no services
            if (services.length === 0) continue;

            const route = await routeOptimizerApi.getOptimizedRoute({
                // @ts-ignore
                services,
                organization_id: services[0].job.organization_id,
                franchise_id: services[0].job.franchise_id,
                date: addDays(startOfWeek(new Date()), i).toISOString(),
                operating_hours: operating_hours,
                operating_days: operating_days,
            });

            if (route.unserved) {
                for (const [id, reason] of Object.entries(route.unserved)) {
                    unscheduledJobs.push({
                        job: services.find(service => service.id === id).job,
                        reason: reason,
                    });
                }
            }
        }

        if (unscheduledJobs.length === 0) {
            const res = await jobsApi.createJob({
                id: job.id,
                client_id: job.client.id,
                timestamp: null,
                start_time_window: job.start_time_window,
                end_time_window: job.end_time_window,
                duration: job.duration,
                location_id: job.location.id,
                status: "open",
                service_type: ServiceType.RECURRING,
                on_site_contact_id: job.on_site_contact.id,
                driver_notes: job.driver_notes,
                organization_id: job.organization_id,
                franchise_id: job.franchise_id,
                summary: job.summary,
                days_of_week: job.days_of_week,
                services_per_week: job.services_per_week,
                charge_unit: job.charge_unit,
                charge_per_unit: job.charge_per_unit,
            })

            if (!res.success) {
                return Promise.resolve({
                    success: false,
                });
            }

            // Insert recurring job services for the next 3 weeks
            for (let i = 1; i <= 3; i++) {
                const updateFutureWeeksServicesRes = await schedulerApi.insertRecurringJobServicesForWeek({
                    beginningOfWeek: startOfWeek(addWeeks(new Date(), i)),
                    operating_hours: operating_hours,
                    operating_days: operating_days,
                    organization_id: organization_id,
                    franchise_id: franchise_id,
                })

                if (!updateFutureWeeksServicesRes.success) {
                    return Promise.resolve({
                        success: false,
                    });
                }
            }


            return Promise.resolve({
                success: true,
            });
        }

        return Promise.resolve({
            success: unscheduledJobs.length <= 0,
            conflicts: unscheduledJobs.length > 0 ? unscheduledJobs : undefined,
        });
    }

    /**
     * Insert recurring job services for a given week
     * @param request
     */
    async insertRecurringJobServicesForWeek(request: InsertRecurringJobServicesForWeekRequest): InsertRecurringJobServicesForWeekResponse {
        const scheduledServices = [];

        console.log("Creating schedule services...");

        // Get trucks
        const trucks = await trucksApi.getTrucks({
            organization_id: request.organization_id,
            franchise_id: request.franchise_id,
        });

        const schedule = await this.getSchedule({
            beginningOfWeek: request.beginningOfWeek,
            include_on_demand_jobs: true,
            organization_id: request.organization_id,
            franchise_id: request.franchise_id,
            num_trucks: trucks.data.length,
        });

        const existing_services_for_week = await servicesApi.getScheduleServicesForWeek({
            beginning_of_week: request.beginningOfWeek.toISOString(),
        });

        const unscheduledJobs = [];

        for (let i = 0; i < 7; i++) {
            const services = schedule[i];

            // Don't create a route if there are no services
            if (services.length === 0) continue;

            const route = await routeOptimizerApi.getOptimizedRoute({
                // @ts-ignore
                services,
                organization_id: services[0].job.organization_id,
                franchise_id: services[0].job.franchise_id,
                date: addDays(request.beginningOfWeek, i).toISOString(),
                operating_hours: request.operating_hours,
                operating_days: request.operating_days,
            });

            if (route.unserved) {
                for (const [id, reason] of Object.entries(route.unserved)) {
                    unscheduledJobs.push({
                        service: services.find(service => service.id === id),
                        reason: reason,
                    });
                }
            }

            const res = await this.upsertServicesForRoute({
                route: route,
                updated_services_for_week: services,
                existing_services_for_week: existing_services_for_week,
            });

            if (!res.success) {
                return Promise.resolve({
                    success: false,
                });
            }
        }

        return Promise.resolve({
            success: unscheduledJobs.length <= 0,
            scheduledServices: scheduledServices.length > 0 ? scheduledServices : undefined,
            unscheduledServices: unscheduledJobs.length > 0 ? unscheduledJobs : undefined,
        });
    }

    async upsertServicesForRoute(request: UpsertServicesForRouteRequest): Promise<UpsertServicesForRouteResponse> {
        const {route, updated_services_for_week, existing_services_for_week} = request;

        for (const [truck_id, visits] of Object.entries(route.solution)) {
            console.log("Adding services for: ", truck_id);
            console.log("Visits", visits);
            for (const visit of visits) {
                if (visit.location_id === "depot") continue;
                const service = updated_services_for_week.find(service => service.id === visit.location_id);

                console.log("Service", service);

                let service_timestamp;

                // Adjust arrival time if idle time is present and job has time restrictions
                if (visit.idle_time && service.job.start_time_window) {
                    service_timestamp = set(service.timestamp ? Date.parse(service.timestamp) : Date.parse(`${service.date}T00:00`), {
                        hours: parseInt(service.job.start_time_window.split(":")[0]),
                        minutes: parseInt(service.job.start_time_window.split(":")[1]),
                    });
                } else {
                    service_timestamp = set(new Date(`${service.date}T00:00`), {
                        hours: parseInt(visit.arrival_time.split(":")[0]),
                        minutes: parseInt(visit.arrival_time.split(":")[1]),
                        seconds: 0,
                    });
                }

                console.log("Service Timestamp", service_timestamp);

                let service_id = service.id;

                // TODO: OR trial
                if (service.job.service_type === ServiceType.RECURRING) {
                    service_id = await this.#getServiceID(service, service_timestamp, existing_services_for_week);
                }

                console.log("Service ID", service_id);
                console.log(service);

                const upsertServiceRes = await servicesApi.createService({
                    id: service_id,
                    truck_id,
                    timestamp: service_timestamp.toISOString(),
                    duration: service.job.duration,
                    client_id: service.job.client.id,
                    location_id: service.job.location.id,
                    organization_id: service.job.organization_id,
                    franchise_id: service.job.franchise_id,
                    summary: service.job.summary,
                    driver_notes: service.job.driver_notes,
                    job_id: service.job.id,
                    status: service.job.status,
                    start_time_window: service.job.start_time_window,
                    end_time_window: service.job.end_time_window,
                    on_site_contact_id: service.job.on_site_contact.id,
                })

                if (service.job.service_type === 'On-Demand') {
                    const updateJobRes = await jobsApi.updateJob({
                        id: service.job.id,
                        updated_fields: {
                            timestamp: service_timestamp.toISOString(),
                        }
                    });
                    if (!updateJobRes.success) {
                        return Promise.resolve({
                            success: false,
                        });
                    }
                }

                if (!upsertServiceRes.success) {
                    return Promise.resolve({
                        success: false,
                    });
                } else {
                    console.log("Successfully created service: ", service);
                }
            }
        }

        return Promise.resolve({
            success: true,
        });
    }

    async getSchedule(request: GetScheduleRequest): GetScheduleResponse {
        const {num_trucks, beginningOfWeek, include_on_demand_jobs, new_job, organization_id, franchise_id} = request;

        const jobsToBeScheduled = await jobsApi.getJobs({
            filters: {
                open: true,
                type: ["Recurring"],
            },
            organization_id: organization_id,
            franchise_id: franchise_id,
        }).then(response => {
            return response.data;
        });

        if (new_job) {
            jobsToBeScheduled.push(new_job);
        }

        console.log("Jobs to be scheduled", jobsToBeScheduled);

        //TODO: Change to Demo or On-Demand
        const existing_on_demand_services_for_week = include_on_demand_jobs ? await servicesApi.getScheduleServicesForWeek({
            beginning_of_week: beginningOfWeek.toISOString(),
            service_type: ServiceType.ON_DEMAND,
        }) : [];

        // TODO: IMPROVE Big-O RUNTIME!!!
        const schedule: Schedule = {
            conflicts: [],
            0: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 0)))] : [],
            1: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 1)))] : [],
            2: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 2)))] : [],
            3: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 3)))] : [],
            4: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 4)))] : [],
            5: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 5)))] : [],
            6: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(beginningOfWeek, 6)))] : [],
        };

        // Place jobs that have specified time window and days of week
        const jobsWithStartTimeAndDaysOfWeek = jobsToBeScheduled.filter(job => job.start_time_window && job.days_of_week);
        for (const job of jobsWithStartTimeAndDaysOfWeek) {
            for (const day of job.days_of_week) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"),
                };
                if (this.#doesNewJobConflict([...schedule[day]], job, num_trucks)) {
                    // schedule.conflicts.push({
                    //     service: service,
                    //     reason: "Could not be scheduled because there are conflicts with other jobs on these days and times"
                    // });
                    // add to conflicts

                    // add to conflicts
                    schedule.conflicts.push({
                        job: job,
                        reason: "Could not be scheduled because there are conflicts with other jobs on these days and times"
                    });
                    // remove services that were already scheduled
                    for (const day of job.days_of_week) {
                        schedule[day] = schedule[day].filter(service => service.job.id !== job.id);
                    }
                    break;
                }
                schedule[day].push(service);
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
                    if (this.#doesNewJobConflict(schedule[day], job, num_trucks)) {
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
                schedule.conflicts.push({
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
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"),
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
                    date: format(addDays(beginningOfWeek, day), "yyyy-MM-dd"),
                };
                schedule[day].push(service);
            }
            jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
        }

        return Promise.resolve(schedule);
    }

    /**
     * Get the service ID for a given service
     * If the service is a new job, return a new service ID
     * If the service is an existing job, return the nearest existing service ID
     * @param service
     * @param service_timestamp
     * @param existing_services_for_week
     * @private
     */
    async #getServiceID(service: ScheduleServiceConstraints, service_timestamp: Date, existing_services_for_week: ScheduleServiceConstraints[]): Promise<string> {
        let service_id = uuid();
        // If the service is an existing service, return the nearest existing service ID
        if (service.job.created_at && existing_services_for_week.length > 0) {
            const existing_services_for_job = existing_services_for_week.filter(s => s.job.id === service.job.id);
            console.log("Existing services for job", existing_services_for_job)
            if (existing_services_for_job.length > 0) {
                let nearest_existing_service_for_recurring_job = existing_services_for_job[0];
                for (const existing_service of existing_services_for_job) {
                    if (Math.abs(differenceInMinutes(Date.parse(existing_service.timestamp), service_timestamp))
                        < Math.abs(differenceInMinutes(Date.parse(nearest_existing_service_for_recurring_job.timestamp), service_timestamp))) {
                        nearest_existing_service_for_recurring_job = existing_service;
                    }
                }
                console.log("Service", service, service_timestamp)
                console.log("Nearest existing service", nearest_existing_service_for_recurring_job)
                service_id = nearest_existing_service_for_recurring_job.id;
            }
        }

        return Promise.resolve(service_id);
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

    #doesNewJobConflict(services, newJob, numTrucks) {
        // Convert jobs to windows with duration
        const windows = services.filter(service => service.job.start_time_window && service.job.end_time_window).map((service) => ({
            start: set(new Date(), {hours: service.job.start_time_window.split(':')[0], minutes: service.job.start_time_window.split(':')[0], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: service.job.start_time_window.split(':')[0], minutes: service.job.start_time_window.split(':')[0], seconds: 0}), service.job.duration),
        }));

        // Convert new job to window with duration
        const newWindow = {
            start: set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[0], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[0], seconds: 0}), newJob.duration),
        };

        let conflicts = 0;

        for (let i = newWindow.start; isBefore(i, newWindow.end) || isEqual(i, newWindow.end); i = addMinutes(i, 1)) {
            const jobsRunning = windows.filter(
                (window) => (isAfter(i, window.start) || isEqual(i, window.start)) && isBefore(i, window.end),
            ).length;

            if (jobsRunning >= numTrucks) {
                conflicts++;
            }
        }

        return conflicts > 0;
    }

}

export const schedulerApi = new SchedulerApi();
