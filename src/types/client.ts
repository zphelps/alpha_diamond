import {ClientLocation} from "./client-location.ts";
import {ClientContact} from "./client-contact.ts";

export interface Client {
    id: string;
    name: string;
    organization_id: string;
    franchise_id: string;
    type: string;
    status: string;
    account_contact: ClientContact;
    locations: ClientLocation[];
    default_monthly_charge: number;
    default_hourly_charge: number;

}
