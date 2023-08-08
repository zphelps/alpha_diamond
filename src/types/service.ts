
export interface Service {
    id: string;
    organization_id: string;
    franchise_id: string;
    client: {
        id: string;
        name: string;
    }
    location: {
        id: string;
        name: string;
        street_address: string;
        city: string;
        state: string;
        zip: string;
        lat: number;
        lng: number;
    }
    summary: string;
    job: {
        id: string;
        service_type: string;
    }
    status: string;
    issued_on: string;
    timestamp: string;
    start_time_window: string;
    end_time_window: string;
    duration: number;
    on_site_contact: {
        id: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
    }
    truck: {
        id: string;
        name: string;
        driver: {
            id: string;
            first_name: string;
            last_name: string;
        }
    }
    charge?: number;
}
