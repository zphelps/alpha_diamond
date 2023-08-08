export interface Job {
    id: string;
    organization_id: string;
    franchise_id: string;
    location: {
        id: string;
        name: string;
        street_address: string;
        city: string;
        state: string;
        zip: string;
        lat: number;
        lng: number;
    };
    on_site_contact: {
        id: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
    }
    driver_notes: string;
    summary: string;
    created_at: string;
    updated_on: string;
    origin: string;
    country: string;
    service_type: string;
    client: {
        id: string;
        name: string;
        recurring_charge: number;
        on_demand_charge: number;
    };
    timestamp?: string;
    start_time_window?: string;
    end_time_window?: string;
    duration: number;
    status: string;
    services_per_week: number;
    days_of_week: number[];
    price_model: string;
    price: number;
}

export enum PriceModel {
    MONTHLY = "Monthly",
    VALUE = "Value",
    ON_DEMAND = "On-Demand",
    ROUTED_ON_DEMAND = "Routed On-Demand",
}
