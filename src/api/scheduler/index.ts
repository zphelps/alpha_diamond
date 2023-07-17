import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {addDays, format} from "date-fns";
import {jobsApi} from "../jobs";
import {boolean} from "yup";
// import * as moment from "moment/moment";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {Job} from "../../types/job.ts";
import {routeOptimizerApi} from "../route-optimizer";

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

class SchedulerApi {

    async createScheduleServices(request: CreateScheduleServicesRequest): CreateScheduleServicesResponse {
        const scheduledServices = [];

        console.log('Creating schedule services');
        const schedule = await this.getSchedule({
            beginningOfWeek: request.beginningOfWeek,
        });

        const unscheduledJobs = [];

        console.log('Schedule', schedule);

        for (let i = 1; i < 6; i++) {
            console.log('Day', i);
            const services = schedule[i];

            console.log('Services', services);

            const route = await routeOptimizerApi.getOptimizedRoute({
                services,
            });

            if (route.unserved) {
                for (const [id, reason] of Object.entries(route.unserved)) {
                    unscheduledJobs.push({
                        service: services.find(service => service.id === id),
                        reason: reason,
                    })
                }
            }

            console.log('Route', route);

            for (const [truck_id, visits] of Object.entries(route.solution)) {
                console.log('Adding services for: ', truck_id);
                console.log('Visits', visits);
                for (const visit of visits) {
                    if (visit.location_id === "depot") continue;
                    const service = services.find(service => service.id === visit.location_id);

                    console.log('Service', service);
                    console.log(`${service.date}T${visit.arrival_time}`)
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
        })
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

        console.log('Jobs to be scheduled', jobsToBeScheduled);

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
                    date: format(addDays(beginningOfWeek, day), 'yyyy-MM-dd'), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
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
                        date: format(addDays(beginningOfWeek, day), 'yyyy-MM-dd'), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
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
                    date: format(addDays(beginningOfWeek, day), 'yyyy-MM-dd'), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
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
                    date: format(addDays(beginningOfWeek, day), 'yyyy-MM-dd'), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
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
