import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Job} from "../../types/job.ts";
import {number, string} from "yup";
import {addDays, startOfDay} from "date-fns";
import {Invoice, InvoiceStatus} from "../../types/invoice.ts";

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

type GetInvoiceRequest = {
    id: string;
};

type GetInvoicesResponse = Promise<{
    data: Invoice[];
    count: number;
}>;

export type NewInvoiceRequest = {
    id: string;
    client_id: string;
}


class InvoicesApi {

    async getInvoices(request: GetInvoicesRequest = {}): GetInvoicesResponse {
        const {filters, page, rowsPerPage, sortBy, sortDir} = request;
        const query = supabase
            .from("client_invoices")
            .select("*, client:client_id(*)", {count: "exact"});

        if (typeof filters !== "undefined") {

            if (typeof filters.query !== "undefined" && filters.query !== "") {
                query.ilike("id", `%${filters.query}%`);
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
            .from("client_jobs")
            .select("*, client:client_id(id, name), location:location_id(*), on_site_contact:on_site_contact_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Job);
    }

}

export const invoicesApi = new InvoicesApi();
