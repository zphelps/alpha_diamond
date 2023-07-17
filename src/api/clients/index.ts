import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";

type GetClientsRequest = {
    filters?: {
        query?: string;
        active?: boolean;
        inactive?: boolean;
        type?: string[];
    };
    page?: number;
    rowsPerPage?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
};

type GetClientResponse = Promise<Client>;

type GetClientRequest = {
    id: string;
};

type GetClientsResponse = Promise<{
    data: Client[];
    count: number;
}>;

class ClientsApi {
    async getClients(request: GetClientsRequest = {}): GetClientsResponse {
        const {filters, page, rowsPerPage, sortBy, sortDir} = request;
        const query = supabase.from("clients").select("*, type:type_id(name)", {count: "exact"});

        if (typeof filters !== "undefined") {

            if (typeof filters.query !== "undefined" && filters.query !== "") {
                query.ilike("name", `%${filters.query}%`);
            }

            if (typeof filters.active !== "undefined") {
                query.eq("status", "active");
            }

            if (typeof filters.inactive !== "undefined") {
                query.eq("status", "inactive");
            }
        }

        // if (typeof sortBy !== "undefined" && typeof sortDir !== "undefined") {
        //     data = applySort(data, sortBy, sortDir);
        // }
        //
        // if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
        //     data = applyPagination(data, page, rowsPerPage);
        // }


        const res = await query;

        return Promise.resolve({
            data: res.data.filter((client: Client) => {
                if (typeof filters !== "undefined") {
                    if (typeof filters.type !== "undefined") {
                        return filters.type.includes(client.type.name);
                    }
                }
                return true;
            }),
            count: res.count ?? 0,
        });
    }

    async getClient(request?: GetClientRequest): GetClientResponse {
        const res = await supabase
            .from("clients")
            .select("*, type:type_id(name), primary_contact:primary_contact_id(first_name, last_name, email, phone_number), primary_location:primary_location_id(name, street_address, city, state, zip)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Client);
    }

    // getInvoices(request?: GetCustomerInvoicesRequest): GetCustomerInvoicesResponse {
    //   return Promise.resolve(deepCopy(invoices));
    // }

}

export const clientsApi = new ClientsApi();
