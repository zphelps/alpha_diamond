
export interface Invoice {
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
    }
    summary: string;
    issued_on: string;
    due_on: string;
    status: string;
    items: InvoiceItem[];
    amount_paid: number;
    discount: number;
    total: number;
}

export enum InvoiceStatus {
    CANCELLED = 'cancelled',
    PAID = 'paid',
    PENDING = 'pending',
    DRAFT = 'draft',
}

export interface InvoiceItem {
    id: string;
    date: string;
    service_type: string;
    charge_per_unit: number;
    charge_unit: string;
    num_units?: number;
    description: string;
    job_id: string;
    service_ids: string[];
    total: number;
}
