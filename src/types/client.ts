
export interface Client {
    id: string;
    name: string;
    organization_id: string;
    franchise_id: string;
    country: string;
    type: string;
    status: string;
    service_contact: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
    billing_contact: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    }
    service_location: {
        name: string;
        formatted_address: string;
    };
    billing_location: {
        name: string;
        formatted_address: string;
    }
    default_monthly_charge: number;
    default_on_demand_charge: number;
    default_hourly_charge: number;
}
