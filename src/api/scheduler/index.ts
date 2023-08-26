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
    week: Date;
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
        job: Job,
        reason: string,
    }[],
    unscheduled_jobs?: {
        job: Job,
        reason: string,
    }[],
}>;

type OptimizeServicesForWeekRequest = {
    week: Date;
    // operating_hours: {
    //     start: string;
    //     end: string;
    // },
    // operating_days: number[];
    organization_id: string;
    franchise_id: string;
};

type OptimizeServicesForWeekResponse = Promise<{
    success: boolean;
    unscheduled_jobs?: {
        job: Job,
        reason: string,
    }[],
}>;

type UpsertServicesForRouteRequest = {
    route: Route;
    services_to_be_scheduled: ScheduleServiceConstraints[];
    existing_services_for_week: ScheduleServiceConstraints[];
};

type GetNearestServiceIDResponse = Promise<{
    id: string;
    existing_service: boolean;
}>

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
                organization_id: job.organization_id,
                franchise_id: job.franchise_id,
            }).catch(e => Promise.reject(e));

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
                console.log("Route Error", route.error);
                // else try again with next day
            } else /* No conflicts */ {
                // Update existing services (and jobs) if their times or truck_id have changed
                for (const [truck_id, visits] of Object.entries(route.solution)) {
                    for (const visit of visits) {
                        if (!visit.finish_time) continue;
                        const service = scheduleServicesOnDate.find(service => service.id === visit.location_id);

                        let serviceTimestamp: Date;

                        // Adjust arrival time if idle time is present and job has time restrictions
                        if (visit.idle_time && service.start_time_window) {
                            serviceTimestamp = set(job.timestamp ? new Date(job.timestamp) : date, {
                                hours: parseInt(service.start_time_window.split(":")[0]),
                                minutes: parseInt(service.start_time_window.split(":")[1]),
                            });
                        } else {
                            serviceTimestamp = set(job.timestamp ? new Date(job.timestamp) : date, {
                                hours: parseInt(visit.arrival_time.split(":")[0]),
                                minutes: parseInt(visit.arrival_time.split(":")[1]),
                            });
                        }

                        // New Job/Service (because a truck has not yet been assigned)
                        if (!service.truck_id) {
                            // Insert new on-demand job
                            await jobsApi.createJob({
                                id: job.id,
                                client_id: job.client.id,
                                timestamp: serviceTimestamp.toISOString(),
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
                            }).catch(e => Promise.reject(e));

                            await servicesApi.createService({
                                id: service.id,
                                job_id: job.id,
                                truck_id: truck_id,
                                timestamp: serviceTimestamp.toISOString(),
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
                            }).catch(e => Promise.reject(e)); // TODO: Delete job if service creation fails
                        } else /* Existing Job/Service */ {
                            const originalServiceTimestamp = new Date(service.timestamp);
                            const updatedServiceTimestamp = serviceTimestamp;

                            // Update service if time or truck has changed
                            if ((!isSameHour(updatedServiceTimestamp, originalServiceTimestamp) || !isSameMinute(updatedServiceTimestamp, originalServiceTimestamp))
                                || service.truck_id !== truck_id) {
                                console.log("Updating Service ID: ", service.id);
                                console.log("Originally Scheduled For: ", format(originalServiceTimestamp, "MM/dd/yyyy hh:mm a"));
                                console.log("Now Scheduled For: ", format(updatedServiceTimestamp, "MM/dd/yyyy hh:mm a"));
                                console.log("Truck ID: ", truck_id);
                                console.log("Service", service.truck_id);
                                await servicesApi.updateService({
                                    id: service.id,
                                    updated_fields: {
                                        timestamp: serviceTimestamp.toISOString(),
                                        truck_id: truck_id,
                                    }
                                }).catch(e => Promise.reject(e));
                                await jobsApi.updateJob({
                                    id: service.job_id,
                                    updated_fields: {
                                        timestamp: serviceTimestamp.toISOString(),
                                    }
                                }).catch(e => Promise.reject(e));
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
        return Promise.reject("Failed to insert new on-demand job (over 30 attempts)");
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
        }).catch(e => Promise.reject(e));

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
                });

                if (route.solution) {
                    availableTimestamps.push(afterTimestamp.toISOString());
                }

                scheduleServicesOnDate.pop();
            }
        }

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
        const {job, organization_id, franchise_id} = request;

        try {
            // Beginning of the next week
            const beginning_of_week = startOfWeek(addDays(new Date(), 7));

            // Get trucks
            const trucks = await trucksApi.getTrucks({
                organization_id: organization_id,
                franchise_id: franchise_id,
            });

            console.log("Inserting recurring job...");
            const schedule = await this.#getSchedule({
                week: beginning_of_week,
                include_on_demand_jobs: false,
                new_job: job,
                organization_id: organization_id,
                franchise_id: franchise_id,
                num_trucks: trucks.data.length,
            });

            console.log("Schedule", schedule);

            const conflicts = schedule.conflicts;
            const unscheduled_jobs = [];

            if (conflicts.length > 0) {
                return Promise.resolve({
                    success: false,
                    conflicts: conflicts,
                });
            }

            for (let i = 0; i < 7; i++) {
                console.log("DAY: ", i);
                const services = schedule[i];

                // Don't create a route if there are no services
                if (services.length === 0) continue;

                const route = await routeOptimizerApi.getOptimizedRoute({
                    // @ts-ignore
                    services,
                    organization_id: services[0].job.organization_id,
                    franchise_id: services[0].job.franchise_id,
                    date: addDays(startOfWeek(new Date()), i).toISOString(),
                });

                if (route.unserved) {
                    for (const [id, reason] of Object.entries(route.unserved)) {
                        conflicts.push({
                            job: services.find(service => service.id === id).job,
                            reason: reason,
                        });
                    }
                }
            }

            if (conflicts.length === 0) {
                await jobsApi.createJob({
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
                });

                // Insert recurring job services for the next 3 weeks
                for (let i = 1; i <= 3; i++) {
                    const res = await schedulerApi.optimizeServicesForWeek({
                        week: startOfWeek(addWeeks(new Date(), i)),
                        organization_id: organization_id,
                        franchise_id: franchise_id,
                    });
                    if (res.unscheduled_jobs) {
                        unscheduled_jobs.push(...res.unscheduled_jobs);
                    }
                    console.log(`**Optimize Services For Week ${i} Response**`, res);
                }
            }

            return Promise.resolve({
                success: conflicts.length <= 0,
                conflicts: conflicts.length > 0 ? conflicts : undefined,
                unscheduled_jobs: unscheduled_jobs.length > 0 ? unscheduled_jobs : undefined,
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Given a particular week, optimize the services for each day of the week and update the appropriate jobs/services
     * to reflect the optimized schedule
     * **NOTE
     * @param request
     */
    async optimizeServicesForWeek(request: OptimizeServicesForWeekRequest): OptimizeServicesForWeekResponse {
        const {week, organization_id, franchise_id} = request;

        console.log("Optimizing services for week...");

        try {
            // Get truck data
            const trucks = await trucksApi.getTrucks({
                organization_id: organization_id,
                franchise_id: franchise_id,
            });

            const num_trucks = trucks.data.length;

            const schedule = await this.#getSchedule({
                week: week,
                include_on_demand_jobs: true,
                organization_id: organization_id,
                franchise_id: franchise_id,
                num_trucks,
            });

            console.log("Schedule", schedule);

            // Get existing services for the week being optimized
            const existing_services_for_week = await servicesApi.getScheduleServicesForWeek({
                week: week,
            });


            const unscheduled_jobs = schedule.conflicts;

            // if there are unscheduled jobs at this point, then there might be existing services that need to be removed
            // before we proceed with the optimization
            // TODO: Remove existing services that are no longer needed
            if (unscheduled_jobs.length > 0) {
                return Promise.resolve({
                    success: false,
                    unscheduled_jobs: unscheduled_jobs,
                });
            }

            // Optimize route for each day of the week and update services
            for (let i = 0; i < 7; i++) {
                // Services to be optimized for current day
                const services_for_current_day = schedule[i];

                // Don't create a route if there are no services for current day
                if (services_for_current_day.length === 0) continue;

                // Get updated route for current day's services
                const route = await routeOptimizerApi.getOptimizedRoute({
                    // @ts-ignore
                    services: services_for_current_day,
                    organization_id: services_for_current_day[0].job.organization_id,
                    franchise_id: services_for_current_day[0].job.franchise_id,
                    date: addDays(request.week, i).toISOString(),
                });

                // Add unserved services to unscheduled jobs
                if (route.unserved) {
                    for (const [id, reason] of Object.entries(route.unserved)) {
                        const incompatible_service = services_for_current_day.find(service => service.id === id);
                        if (unscheduled_jobs.find(job => job.job.id === incompatible_service.job.id)) continue;
                        unscheduled_jobs.push({
                            job: incompatible_service.job,
                            reason: reason,
                        });
                    }
                }

                await this.updateServicesForRoute({
                    route: route,
                    services_to_be_scheduled: services_for_current_day,
                    existing_services_for_week: existing_services_for_week,
                });
            }

            return Promise.resolve({
                success: unscheduled_jobs.length <= 0,
                unscheduled_jobs: unscheduled_jobs.length > 0 ? unscheduled_jobs : undefined,
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async updateServicesForRoute(request: UpsertServicesForRouteRequest) {
        const {route, services_to_be_scheduled, existing_services_for_week} = request;

        try {
            for (const [truck_id, visits] of Object.entries(route.solution)) {
                console.log("Adding services for: ", truck_id);
                console.log("Visits", visits);
                for (const visit of visits) {
                    if (!visit.finish_time) continue;

                    // Get service to be scheduled (note that the service id is arbitrary)
                    const service = services_to_be_scheduled.find(service => service.id === visit.location_id);

                    // Calculate service timestamp
                    let service_timestamp: Date;
                    // Adjust arrival time if idle time is present and job has time restrictions
                    if (visit.idle_time && service.job.start_time_window) {
                        service_timestamp = set(service.timestamp ? new Date(service.timestamp) : new Date(`${service.date}T00:00`), {
                            hours: parseInt(service.job.start_time_window.split(":")[0]),
                            minutes: parseInt(service.job.start_time_window.split(":")[1]),
                        });
                    } else {
                        service_timestamp = set(new Date(`${service.date}T00:00`), {
                            hours: parseInt(visit.arrival_time.split(":")[0]),
                            minutes: parseInt(visit.arrival_time.split(":")[1]),
                        });
                    }

                    // Determine if service already exists for the given timestamp
                    const {id: service_id, existing_service} = await this.#getNearestServiceID(service, service_timestamp, existing_services_for_week);

                    // Update existing service and job if necessary
                    if (existing_service) {
                        console.log("EXISTING SERVICE ID: ", service_id);
                        const existing_timestamp_for_service = new Date(existing_services_for_week.filter(service => service.id === service_id)[0].timestamp);
                        const existing_truck_id_for_service = existing_services_for_week.filter(service => service.id === service_id)[0].truck_id;

                        // Don't update service if it already exists and has the same timestamp
                        if (isSameHour(existing_timestamp_for_service, service_timestamp)
                            && isSameMinute(existing_timestamp_for_service, service_timestamp)
                            && truck_id === existing_truck_id_for_service) continue;

                        console.log("UPDATING EXISTING SERVICE: ", service_id);
                        await servicesApi.updateService({
                            id: service_id,
                            updated_fields: {
                                timestamp: service_timestamp.toISOString(),
                                truck_id: truck_id,
                            }
                        });

                        // Update job timestamp if service is on-demand
                        if (service.job.service_type === ServiceType.ON_DEMAND) {
                            await jobsApi.updateJob({
                                id: service.job.id,
                                updated_fields: {
                                    timestamp: service_timestamp.toISOString(),
                                }
                            });
                        }
                    } else /* Insert new service */ {
                        console.log("INSERTING NEW SERVICE")
                        await servicesApi.createService({
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
                            status: "scheduled",
                            start_time_window: service.job.start_time_window,
                            end_time_window: service.job.end_time_window,
                            on_site_contact_id: service.job.on_site_contact.id,
                        })
                    }
                }
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }

    async #getSchedule(request: GetScheduleRequest): GetScheduleResponse {
        const {num_trucks, week, include_on_demand_jobs, new_job, organization_id, franchise_id} = request;

        // Get all recurring jobs that need to be scheduled
        const recurring_jobs_to_be_scheduled = await jobsApi.getJobs({
            filters: {
                open: true,
                type: [ServiceType.RECURRING],
            },
            organization_id: organization_id,
            franchise_id: franchise_id,
        }).catch(e => Promise.reject(e)).then(response => response.data);

        // Add new job to list of jobs to be scheduled
        if (new_job) {
            recurring_jobs_to_be_scheduled.push(new_job);
        }

        console.log("Jobs to be scheduled", recurring_jobs_to_be_scheduled);

        //TODO: Change to Demo or On-Demand
        const existing_on_demand_services_for_week = include_on_demand_jobs ? await servicesApi.getScheduleServicesForWeek({
            week: week,
            service_type: ServiceType.ON_DEMAND,
        }).catch(e => Promise.reject(e)) : [];

        // TODO: IMPROVE Big-O RUNTIME!!!
        const schedule: Schedule = {
            conflicts: [],
            0: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 0)))] : [],
            1: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 1)))] : [],
            2: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 2)))] : [],
            3: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 3)))] : [],
            4: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 4)))] : [],
            5: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 5)))] : [],
            6: include_on_demand_jobs ? [...existing_on_demand_services_for_week.filter(service => isSameDay(new Date(service.timestamp), addDays(week, 6)))] : [],
        };

        // Place jobs that have specified time window and days of week
        const jobsWithStartTimeAndDaysOfWeek = recurring_jobs_to_be_scheduled.filter(job => job.start_time_window && job.days_of_week);
        for (const job of jobsWithStartTimeAndDaysOfWeek) {
            for (const day of job.days_of_week) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(week, day), "yyyy-MM-dd"),
                };
                if (this.#doesNewJobConflict([...schedule[day]], job, num_trucks)) {
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
            recurring_jobs_to_be_scheduled.splice(recurring_jobs_to_be_scheduled.indexOf(job), 1);
        }

        // Sort Remaining Jobs by start time
        const jobsWithStartTime = recurring_jobs_to_be_scheduled.filter(job => job.start_time_window && !job.days_of_week);
        jobsWithStartTime.sort((a, b) => a.start_time_window > b.start_time_window ? 1 : -1);
        // Place jobs with specified start time and no days of week
        for (const job of jobsWithStartTime) {
            const daysOfWeekOptions = this.#getDaysOfWeekOptions(job);
            let daysOfWeek: number[];

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
                        date: format(addDays(week, day), "yyyy-MM-dd"), // moment(beginningOfWeek).add(day, "days").format("YYYY-MM-DD"),
                    };
                    schedule[day].push(service);
                }
                recurring_jobs_to_be_scheduled.splice(recurring_jobs_to_be_scheduled.indexOf(job), 1);
            }
        }

        // Place jobs with no start time and days of week
        const jobsWithNoStartTime = recurring_jobs_to_be_scheduled.filter(job => !job.start_time_window && job.days_of_week);
        for (const job of jobsWithNoStartTime) {
            // Place jobs with no start time and days of week
            for (const day of job.days_of_week) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(week, day), "yyyy-MM-dd"),
                };
                schedule[day].push(service);
            }
            recurring_jobs_to_be_scheduled.splice(recurring_jobs_to_be_scheduled.indexOf(job), 1);
        }

        const jobsWithNoStartTimeAndDaysOfWeek = recurring_jobs_to_be_scheduled.filter(job => !job.start_time_window && !job.days_of_week);

        for (const job of jobsWithNoStartTimeAndDaysOfWeek) {
            const daysOfWeekOptions = this.#getDaysOfWeekOptions(job);
            for (const day of daysOfWeekOptions[0]) {
                const service = {
                    id: uuid(),
                    job: job,
                    date: format(addDays(week, day), "yyyy-MM-dd"),
                };
                schedule[day].push(service);
            }
            recurring_jobs_to_be_scheduled.splice(recurring_jobs_to_be_scheduled.indexOf(job), 1);
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
    async #getNearestServiceID(service: ScheduleServiceConstraints, service_timestamp: Date, existing_services_for_week: ScheduleServiceConstraints[]): Promise<GetNearestServiceIDResponse> {
        let service_id = uuid();
        let existing_service = false;
        // If the service is an existing service, return the nearest existing service ID
        if (service.job.created_at && existing_services_for_week.length > 0) {
            const existing_services_for_job = existing_services_for_week.filter(s => s.job.id === service.job.id);
            if (existing_services_for_job.length > 0) {
                let nearest_existing_service_for_recurring_job = existing_services_for_job[0];
                for (const existing_service of existing_services_for_job) {
                    if (Math.abs(differenceInMinutes(Date.parse(existing_service.timestamp), service_timestamp))
                        < Math.abs(differenceInMinutes(Date.parse(nearest_existing_service_for_recurring_job.timestamp), service_timestamp))) {
                        nearest_existing_service_for_recurring_job = existing_service;
                    }
                }
                service_id = nearest_existing_service_for_recurring_job.id;
                existing_service = true;
            }
        }

        return Promise.resolve({
            id: service_id,
            existing_service: existing_service,
        });
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
            start: set(new Date(), {hours: service.job.start_time_window.split(':')[0], minutes: service.job.start_time_window.split(':')[1], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: service.job.start_time_window.split(':')[0], minutes: service.job.start_time_window.split(':')[1], seconds: 0}), service.job.duration),
        }));

        // Convert new job to window with duration
        const newWindow = {
            start: set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[1], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[1], seconds: 0}), newJob.duration),
        };

        let conflicts = 0;

        for (let i = newWindow.start; isBefore(i, newWindow.end) || isEqual(i, newWindow.end); i = addMinutes(i, 10)) {
            const jobsRunning = windows.filter(
                (window) => (isAfter(i, window.start) || isEqual(i, window.start)) && isBefore(i, window.end),
            ).length;

            if (jobsRunning > numTrucks) {
                conflicts++;
            }
        }

        return conflicts > 0;
    }

}

export const schedulerApi = new SchedulerApi();
