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

}

export const clientUsersApi = new ClientUsersApi();
