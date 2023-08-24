import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {addMinutes, format, isAfter, isBefore, isToday, set, setMinutes} from "date-fns";
import {ScheduleServiceConstraints} from "../scheduler";
import {trucksApi} from "../trucks";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

type GetOptimizedRouteRequest = {
    date: string;
    organization_id: string;
    franchise_id: string;
    services: ScheduleServiceConstraints[];
    operating_hours: {
        start: string;
        end: string;
    }
    operating_days: number[];
};

type GetOptimizedRouteResponse = Promise<Route>;

type GetReOptimizedRouteRequest = {
    date: string;
    services: {
        id: string;
        start_time_window: string;
        end_time_window: string;
        location: {
            name: string;
            lat: number;
            lng: number;
        },
        timestamp: string;
        duration: number;
        truck_id?: string;
    }[];
    organization_id: string;
    franchise_id: string;
    operating_hours: {
        start: string;
        end: string;
    }
};

type GetReOptimizedRouteResponse = Promise<Route>;
class RouteOptimizerApi {
    async getOptimizedRoute(request: GetOptimizedRouteRequest): GetOptimizedRouteResponse {
        const {services, date, organization_id, franchise_id, operating_hours, operating_days} = request;

        console.log(services)

        // Get trucks
        const trucks = await trucksApi.getTrucks({
            organization_id: organization_id,
            franchise_id: franchise_id,
        });

        // Create a new delivery
        const body = {
            "visits": services.reduce((obj, service) => {
                obj[service.id] = {
                    "start": service.job.start_time_window
                        ? format(Date.parse(`2000-12-12T${service.job.start_time_window}`), 'HH:mm') : null,
                    "end": service.job.end_time_window
                        ? format(Date.parse(`2000-12-12T${service.job.end_time_window}`), 'HH:mm') : null,
                    "duration": service.job.duration,
                    "location": {
                        "name": service.job.location.name,
                        "lat": service.job.location.lat,
                        "lng": service.job.location.lng
                    },
                    "priority": service.job.service_type === "On-Demand" ? 10000 : 1,
                }
                return obj;
            }, {}),
            "fleet": trucks.data.reduce((obj, truck) => {
                obj[truck.id] = {
                    "start_location": {
                        "id": "depot",
                        "lat": 39.97308,
                        "lng": -86.24601
                    },
                    "shift_start": operating_hours.start,//"6:00",
                    "shift_end": operating_hours.end, //"21:00",
                }
                return obj;
            }, {}),
        };

        try {
            const response = await fetch('https://api.routific.com/v1/vrp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGFlZDc0NDZiNDJiZjAwMTgyNWE2YzUiLCJpYXQiOjE2ODkxNzk5ODN9.8Pyn7QrRSWE4Ti2N_vQwiZyT7z79WrHK887K15Uf-AY'
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            console.log(data)

            return Promise.resolve({
                date: date,
                solution: data.solution,
                unserved: data.unserved,
                error: data.error_type,
            } as Route);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }

    }


    async getReOptimizedRoute(request: GetReOptimizedRouteRequest): GetReOptimizedRouteResponse {
        const {services, date, organization_id, franchise_id, operating_hours} = request;

        console.log(services)

        const past_services = [];

        const upcoming_services = services.filter(service => {
            // always include unscheduled services (ie. services without a truck_id)
            if (!service.truck_id) return true;
            if (isBefore(Date.parse(service.timestamp), new Date())) {
                past_services.push(service);
                return false;
            } else {
                return true;
            }
        });

        console.log(upcoming_services)
        console.log(past_services)

        let start_shift;
        let most_recent_services;
        let most_recent_service;

        if (isToday(Date.parse(date))) {
            if (past_services.length === 0) {
                start_shift = format(new Date(), "HH:mm");
            } else {
                most_recent_services = past_services
                    .sort((a, b) =>
                        isAfter(addMinutes(Date.parse(b.timestamp), b.duration), addMinutes(Date.parse(b.timestamp), b.duration)) ? -1 : 1);
                most_recent_service = most_recent_services[0];

                const start_shift_timestamp = addMinutes(Date.parse(most_recent_service.timestamp), most_recent_service.duration);
                if (isBefore(start_shift_timestamp, new Date())) {
                    start_shift = format(new Date(), "HH:mm");
                } else {
                    start_shift = format(start_shift_timestamp, "HH:mm");
                }
            }

            const [hours, minutes] = start_shift.split(':');
            const [operating_hours_end_hours, operating_hours_end_minutes] = operating_hours.end.split(':');

            if (isAfter(set(new Date(), {hours: Number(hours), minutes: Number(minutes), seconds: 0}),
                        set(new Date(), {hours: Number(operating_hours_end_hours), minutes: Number(operating_hours_end_minutes), seconds: 0}))) {
                console.log("start_shift after start of operating hours")
                return Promise.reject("start_shift after end of operating hours");
            }
        }

        // Get trucks
        const trucks = await trucksApi.getTrucks({
            organization_id: organization_id,
            franchise_id: franchise_id,
        });

        // Create a new delivery
        const body = {
            "visits": upcoming_services.reduce((obj, service) => {
                obj[service.id] = {
                    "start": service.start_time_window
                        ? format(Date.parse(`2000-12-12T${service.start_time_window}`), "HH:mm")
                        : null,
                    "end": service.end_time_window
                        ? format(Date.parse(`2000-12-12T${service.end_time_window}`), "HH:mm") : null,
                    "duration": service.duration,
                    "location": {
                        "name": service.location.name,
                        "lat": service.location.lat,
                        "lng": service.location.lng
                    },
                };
                return obj;
            }, {}),
            "fleet": trucks.data.reduce((obj, truck) => {
                obj[truck.id] = {
                    "start_location": {
                        "id": uuid(), //"depot",
                        "lat": most_recent_services
                            ? (most_recent_services.find(s => s.truck_id === truck.id)?.location.lat ?? 39.97308)
                            : 39.97308,
                        "lng": most_recent_services
                            ? (most_recent_services.find(s => s.truck_id === truck.id)?.location.lng ?? -86.24601)
                            : -86.24601
                    },
                    "shift_start": start_shift ?? operating_hours.start,
                    "shift_end": operating_hours.end,
                }
                return obj;
            }, {}),
            solution: trucks.data.reduce((obj, truck) => {
                obj[truck.id] = upcoming_services
                    .filter(service => (service.truck_id ?? '') === truck.id)
                    .sort((a, b) => isBefore(Date.parse(a.timestamp), Date.parse(b.timestamp)) ? -1 : 1)
                    .map(service => service.id);
                return obj;
            }, {}),
            unserved: upcoming_services.filter(service => !service.truck_id).map(service => service.id),
        };

        console.log(body)

        try {
            const response = await fetch('https://api.routific.com/v1/fix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGFlZDc0NDZiNDJiZjAwMTgyNWE2YzUiLCJpYXQiOjE2ODkxNzk5ODN9.8Pyn7QrRSWE4Ti2N_vQwiZyT7z79WrHK887K15Uf-AY'
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            console.log(data)

            return Promise.resolve({
                date: date,
                solution: data.solution,
                unserved: data.unserved,
                error: data.error_type,
            } as Route);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }

    }

}

export const routeOptimizerApi = new RouteOptimizerApi();
