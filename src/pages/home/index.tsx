import {Seo} from "../../components/seo.tsx";
import {Button} from "@mui/material";
import {sampleRecurringJobs, sampleServices} from "../../utils/testing/service-data.ts";
import {formatDate} from "fullcalendar";
import {format} from "date-fns";
import {createWeekOfServices, Schedule} from "../../utils/testing/algorithms.ts";
export const HomePage = () => {

    const handleClick = () => {

        createWeekOfServices(sampleRecurringJobs)


        // console.log(distributeServices(schedule, sampleRecurringJobs[1], sampleRecurringJobs[1].services_per_week));

        // // Create a new delivery
        // const body = {
        //     // "visits": {
        //     //     "order_1": {
        //     //         "location": {
        //     //             "name": "Park Tudor School",
        //     //             "lat": 39.88482,
        //     //             "lng": 86.14800
        //     //         }
        //     //     },
        //     //     "order_2": {
        //     //         "location": {
        //     //             "name": "Old House",
        //     //             "lat": 39.97308,
        //     //             "lng": 86.24607
        //     //         }
        //     //     },
        //     //     "order_3": {
        //     //         "location": {
        //     //             "name": "David's House",
        //     //             "lat": 39.99074,
        //     //             "lng": 86.23338
        //     //         }
        //     //     }
        //     // },
        //     "visits": sampleServices.reduce((obj, service) => {
        //         obj[service.id] = {
        //             "start": format(service.start, 'hh:mm'),
        //             "end": format(service.end, 'hh:mm'),
        //             "duration": service.duration,
        //             "location": {
        //                 "name": service.location.name,
        //                 "lat": service.location.lat,
        //                 "lng": service.location.lng
        //             }
        //         }
        //         return obj;
        //     }, {}),
        //     "fleet": {
        //         "vehicle_1": {
        //             "start_location": {
        //                 "id": "depot",
        //                 "lat": 39.98340,
        //                 "lng": 86.26224
        //             }
        //         },
        //         // "vehicle_2": {
        //         //     "start_location": {
        //         //         "id": "depot",
        //         //         "lat": 39.98340,
        //         //         "lng": 86.26224
        //         //     }
        //         // }
        //     }
        // };
        //
        // fetch('https://api.routific.com/v1/vrp', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGFlZDc0NDZiNDJiZjAwMTgyNWE2YzUiLCJpYXQiOjE2ODkxNzk5ODN9.8Pyn7QrRSWE4Ti2N_vQwiZyT7z79WrHK887K15Uf-AY'
        //     },
        //     body: JSON.stringify(body),
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error);
        //     });
    }

    return (
        <>
            <Seo title="Home"/>

            <Button
                onClick={handleClick}
            >
                Optimize Route
            </Button>
        </>
    )
}
