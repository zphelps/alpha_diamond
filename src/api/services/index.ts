import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Service} from "../../types/service.ts";
import {addDays, addMinutes, format, formatISO, isToday, setMinutes, startOfDay} from "date-fns";
import {ScheduleServiceConstraints} from "../scheduler";
import {Job} from "../../types/job.ts";

type UpdateServiceRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
};

type UpdateServiceResponse = Promise<{
    success: boolean;
}>;

type GetServicesRequest = {
    completed?: boolean;
    invoiced?: boolean;
    exclude_ids?: string[];
    clientID?: string;
    jobID?: string;
    organization_id: string;
    franchise_id: string;
    page?: number;
    rowsPerPage?: number;
};

type GetServiceResponse = Promise<Service>;

type GetScheduleServicesForWeekRequest = {
    beginning_of_week: string;
    service_type?: string;
};

type GetScheduleServicesForWeekResponse = Promise<ScheduleServiceConstraints[]>;

type GetServiceRequest = {
    id: string;
};

type GetServicesResponse = Promise<{
    data: Service[];
    count: number;
}>;

type GetServicesOnDateRequest = {
    date: string;
    organization_id: string;
    franchise_id: string;
};

type GetServicesOnDateResponse = Promise<{
    data: Service[];
    count: number;
}>;

export type NewServiceRequest = {
    id: string;
    client_id: string;
    organization_id: string;
    franchise_id: string;
    location_id: string;
    job_id: string;
    truck_id: string;
    summary: string;
    driver_notes: string;
    on_site_contact_id: string;
    status: string;
    timestamp?: string;
    start_time_window?: string;
    end_time_window?: string;
    duration: number;
    num_units_to_charge?: number;
}

type CreateNewServiceResponse = Promise<{
    success: boolean;
    message: string;
}>;

class ServicesApi {

    async createService(request: NewServiceRequest): CreateNewServiceResponse {
        const {data, error} = await supabase
            .from("client_services")
            .upsert(request);
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
        const {date, organization_id, franchise_id} = request;
        const query = supabase
            .from("client_services")
            .select("*, client:client_id(id, name), job:job_id(*), location:location_id(*), truck:truck_id(*)", {count: "exact"});

        const targetDate = Date.parse(date);
        const startDate = startOfDay(targetDate); //isToday(targetDate) ? setMinutes(new Date(), -60) : startOfDay(targetDate);
        const endDate = startOfDay(addDays(targetDate, 1));

        query.gte('timestamp', formatISO(startDate))
        query.lt('timestamp', formatISO(endDate));

        query.eq('organization_id', organization_id);
        query.eq('franchise_id', franchise_id);

        query.order("timestamp", {ascending: false});

        const res = await query;

        if (res.error) {
            return Promise.reject(res.error);
        }

        return Promise.resolve({
            data: (res.data as Service[]) ?? [],
            count: res.count ?? 0,
        });
    }


    /**
     * Get all services
     * @param request
     */
    async getServices(request: GetServicesRequest): GetServicesResponse {
        const {exclude_ids, jobID, clientID, page, rowsPerPage, completed, invoiced, organization_id, franchise_id} = request;
        const query = supabase
            .from("client_services")
            .select("*, client:client_id(id, name), on_site_contact:on_site_contact_id(*), job:job_id(*), location:location_id(*), truck:truck_id(*)", {count: "exact"});

        if (typeof jobID !== "undefined") {
            query.eq("job_id", jobID);
        }

        if (typeof clientID !== "undefined") {
            query.eq("client_id", clientID);
        }

        if (typeof completed !== "undefined") {
            query.eq("status", "completed");
        }

        if (typeof invoiced !== "undefined" && !invoiced) {
            query.is("invoice_id", null);
        }

        if (typeof exclude_ids !== "undefined") {
            for (const id of exclude_ids) {
                query.not("id", "eq", id);
            }
        }

        query.eq('organization_id', organization_id);
        query.eq('franchise_id', franchise_id);

        query.order("timestamp", {ascending: false});

        if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
            query.range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        }

        const res = await query;

        return Promise.resolve({
            data: (res.data as Service[]) ?? [],
            count: res.count ?? 0,
        });
    }

    /**
     * Get all services for a given week
     * @param request
     */
    async getScheduleServicesForWeek(request: GetScheduleServicesForWeekRequest): GetScheduleServicesForWeekResponse {
        const {beginning_of_week, service_type} = request;
        const query = supabase
            .from("client_services")
            .select("id, timestamp, start_time_window, end_time_window, truck_id, job:job_id(*, location:location_id(*), on_site_contact:on_site_contact_id(*), client:client_id(id, name))", {count: "exact"});

        if (typeof beginning_of_week !== "undefined") {
            query.gte("timestamp", beginning_of_week);
            query.lte("timestamp", addDays(Date.parse(beginning_of_week), 7).toISOString());
        }

        query.order("timestamp", {ascending: false});

        const res = await query;

        console.log(res)
        console.log(res.data);

        if (typeof service_type !== "undefined" && res.data) {
            // @ts-ignore
            res.data = res.data.filter((service) => service.job.service_type === service_type);
        }

        console.log(res)
        console.log(res.data);

        return Promise.resolve(res.data.map((service) => {
            return {
                id: service.id,
                date: format(Date.parse(service.timestamp), "yyyy-MM-dd"),
                truck_id: service.truck_id,
                timestamp: service.timestamp,
                start_time_window: service.start_time_window,
                end_time_window: service.end_time_window,
                // @ts-ignore
                job: service.job as Job,
            };
        }) as ScheduleServiceConstraints[]);
    }


    /**
     * Get a single service by ID
     * @param request
     */
    async getService(request?: GetServiceRequest): GetServiceResponse {
        const res = await supabase
            .from("client_services")
            .select("*, client:client_id(id, name), on_site_contact:on_site_contact_id(*), job:job_id(*), location:location_id(*), truck:truck_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Service);
    }

}

export const servicesApi = new ServicesApi();
