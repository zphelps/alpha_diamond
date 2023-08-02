import {Client} from "../../types/client.ts";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {Job} from "../../types/job.ts";
import {number, string} from "yup";

type UpdateJobRequest = {
    id: string;
    updated_fields: NonNullable<unknown>;
};

type UpdateJobResponse = Promise<{
    success: boolean;
}>;

type GetJobsRequest = {
    filters?: {
        query?: string;
        open?: boolean;
        completed?: boolean;
        cancelled?: boolean;
        type?: string[];
    };
    page?: number;
    rowsPerPage?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
};

type GetJobResponse = Promise<Job>;

type GetJobRequest = {
    id: string;
};

type GetJobsResponse = Promise<{
    data: Job[];
    count: number;
}>;

export type NewJobRequest = {
    id: string;
    client_id: string;
    organization_id: string;
    summary: string;
    service_type: string;
    status: string;
    timestamp?: string;
    start_time_window?: string;
    end_time_window?: string;
    duration: number;
    location_id: string;
    services_per_week?: number;
    days_of_week?: number[];
    on_site_contact_id: string;
    driver_notes: string;
}

type CreateJobResponse = Promise<{
    success: boolean;
    message: string;
}>;

class JobsApi {
    async updateJob(request: UpdateJobRequest): Promise<UpdateJobResponse> {
        const {id, updated_fields} = request;

        const {error} = await supabase.from("client_jobs").update(updated_fields).eq('id', id);

        if (error) {
            return Promise.resolve({success: false});
        }

        return Promise.resolve({success: true});
    }

    async getJobs(request: GetJobsRequest = {}): GetJobsResponse {
        const {filters, page, rowsPerPage, sortBy, sortDir} = request;
        const query = supabase.from("client_jobs").select("*, client:client_id(id, name), location:location_id(*), on_site_contact:on_site_contact_id(*)", {count: "exact"});

        if (typeof filters !== "undefined") {

            // if (typeof filters.query !== "undefined" && filters.query !== "") {
            //     // query.ilike("client.name", `%${filters.query}%`);
            //     query.textSearch("client.name", filters.query)
            // }

            if (typeof filters.open !== "undefined") {
                query.eq("status", "open");
            }

            if (typeof filters.cancelled !== "undefined") {
                query.eq("status", "cancelled");
            }

            if (typeof filters.completed !== "undefined") {
                query.eq("status", "completed");
            }

            if (typeof filters.type !== "undefined" && filters.type.length > 0) {
                query.in("service_type", filters.type);
            }
        }

        query.order("created_at", {ascending: false});

        if (typeof page !== "undefined" && typeof rowsPerPage !== "undefined") {
            query.range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
        }

        const res = await query;

        console.log(res);

        return Promise.resolve({
            data: (res.data as Job[]) ?? [],
            count: res.count ?? 0,
        });
    }

    async getJob(request?: GetJobRequest): GetJobResponse {
        const res = await supabase
            .from("client_jobs")
            .select("*, client:client_id(id, name), location:location_id(*), on_site_contact:on_site_contact_id(*)")
            .eq('id', request.id)
            .single();
        return Promise.resolve(res.data as Job);
    }

    async createJob(job: NewJobRequest): CreateJobResponse {
        const res = await supabase.from("client_jobs").insert(job);
        return Promise.resolve({
            success: res.error === null,
            message: res.error?.message ?? "",
        });
    }

}

export const jobsApi = new JobsApi();
