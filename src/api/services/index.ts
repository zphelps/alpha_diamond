import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {addDays, addMinutes, formatISO, isToday, setMinutes, startOfDay} from "date-fns";

type UpdateServiceRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
};

type UpdateServiceResponse = Promise<{
    success: boolean;
}>;

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

type GetServicesOnDateRequest = {
    date: string;
};

type GetServicesOnDateResponse = Promise<{
    data: Service[];
    count: number;
}>;

export type NewServiceRequest = {
    id: string;
    client_id: string;
    organization_id: string;
    location_id: string;
    job_id: string;
    truck_id: string;
    summary: string;
    on_site_contact_id: string;
    status: string;
    timestamp?: string;
    start_time_window?: string;
    end_time_window?: string;
    duration: number;
}

type CreateNewServiceResponse = Promise<{
    success: boolean;
}>;

class ServicesApi {

    async createService(request: NewServiceRequest): CreateNewServiceResponse {
        const {data, error} = await supabase
            .from("client_services")
            .insert(request);
        return Promise.resolve({
            success: error === null,
            message: error?.message ?? "",
        });
    }

    async updateService(request: UpdateServiceRequest): Promise<UpdateServiceResponse> {
        const {id, updated_fields} = request;

        const {data, error} = await supabase
            .from("client_services")
            .update(updated_fields)
            .eq('id', id);

        if (error) {
            throw error;
        }

        return Promise.resolve({
            success: true,
        });
    }

    /**
     * Get all services on a given date
     * **NOTE**: if the date is today's date, only upcoming services will be returned
     * @param request
     */
    async getServicesOnDate(request: GetServicesOnDateRequest): GetServicesOnDateResponse {
        const {date} = request;
        const query = supabase
            .from("client_services")
            .select("*, client:client_id(id, name), job:job_id(*), location:location_id(*), truck:truck_id(*)", {count: "exact"});

        const targetDate = Date.parse(date);
        const startDate = startOfDay(targetDate); //isToday(targetDate) ? setMinutes(new Date(), -60) : startOfDay(targetDate);
        const endDate = startOfDay(addDays(targetDate, 1));

        console.log(targetDate, startDate, endDate);

        query.gte('timestamp', formatISO(startDate))
        query.lt('timestamp', formatISO(endDate));

        query.order("timestamp", {ascending: false});

        const res = await query;

        console.log(res);

        return Promise.resolve({
            data: (res.data as Service[]) ?? [],
            count: res.count ?? 0,
        });
    }


    /**
     * Get all services
     * @param request
     */
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


    /**
     * Get a single service by ID
     * @param request
     */
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
