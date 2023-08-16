
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
    driver_notes: string;
    job: {
        id: string;
        service_type: string;
        charge_per_unit: number;
        charge_unit: string;
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
    invoice_id?: string;
    completed_on?: string;
    num_units_to_charge?: number;
}

export enum ServiceType {
    RECURRING = "Recurring",
    ON_DEMAND = "On-Demand",
    DEMO = "Demo",
    TRIAL = "Trial",
}
