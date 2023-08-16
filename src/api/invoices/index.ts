import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Job} from "../../types/job.ts";
import {number, string} from "yup";
import {addDays, startOfDay} from "date-fns";
import {Invoice, InvoiceItem, InvoiceStatus} from "../../types/invoice.ts";

type GetInvoicesRequest = {
    filters?: {
        status?: InvoiceStatus,
        endDate?: Date,
        startDate?: Date
        query?: string;
    };
    page?: number;
    rowsPerPage?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
};

type GetInvoiceResponse = Promise<Job>;

export type UpdateInvoiceRequest = {
    id: string;
    items?: InvoiceItem[];
    issued_on?: string;
    due_on?: string;
    status?: string;
    summary?: string;
    amount_paid?: number;
    discount?: number;
    total?: number;
};

type UpdateInvoiceResponse = Promise<{
    success: boolean;
}>;

type GetInvoiceRequest = {
    id: string;
};

type GetInvoicesResponse = Promise<{
    data: Invoice[];
    count: number;
}>;


export type CreateInvoiceRequest = {
    id?: string;
    items?: InvoiceItem[];
    franchise_id: string;
    client_id: string;
    organization_id: string;
    issued_on?: string;
    due_on?: string;
    status?: string;
    summary?: string;
    amount_paid?: number;
    discount?: number;
    total?: number;
}

type CreateInvoiceResponse = Promise<{
    success: boolean;
}>;
class InvoicesApi {

    async getInvoices(request: GetInvoicesRequest = {}): GetInvoicesResponse {
        const {filters, page, rowsPerPage, sortBy, sortDir} = request;
        const query = supabase
            .from("client_invoices")
            .select("*, client:client_id(*)", {count: "exact"});

        if (typeof filters !== "undefined") {

            if (typeof filters.query !== "undefined" && filters.query !== "") {
                // query.ilike("id", `%${filters.query}%`);
                // query.textSearch("client.name", filters.query)
            }

            if (typeof filters.status !== "undefined") {
                query.eq("status", filters.status);
            }

            if (typeof filters.startDate !== "undefined") {
                query.gte("issued_on", startOfDay(filters.startDate).toISOString());
            }

            if (typeof filters.endDate !== "undefined") {
                query.lte("issued_on", addDays(startOfDay(filters.endDate), 1).toISOString());
            }
        }

        query.order("issued_on", {ascending: false});

        if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
            query.range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        }

        const res = await query;

        return Promise.resolve({
            data: (res.data as Invoice[]) ?? [],
            count: res.count ?? 0,
        });
    }

    async getInvoice(request?: GetInvoiceRequest): GetInvoiceResponse {
        const res = await supabase
            .from("client_invoices")
            .select("*, client:client_id(id, name)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Job);
    }

    async createInvoice(request: CreateInvoiceRequest): CreateInvoiceResponse {
        for (const item of request.items) {
            for (const service_id of item.service_ids) {
                const res = await supabase
                    .from("client_services")
                    .update({
                        invoice_id: null,
                    })
                    .eq("id", service_id)
                    .single();
                if (res.error) {
                    return Promise.reject(res.error);
                }
            }
        }

        const res = await supabase
            .from("client_invoices")
            .insert(request)
            .single();
        if (res.error) {
            return Promise.reject(res.error);
        }
        return Promise.resolve({success: true});
    }

    async updateInvoice(request: UpdateInvoiceRequest): UpdateInvoiceResponse {
        const {data: ids, error} = await supabase
            .from("client_services")
            .select("id")
            .eq("invoice_id", request.id);
        if (error) {
            return Promise.reject(error);
        }

        for (const service of ids) {
            const res = await supabase
                .from("client_services")
                .update({
                    invoice_id: null,
                })
                .eq("id", service.id)
                .single();
            if (res.error) {
                return Promise.reject(res.error);
            }
        }

        for (const item of request.items) {
            for (const service_id of item.service_ids) {
                const res = await supabase
                    .from("client_services")
                    .update({
                        invoice_id: request.id,
                    })
                    .eq("id", service_id)
                    .single();
                if (res.error) {
                    return Promise.reject(res.error);
                }
            }
        }

        console.log(request);
        const res = await supabase
            .from("client_invoices")
            .update(request)
            .eq('id', request.id)
            .single();
        if (res.error) {
            return Promise.reject(res.error);
        }
        return Promise.resolve({success: true});
    }
}

export const invoicesApi = new InvoicesApi();
