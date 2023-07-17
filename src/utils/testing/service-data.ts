import {Job} from "../../types/job.ts";

export interface SampleJob {
    id: string;
    client_id: string;
    service_type: string;
    services_per_week?: number;
    days_of_week?: number[];
    date?: string;
    start_time_window?: string;
    end_time_window?: string;
    duration: number;
    location: {
        name: string;
        lat: number;
        lng: number;
    }
}

export interface SampleService {
    id: string;
    truck_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    start_time_window: string;
    end_time_window: string;
    duration: number;
    client_id: string;
    location: {
        name: string;
        lat: number;
        lng: number;
    }
}

export const sampleRecurringJobs: SampleJob[] = [
    {
        id: "1",
        client_id: "1",
        service_type: "Recurring",
        services_per_week: 3,
        days_of_week: null,
        start_time_window: "09:00",
        end_time_window: "10:00",
        duration: 30,
        location: {
            name: "Old House",
            lat: 39.97308,
            lng: 86.24607
        }
    },
    {
        id: "2",
        client_id: "2",
        service_type: "Recurring",
        services_per_week: 1,
        days_of_week: [2],
        start_time_window: "09:00",
        end_time_window: "10:00",
        duration: 30,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
    {
        id: "3",
        client_id: "3",
        service_type: "Recurring",
        services_per_week: 2,
        days_of_week: null,
        start_time_window: "13:00",
        end_time_window: "14:00",
        duration: 30,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
    {
        id: "4",
        client_id: "4",
        service_type: "Recurring",
        services_per_week: 4,
        days_of_week: null,
        start_time_window: "12:00",
        end_time_window: "13:00",
        duration: 30,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
    {
        id: "5",
        client_id: "5",
        service_type: "Recurring",
        services_per_week: 1,
        days_of_week: [1],
        start_time_window: "05:00",
        end_time_window: "6:00",
        duration: 30,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
    {
        id: "6",
        client_id: "6",
        service_type: "Recurring",
        services_per_week: 1,
        days_of_week: [1],
        start_time_window: "15:00",
        end_time_window: "16:00",
        duration: 30,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
];
export const sampleServices = [
    {
        id: 1,
        truck_id: 1,
        start: new Date(2023, 7, 12, 9, 0, 0),
        end: new Date(2023, 7, 12, 9, 30, 0),
        duration: 30,
        client_id: 1,
        location: {
            name: "Old House",
            lat: 39.97308,
            lng: 86.24607
        }
    },
    {
        id: 2,
        truck_id: 1,
        start: new Date(2023, 7, 12, 9, 0, 0),
        end: new Date(2023, 7, 12, 9, 30, 0),
        duration: 30,
        client_id: 1,
        location: {
            name: "Park Tudor School",
            lat: 39.88482,
            lng: 86.14800
        }
    },
    // {
    //     id: 3,
    //     truck_id: 1,
    //     start: new Date(2023, 7, 12, 9, 0, 0),
    //     end: new Date(2023, 7, 12, 9, 30, 0),
    //     duration: 30,
    //     location: {
    //         name: "David's House",
    //         lat: 39.99074,
    //         lng: 86.23338
    //     },
    //     client_id: 1,
    // },
]
