import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {addMinutes, format, isAfter, isBefore, isToday} from "date-fns";
import {SampleService} from "../../utils/testing/service-data.ts";
import {ScheduleServiceConstraints} from "../scheduler";

type GetOptimizedRouteRequest = {
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
        duration: number;
    }[];
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
};

type GetReOptimizedRouteResponse = Promise<Route>;
class RouteOptimizerApi {
    async getOptimizedRoute(request: GetOptimizedRouteRequest): GetOptimizedRouteResponse {
        const {services, date} = request;

        console.log(services)

        // Create a new delivery
        const body = {
            "visits": services.reduce((obj, service) => {
                obj[service.id] = {
                    "start": service.start_time_window
                        ? format(Date.parse(`2000-12-12T${service.start_time_window}`), 'HH:mm') : null,
                    "end": service.end_time_window
                        ? format(Date.parse(`2000-12-12T${service.end_time_window}`), 'HH:mm') : null,
                    "duration": service.duration,
                    "location": {
                        "name": service.location.name,
                        "lat": service.location.lat,
                        "lng": service.location.lng
                    },
                }
                return obj;
            }, {}),
            "fleet": {
                "8285d475-6114-4e62-b865-7168a6d2cc0a": {
                    "start_location": {
                        "id": "depot",
                        "lat": 39.97308,
                        "lng": -86.24601
                    },
                    "shift_start": "7:00",
                    "shift_end": "21:00",
                },
                "7740f3c9-9b30-42e8-a870-498518ecc98d": {
                    "start_location": {
                        "id": "depot",
                        "lat": 39.97308,
                        "lng": -86.24601
                    },
                    "shift_start": "7:00",
                    "shift_end": "21:00",
                }
            }
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
            } as Route);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }

    }


    async getReOptimizedRoute(request: GetReOptimizedRouteRequest): GetReOptimizedRouteResponse {
        const {services, date} = request;

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
        let most_recent_service;

        if (isToday(Date.parse(date))) {
            if (past_services.length === 0) {
                start_shift = format(new Date(), "HH:mm");
            } else {
                most_recent_service = past_services
                    .sort((a, b) =>
                        isAfter(addMinutes(Date.parse(b.timestamp), b.duration), addMinutes(Date.parse(b.timestamp), b.duration)) ? 1 : -1)[0];

                const start_shift_timestamp = addMinutes(Date.parse(most_recent_service.timestamp), most_recent_service.duration);
                start_shift = format(start_shift_timestamp, "HH:mm");
            }
        }

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
            "fleet": {
                "8285d475-6114-4e62-b865-7168a6d2cc0a": {
                    "start_location": {
                        "id": "depot",
                        "lat": most_recent_service ? most_recent_service.location.lat : 39.97308,
                        "lng": most_recent_service ? most_recent_service.location.lng : -86.24601
                    },
                    "shift_start": start_shift ?? "7:00",
                    "shift_end": "21:00",
                },
                "7740f3c9-9b30-42e8-a870-498518ecc98d": {
                    "start_location": {
                        "id": "depot",
                        "lat": most_recent_service ? most_recent_service.location.lat : 39.97308,
                        "lng": most_recent_service ? most_recent_service.location.lng : -86.24601
                    },
                    "shift_start": start_shift ?? "7:00",
                    "shift_end": "21:00",
                }
            },
            solution: {
                "8285d475-6114-4e62-b865-7168a6d2cc0a": upcoming_services.filter(service => (service.truck_id ?? '') === "8285d475-6114-4e62-b865-7168a6d2cc0a")
                    .sort((a, b) => isBefore(Date.parse(a.timestamp), Date.parse(b.timestamp)) ? -1 : 1).map(service => service.id),
                "7740f3c9-9b30-42e8-a870-498518ecc98d": upcoming_services.filter(service => (service.truck_id ?? '') === "7740f3c9-9b30-42e8-a870-498518ecc98d")
                    .sort((a, b) => isBefore(Date.parse(a.timestamp), Date.parse(b.timestamp)) ? -1 : 1).map(service => service.id),
            },
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

            if (data.error) {
                return Promise.resolve({error: data.error} as Route);
            }

            return Promise.resolve({
                date: date,
                solution: data.solution,
                unserved: data.unserved,
            } as Route);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }

    }

}

export const routeOptimizerApi = new RouteOptimizerApi();
