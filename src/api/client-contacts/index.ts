import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";

type GetClientContactsRequest = {
    client_id?: string;
    page?: number;
    rowsPerPage?: number;
};

type GetClientContactResponse = Promise<ClientContact>;

type GetClientContactRequest = {
    id: string;
};

type GetClientContactsResponse = Promise<{
    data: ClientContact[];
    count: number;
}>;

type CreateClientContactRequest = {
    id: string;
    client_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: number;
}

type CreateClientContactResponse = Promise<{
    success: boolean;
}>

type UpdateClientContactRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
}

type UpdateClientContactResponse = Promise<{
    success: boolean;
}>;

class ClientContactsApi {
    async getClientContacts(request: GetClientContactsRequest = {}): GetClientContactsResponse {
        const {client_id, page, rowsPerPage} = request;
        const query = supabase.from("client_contacts").select("*", {count: "exact"});

        if (typeof client_id !== "undefined") {
            query.eq("client_id", client_id);
        }

        const res = await query;

        return Promise.resolve({
            data: res.data as ClientContact[],
            count: res.count ?? 0,
        });
    }

    async getClientContact(request?: GetClientContactRequest): GetClientContactResponse {
        const res = await supabase
            .from("client_contacts")
            .select("*")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as ClientContact);
    }

    async create(request: CreateClientContactRequest): CreateClientContactResponse {
        const res = await supabase
            .from("client_contacts")
            .insert([request]);
        if (res.error) {
            return Promise.reject(res.error)
        }
        return Promise.resolve({
            success: true
        });
    }

    async update(request: UpdateClientContactRequest): Promise<UpdateClientContactResponse> {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("client_contacts").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve({success: true});
    }

}

export const clientContactsApi = new ClientContactsApi();
