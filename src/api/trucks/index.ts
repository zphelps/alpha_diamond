import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {Truck} from "../../types/truck.ts";

type GetTrucksRequest = {
    organization_id: string;
    franchise_id: string;
};

type GetTruckResponse = Promise<Truck>;

type GetTruckRequest = {
    id: string;
};

type GetTrucksResponse = Promise<{
    data: Truck[];
    count: number;
}>;

class TrucksApi {
    async getTrucks(request: GetTrucksRequest): GetTrucksResponse {
        const {organization_id, franchise_id} = request;
        const query = supabase
            .from("trucks")
            .select("*, driver:driver_id(*)", {count: "exact"});

        query.eq('organization_id', organization_id);
        query.eq('franchise_id', franchise_id);

        const res = await query;

        console.log(res)

        if (res.error) {
            return Promise.reject(res.error);
        }

        return Promise.resolve({
            data: (res.data as Truck[]) ?? [],
            count: res.count ?? 0,
        });
    }

    async getTruck(request?: GetTruckRequest): GetTruckResponse {
        const res = await supabase
            .from("trucks")
            .select("*, driver:driver_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Truck);
    }

}

export const trucksApi = new TrucksApi();
