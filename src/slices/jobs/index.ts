import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const jobsSlice = createSlice({
    name: "jobsSlice",
    initialState: {
        jobs: {},
        filteredJobs: [],
        status: Status.IDLE,
        jobCount: 0,
    },
    reducers: {
        upsertManyJobs: (state, action) => {
            const jobs = action.payload;
            jobs.forEach((job) => {
                state.jobs[job.id] = Object.assign({}, state.jobs[job.id], job);
            });
        },
        upsertOneJob: (state, action) => {
            const job = action.payload;
            state.jobs[job.id] = Object.assign({}, state.jobs[job.id], job);
        },
        setJobCount: (state, action) => {
            state.jobCount = action.payload;
        },
        setFilteredJobs: (state, action) => {
            state.filteredJobs = action.payload;
            jobsSlice.caseReducers.upsertManyJobs(state, action);
        },
        setJobsStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyJobs,
    upsertOneJob,
    setFilteredJobs,
    setJobCount,
    setJobsStatus
} = jobsSlice.actions;
export default jobsSlice.reducer;
