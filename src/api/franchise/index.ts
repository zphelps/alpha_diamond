import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";

type GetOperatingTimesRequest = {
    franchise_id: string;
}

type GetOperatingTimesResponse = Promise<{
    operating_hours: {
        start: string;
        end: string;
    };
    operating_days: number[];
}>;

class FranchisesApi {
    // async getClients(request: GetClientsRequest): GetClientsResponse {
    //     const {filters, page, rowsPerPage} = request;
    //     const query = supabase.from("clients").select("*, service_contact:service_contact_id(*), billing_contact:billing_contact_id(*), service_location:service_location_id(*), billing_location:billing_location_id(*)", {count: "exact"});
    //
    //     if (typeof filters !== "undefined") {
    //
    //         if (typeof filters.query !== "undefined" && filters.query !== "") {
    //             query.ilike("name", `%${filters.query}%`);
    //         }
    //
    //         if (typeof filters.active !== "undefined") {
    //             query.eq("status", "active");
    //         }
    //
    //         if (typeof filters.inactive !== "undefined") {
    //             query.eq("status", "inactive");
    //         }
    //
    //         if (typeof filters.type !== "undefined") {
    //             query.in("type", filters.type);
    //         }
    //     }
    //
    //     query.eq("organization_id", request.organization_id);
    //     query.eq("franchise_id", request.franchise_id);
    //
    //     if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
    //         query.range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
    //     }
    //
    //     const res = await query;
    //
    //     return Promise.resolve({
    //         data: res.data as Client[],
    //         count: res.count ?? 0,
    //     });
    // }
    //
    // async getClient(request?: GetClientRequest): GetClientResponse {
    //     const res = await supabase
    //         .from("clients")
    //         .select("*, service_contact:service_contact_id(*), billing_contact:billing_contact_id(*), service_location:service_location_id(*), billing_location:billing_location_id(*)")
    //         .eq('id', request.id)
    //         .single();
    //     return Promise.resolve(res.data as Client);
    // }

    async getOperatingTimes(request: GetOperatingTimesRequest): GetOperatingTimesResponse {
        const {franchise_id} = request;
        const query = supabase.from("franchises").select("operating_hours, operating_days", {count: "exact"});

        query.eq("id", franchise_id);

        const res = await query.single();

        if (res.error) {
            return Promise.reject(res.error)
        }

        return Promise.resolve({
            operating_hours: res.data.operating_hours,
            operating_days: res.data.operating_days,
        });
    }

}

export const franchisesApi = new FranchisesApi();
