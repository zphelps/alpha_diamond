import {Seo} from "../../components/seo.tsx";
import {Button} from "@mui/material";
import {sampleRecurringJobs, sampleServices} from "../../utils/testing/service-data.ts";
import {formatDate} from "fullcalendar";
import {addMinutes, differenceInMinutes, format, isAfter, isBefore, parse, set} from "date-fns";
import {createWeekOfServices, Schedule} from "../../utils/testing/algorithms.ts";
import {isEqual} from "lodash";
export const HomePage = () => {

    function doesNewJobConflict(jobs, newJob) {
        // Convert jobs to windows with duration
        const windows = jobs.filter(j => j.start_time_window && j.end_time_window).map((job) => ({
            start: set(new Date(), {hours: job.start_time_window.split(':')[0], minutes: job.start_time_window.split(':')[0], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: job.start_time_window.split(':')[0], minutes: job.start_time_window.split(':')[0], seconds: 0}), job.duration),
        }));

        // Convert new job to window with duration
        const newWindow = {
            start: set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[0], seconds: 0}),
            end: addMinutes(set(new Date(), {hours: newJob.start_time_window.split(':')[0], minutes: newJob.start_time_window.split(':')[0], seconds: 0}), newJob.duration),
        };

        let conflicts = 0;

        for (let i = newWindow.start; isBefore(i, newWindow.end) || isEqual(i, newWindow.end); i = addMinutes(i, 1)) {
            console.log("i", i);
            const jobsRunning = windows.filter(
                (window) => (isAfter(i, window.start) || isEqual(i, window.start)) && isBefore(i, window.end),
            ).length;

            if (jobsRunning >= 2) {
                conflicts++;
            }
        }

        return conflicts > 0;
    }


    const handleClick = () => {

        const existingJobs = [
            { start_time_window: '15:00:00', end_time_window: '15:30:00', duration: 30 },
            { start_time_window: '15:00:00', end_time_window: '16:00:00', duration: 30 },

            // ... more jobs
        ];

        const newJob = { start_time_window: '15:00', end_time_window: '15:30', duration: 30 };

        console.log(doesNewJobConflict(existingJobs, newJob));


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
