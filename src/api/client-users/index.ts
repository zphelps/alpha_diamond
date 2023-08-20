import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientUser} from "../../types/client-user.ts";

type GetClientUsersRequest = {
    client_id?: string;
    page?: number;
    rowsPerPage?: number;
};

type GetClientUserResponse = Promise<ClientUser>;

type GetClientUserRequest = {
    id: string;
};

type GetClientUsersResponse = Promise<{
    data: ClientUser[];
    count: number;
}>;

type CreateClientUserRequest = {
    id: string;
    client_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

type CreateClientUserResponse = Promise<{
    success: boolean;
}>

type UpdateClientUserRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
}

type UpdateClientUserResponse = Promise<{
    success: boolean;
}>;

class ClientUsersApi {
    async getClientUsers(request: GetClientUsersRequest = {}): GetClientUsersResponse {
        const {client_id, page, rowsPerPage} = request;
        const query = supabase.from("client_users").select("*", {count: "exact"});

        if (typeof client_id !== "undefined") {
            query.eq("client_id", client_id);
        }

        const res = await query;

        return Promise.resolve({
            data: res.data as ClientUser[],
            count: res.count ?? 0,
        });
    }

    async getClientUser(request?: GetClientUserRequest): GetClientUserResponse {
        const res = await supabase
            .from("client_users")
            .select("*")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as ClientUser);
    }

    async createClientUser(request: CreateClientUserRequest): CreateClientUserResponse {
        const res = await supabase
            .from("client_users")
            .insert([request]);
        if (res.error) {
            return Promise.reject(res.error)
        }
        return Promise.resolve({
            success: true
        });
    }

    async updateClientUser(request: UpdateClientUserRequest): Promise<UpdateClientUserResponse> {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("client_users").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve({success: true});
    }

}

export const clientUsersApi = new ClientUsersApi();
