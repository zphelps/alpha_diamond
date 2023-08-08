
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
    line_items: {
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        job_id: string;
    }
    amount_paid: number;
    amount_due: number;
}

export enum InvoiceStatus {
    CANCELLED = 'cancelled',
    PAID = 'paid',
    PENDING = 'pending',
}
