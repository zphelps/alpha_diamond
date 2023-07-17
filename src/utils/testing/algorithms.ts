import {SampleJob, SampleService, sampleServices} from "./service-data.ts";
import {Job} from "../../types/job.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import * as moment from "moment/moment";
import {bool, boolean} from "yup";

export function createRecurringJob({
                                       id,
                                       client_id,
                                       services_per_week,
                                       days_of_week,
                                       start_window,
                                       end_window,
                                       duration,
                                   }) {
    // sampleJobs.push({
    //     id,
    //     client_id,
    //     services_per_week,
    //     days_of_week,
    //     start_window,
    //     end_window,
    //     duration,
    // });
}

export function createOnDemandJob({
                                      id,
                                      client_id,
                                      start,
                                      end,
                                      duration,
                                  }) {
    // sampleJobs.push({
    //     id,
    //     client_id,
    //     start,
    //     end,
    //     duration,
    // });
    // Add as soon as possible
    if (!start) {
        const now = new Date();
        const upcomingServices = sampleServices.filter(service => service.start > now);


    } else /* Add at specified time */{
        console.log("Add at specified time");
    }
}

export function insertOnDemandJob(job: SampleJob) {

    // Add at specified date and time
    if (job.date && job.start_time_window && job.end_time_window) {
        console.log("Add at specified date and time");
    } else if (job.date && !job.start_time_window && !job.end_time_window) {
        console.log("Add at specified date");
    } else /* Add as soon as possible */ {
        console.log("Add as soon as possible");
    }

}

export function insertRecurringJob() {

}

export function createService() {

}

export type Schedule = { [day: number]: SampleService[] };

function getDaysOfWeekOptions(job: SampleJob): number[][] {
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
        ]
    } else if (job.services_per_week === 3) {
        return [
            [1, 3, 5],
            [2, 4, 5],
        ]
    } else if (job.services_per_week === 4) {
        return [
            [1, 2, 3, 4],
            [2, 3, 4, 5],
            [1, 3, 4, 5],
            [1, 2, 4, 5],
            [1, 2, 3, 5],
        ]
    } else if (job.services_per_week === 5) {
        return [
            [1, 2, 3, 4, 5],
        ]
    }
}
function isConflict(existingServices: SampleService[], newJob: SampleJob): boolean {
    // Calculate the length of the new job's time window
    const newJobWindowLength = Date.parse(newJob.end_time_window) - Date.parse(newJob.start_time_window);

    // Initialize a variable to keep track of the total duration of overlapping services
    let totalOverlapDuration = 0;

    for (let i = 0; i < existingServices.length; i++) {
        const service = existingServices[i];
        // If the service's time window overlaps with the new job's time window
        if (newJob.start_time_window < service.end_time_window && newJob.end_time_window > service.start_time_window) {
            // Add the service's duration to the total overlap duration
            totalOverlapDuration += service.duration;
        }
    }

    // If the total duration of overlapping services and the duration of the new job exceed the length of the new job's time window
    return totalOverlapDuration + newJob.duration > newJobWindowLength;
}

export function createWeekOfServices(recurringJobs: SampleJob[]) {
    const beginningOfWeek = moment().startOf('week');
    const jobsToBeScheduled: SampleJob[] = recurringJobs;

    const schedule: Schedule = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    };

    // Place jobs with specified time window and days of week
    const jobsWithStartTimeAndDaysOfWeek = jobsToBeScheduled.filter(job => job.start_time_window && job.days_of_week);
    for (const job of jobsWithStartTimeAndDaysOfWeek) {
        for (const day of job.days_of_week) {
            const service = {
                id: uuid(),
                start_time_window: job.start_time_window,
                end_time_window: job.end_time_window,
                duration: job.duration,
                client_id: job.client_id,
                location: job.location,
                date: moment(beginningOfWeek).add(day, 'days').format('YYYY-MM-DD'),
            };
            // @ts-ignore
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
        const daysOfWeekOptions = getDaysOfWeekOptions(job);
        let daysOfWeek;

        // For each possible days_of_week option, check if there is a conflict
        for (const days_of_week of daysOfWeekOptions) {
            let conflict = false;

            // If there is no conflict, place the job
            for (const day of days_of_week) {
                if (isConflict(schedule[day], job)) {
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
        } else {
            // Schedule service for daysOfWeek
            for (const day of daysOfWeek) {
                const service = {
                    id: uuid(),
                    start_time_window: job.start_time_window,
                    end_time_window: job.end_time_window,
                    duration: job.duration,
                    client_id: job.client_id,
                    location: job.location,
                    date: moment(beginningOfWeek).add(day, 'days').format('YYYY-MM-DD'),
                };
                // @ts-ignore
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
                start_time_window: null,
                end_time_window: null,
                duration: job.duration,
                client_id: job.client_id,
                location: job.location,
                date: moment(beginningOfWeek).add(day, 'days').format('YYYY-MM-DD'),
            };
            // @ts-ignore
            schedule[day].push(service);
        }
        jobsToBeScheduled.splice(jobsToBeScheduled.indexOf(job), 1);
    }

    const daysOfWeek = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday'
    };

    for (const day in schedule) {
        console.log(`${daysOfWeek[day]}: ${schedule[day].map((s) => `${s.client_id} (${s.start_time_window})`).join(', ')}`);
    }
}

export function optimizeDay() {

}

export function optimizeWeek() {

}
