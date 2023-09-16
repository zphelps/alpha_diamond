import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {BinType} from "../../types/bin-type.ts";

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
    billing_name: string;
    billing_email: string;
    billing_phone: number;
    billing_address: string;
    service_address: string;
    service_location_latitude: number;
    service_location_longitude: number;
    on_site_contact_id: string;
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
        const query = supabase
            .from("client_locations")
            .select("*, on_site_contact:on_site_contact_id(*)", {count: "exact"});

        if (typeof client_id !== "undefined") {
            query.eq("client_id", client_id);
        }

        const res = await query;

        if (res.error) {
            return Promise.reject(res.error);
        }

        const {data: bin_types, error} = await supabase
            .from("bin_types")
            .select("*, hauler:hauler_id(*)")
            .in("client_location_id", [...res.data.map((clientLocation: ClientLocation) => clientLocation.id)]);

        if(error) {
            return Promise.reject(error);
        }

        res.data.forEach((clientLocation: ClientLocation) => {
            clientLocation.bin_types = bin_types.filter((binType: BinType) => binType.client_location_id === clientLocation.id);
        })

        return Promise.resolve({
            data: res.data as ClientLocation[],
            count: res.count ?? 0,
        });
    }

    async getClientLocation(request?: GetClientLocationRequest): GetClientLocationResponse {
        const res = await supabase
            .from("client_locations")
            .select("*, on_site_contact:on_site_contact_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as ClientLocation);
    }


    async create(request: CreateClientLocationRequest): CreateClientLocationResponse {
        const res = await supabase
            .from("client_locations")
            .insert(request);
        if(res.error !== null) {
            return Promise.reject(res.error);
        }
        return Promise.resolve({success: true});
    }

    async update(request: UpdateClientLocationRequest): UpdateClientLocationResponse {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("client_locations").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve({success: true});
    }
}

export const clientLocationsApi = new ClientLocationsApi();
