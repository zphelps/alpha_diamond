
export interface Route {
    date: string;
    unserved: never[];
    solution: {
        [truck_id: string]: {
            location_id: string;
            arrival_time: string;
            finish_time: string;
        }[],
    }
}
