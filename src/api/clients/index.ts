import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {clientLocationsApi} from "../client-locations";

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
    type: string;
    status: string;
    account_contact_id: string;
    default_monthly_charge: number;
    default_hourly_charge: number;
}

class ClientsApi {
    async getClients(request: GetClientsRequest): GetClientsResponse {
        const {filters, page, rowsPerPage} = request;
        const query = supabase.from("clients").select("*, account_contact:account_contact_id(*)", {count: "exact"});

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
        const {data: client, error} = await supabase
            .from("clients")
            .select("*, account_contact:account_contact_id(*)")
            .eq('id', request.id)
            .single();

        if (error) {
            return Promise.reject(error);
        }

        const {data: locations} = await clientLocationsApi.getClientLocations({client_id: client?.id}).catch((error) => Promise.reject(error));

        client.locations = locations;

        console.log(client)

        return Promise.resolve(client as Client);
    }

    async create(request: CreateClientRequest) {
        const res = await supabase
            .from("clients")
            .insert(request)

        if (res.error) {
            return Promise.reject(res.error);
        }
        return Promise.resolve();
    }

}

export const clientsApi = new ClientsApi();
