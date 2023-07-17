
export interface Client {
    id: string;
    name: string;
    organization_id: string;
    franchise_id: string;
    country: string;
    type: {
        id: string;
        name: string;
    };
    status: string;
    primary_contact: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
    primary_location: {
        name: string;
        formatted_address: string;
    };
    recurring_charge: number;
    on_demand_charge: number;
}
