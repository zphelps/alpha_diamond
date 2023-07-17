import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Route} from "../../types/route.ts";
import {format} from "date-fns";
import {SampleService} from "../../utils/testing/service-data.ts";
import {ScheduleServiceConstraints} from "../scheduler";

type GetOptimizedRouteRequest = {
    services: ScheduleServiceConstraints[];
};

type GetOptimizedRouteResponse = Promise<Route>;
class RouteOptimizerApi {
    async getOptimizedRoute(request: GetOptimizedRouteRequest): GetOptimizedRouteResponse {
        const {services} = request;

        // Create a new delivery
        const body = {
            "visits": services.reduce((obj, service) => {
                obj[service.id] = {
                    "start": service.job.start_time_window ? format(Date.parse(`2000-12-12T${service.job.start_time_window}`), 'HH:mm') : null,
                    "end": service.job.end_time_window ? format(Date.parse(`2000-12-12T${service.job.end_time_window}`), 'HH:mm') : null,
                    "duration": service.job.duration,
                    "location": {
                        "name": service.job.location.name,
                        "lat": service.job.location.lat,
                        "lng": service.job.location.lng
                    }
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
                    "shift_start": "8:00",
                    "shift_end": "21:00",
                },
                "7740f3c9-9b30-42e8-a870-498518ecc98d": {
                    "start_location": {
                        "id": "depot",
                        "lat": 39.97308,
                        "lng": -86.24601
                    },
                    "shift_start": "8:00",
                    "shift_end": "21:00",
                }
            }
        };

        const response = await fetch('https://api.routific.com/v1/vrp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGFlZDc0NDZiNDJiZjAwMTgyNWE2YzUiLCJpYXQiOjE2ODkxNzk5ODN9.8Pyn7QrRSWE4Ti2N_vQwiZyT7z79WrHK887K15Uf-AY'
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return Promise.resolve({
            date: services[0].date,
            solution: data.solution,
            unserved: data.unserved,
        } as Route);
    }

}

export const routeOptimizerApi = new RouteOptimizerApi();
