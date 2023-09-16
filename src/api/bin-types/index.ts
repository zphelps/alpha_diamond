import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {Hauler} from "../../types/hauler.ts";
import {BinSize} from "../../types/bin-type.ts";

type CreateBinTypeRequest = {
    id: string;
    name: string;
    description: string;
    client_location_id: string;
    size: string;
    on_demand_charge: number;
    hauler_id: string;
}

type UpdateBinTypeRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
}

class BinTypesApi {
    async create(request: CreateBinTypeRequest) {
        const res = await supabase
            .from("bin_types")
            .insert(request);
        if(res.error !== null) {
            return Promise.reject(res.error);
        }
        return Promise.resolve();
    }

    async update(request: UpdateBinTypeRequest) {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("bin_types").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.reject(error);
        }

        return Promise.resolve();
    }
}

export const binTypesApi = new BinTypesApi();
