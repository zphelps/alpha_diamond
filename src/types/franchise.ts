
export interface Franchise {
    id: string;
    name: string;
    country: string;
    organization_id: string;
    region: FranchiseRegion;
    status: string;
    office_phone: string;
    office_address: string;
    mailing_address: string;
    legal_name: string;
    legal_address: string;
    legal_dba: string;
    tax_id: string;
    legal_notes: string;
    billing_address: string;
    timezone: string;
    created_on: string;
    primary_contact: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
    };
    operating_days: number[];
    operating_hours: {
        start: string;
        end: string;
    }
}

export interface FranchiseRegion {
    id: string;
    name: string;
    zip_codes: string[];
}
