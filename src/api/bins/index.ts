import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {Bin} from "../../types/bin.ts";

type GetBinsRequest = {
    service_id: string;
};

type GetBinsResponse = Promise<{
    data: Bin[];
    count: number;
}>;

class BinsApi {
    async getBins(request: GetBinsRequest): GetBinsResponse {
        const {service_id} = request;
        const query = supabase.from("service_bins").select("*", {count: "exact"});

        if (typeof service_id !== "undefined") {
            query.eq("service_id", service_id);
        }

        const res = await query;

        return Promise.resolve({
            data: res.data as Bin[],
            count: res.count ?? 0,
        });
    }

}

export const binsApi = new BinsApi();
