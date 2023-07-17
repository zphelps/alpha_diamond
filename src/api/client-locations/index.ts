import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";

type GetClientLocationsRequest = {
    client_id?: string;
    page?: number;
    rowsPerPage?: number;
};

type GetClientLocationResponse = Promise<ClientLocation>;

type GetClientLocationRequest = {
    id: string;
};

type GetClientLocationsResponse = Promise<{
    data: ClientLocation[];
    count: number;
}>;

class ClientLocationsApi {
    async getClientLocations(request: GetClientLocationsRequest = {}): GetClientLocationsResponse {
        const {client_id, page, rowsPerPage} = request;
        const query = supabase.from("client_locations").select("*", {count: "exact"});

        if (typeof client_id !== "undefined") {
            query.eq("client_id", client_id);
        }

        const res = await query;

        return Promise.resolve({
            data: res.data as ClientLocation[],
            count: res.count ?? 0,
        });
    }

    async getClientLocation(request?: GetClientLocationRequest): GetClientLocationResponse {
        const res = await supabase
            .from("client_locations")
            .select("*")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as ClientLocation);
    }

}

export const clientLocationsApi = new ClientLocationsApi();
