import {ClientContact} from "./client-contact.ts";
import {BinType} from "./bin-type.ts";

export interface ClientLocation {
    id: string;
    client_id: string;
    name: string;
    billing_name: string;
    billing_email: string;
    billing_phone: number;
    billing_address: string;
    service_address: string;
    service_location_latitude: number;
    service_location_longitude: number;
    on_site_contact: ClientContact;
    bin_types: BinType[];
    total_revenue: number;
}
