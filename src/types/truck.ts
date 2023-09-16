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
    organization_id: string;
    franchise_id: string;
    status: TruckStatus;
}

export enum TruckStatus {
    INACTIVE = 'inactive',
    DAY_NOT_STARTED = 'day not started',
    DAY_COMPLETED = 'day completed',
    ON_BREAK = 'on break',
    EN_ROUTE = 'en route',
    COMPLETING_SERVICE = 'completing service',
}
