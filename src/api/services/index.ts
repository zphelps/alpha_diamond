import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";

type GetServicesRequest = {
    jobID?: string;
    page?: number;
    rowsPerPage?: number;
};

type GetServiceResponse = Promise<Service>;

type GetServiceRequest = {
    id: string;
};

type GetServicesResponse = Promise<{
    data: Service[];
    count: number;
}>;

class ServicesApi {
    async getServices(request: GetServicesRequest = {}): GetServicesResponse {
        const {jobID, page, rowsPerPage} = request;
        const query = supabase
            .from("client_services")
            .select("*, client:client_id(id, name), on_site_contact:on_site_contact_id(*), job:job_id(id, service_type), location:location_id(*), truck:truck_id(*)", {count: "exact"});

        if (typeof jobID !== "undefined") {
            query.eq("job_id", jobID);
        }

        query.order("timestamp", {ascending: false});

        const res = await query;

        return Promise.resolve({
            data: (res.data as Service[]) ?? [],
            count: res.count ?? 0,
        });
    }

    async getService(request?: GetServiceRequest): GetServiceResponse {
        const res = await supabase
            .from("client_services")
            .select("*, client:client_id(id, name), on_site_contact:on_site_contact_id(*), job:job_id(id, service_type), location:location_id(*), truck:truck_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Service);
    }

}

export const servicesApi = new ServicesApi();
