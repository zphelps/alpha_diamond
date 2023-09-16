import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {Hauler} from "../../types/hauler.ts";
import {BinSize} from "../../types/bin-type.ts";

type CreateHaulerRequest = {
    id: string;
    name: string;
    client_id?: string;
    rate: number;
    phone: number;
    email: string;
}

type UpdateBinTypeRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
}

class HaulersApi {
    async create(request: CreateHaulerRequest) {
        const res = await supabase
            .from("haulers")
            .insert(request);
        if(res.error !== null) {
            return Promise.reject(res.error);
        }
        return Promise.resolve();
    }

    async update(request: UpdateBinTypeRequest) {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("haulers").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve();
    }
}

export const haulersApi = new HaulersApi();
