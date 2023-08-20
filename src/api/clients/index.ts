import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";

type GetClientsRequest = {
    filters?: {
        query?: string;
        active?: boolean;
        inactive?: boolean;
        type?: string[];
    };
    organization_id: string;
    franchise_id: string;
    page?: number;
    rowsPerPage?: number;
};

type GetClientResponse = Promise<Client>;

type GetClientRequest = {
    id: string;
};

type GetClientsResponse = Promise<{
    data: Client[];
    count: number;
}>;

type CreateClientRequest = {
    id: string;
    name: string;
    organization_id: string;
    franchise_id: string;
    country: string;
    type: string;
    status: string;
    service_contact_id: string;
    billing_contact_id: string;
    service_location_id: string;
    billing_location_id: string;
    default_monthly_charge: number;
    default_on_demand_charge: number;
    default_hourly_charge: number;
}

type CreateClientResponse = Promise<{
    success: boolean;
}>

class ClientsApi {
    async getClients(request: GetClientsRequest): GetClientsResponse {
        const {filters, page, rowsPerPage} = request;
        const query = supabase.from("clients").select("*, service_contact:service_contact_id(*), billing_contact:billing_contact_id(*), service_location:service_location_id(*), billing_location:billing_location_id(*)", {count: "exact"});

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

            if (typeof filters.type !== "undefined") {
                query.in("type", filters.type);
            }
        }

        query.eq("organization_id", request.organization_id);
        query.eq("franchise_id", request.franchise_id);

        if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
            query.range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        }

        const res = await query;

        return Promise.resolve({
            data: res.data as Client[],
            count: res.count ?? 0,
        });
    }

    async getClient(request?: GetClientRequest): GetClientResponse {
        const res = await supabase
            .from("clients")
            .select("*, service_contact:service_contact_id(*), billing_contact:billing_contact_id(*), service_location:service_location_id(*), billing_location:billing_location_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Client);
    }

    async createClient(request: CreateClientRequest): CreateClientResponse {
        const res = await supabase
            .from("clients")
            .insert([{
                id: request.id,
                name: request.name,
                organization_id: request.organization_id,
                franchise_id: request.franchise_id,
                country: request.country,
                type: request.type,
                status: request.status,
                service_contact_id: request.service_contact_id,
                service_location_id: request.service_location_id,
                billing_contact_id: request.billing_contact_id,
                billing_location_id: request.billing_location_id,
                default_monthly_charge: request.default_monthly_charge,
                default_on_demand_charge: request.default_on_demand_charge,
                default_hourly_charge: request.default_hourly_charge,
            }])

        if (res.error) {
            return Promise.reject(res.error);
        }
        return Promise.resolve({success: true});
    }

}

export const clientsApi = new ClientsApi();
