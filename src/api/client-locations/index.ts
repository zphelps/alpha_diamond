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

type CreateClientLocationRequest = {
    id: string;
    client_id?: string;
    name: string;
    formatted_address: string;
    lat: number;
    lng: number;
    place_id: string;
}

type CreateClientLocationResponse = Promise<{
    success: boolean;
}>

type UpdateClientLocationRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
}

type UpdateClientLocationResponse = Promise<{
    success: boolean;
}>

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


    async createClientLocation(request: CreateClientLocationRequest): CreateClientLocationResponse {
        const res = await supabase
            .from("client_locations")
            .insert([{
                id: request.id,
                client_id: request.client_id,
                name: request.name,
                formatted_address: request.formatted_address,
                place_id: request.place_id,
                lat: request.lat,
                lng: request.lng,
            }]);
        if(res.error !== null) {
            return Promise.reject(res.error);
        }
        return Promise.resolve({success: true});
    }

    async updateClientLocation(request: UpdateClientLocationRequest): UpdateClientLocationResponse {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("client_locations").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve({success: true});
    }
}

export const clientLocationsApi = new ClientLocationsApi();
