export interface Truck {
    id: string;
    name: string;
    driver: {
        id: string;
        first_name: string;
        last_name: string;
    }
    location: string;
    latitude: number;
    longitude: number;
    startedAt: string;
    departedAt: string;
    arrivedAt: string;
}
