import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const jobsSlice = createSlice({
    name: "jobsSlice",
    initialState: {
        jobs: {},
        filteredJobs: [],
        jobsCount: 0,
        status: Status.IDLE,
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
        setFilteredJobs: (state, action) => {
            state.filteredJobs = action.payload;
            jobsSlice.caseReducers.upsertManyJobs(state, action);
        },
        setJobsCount: (state, action) => {
            state.jobsCount = action.payload;
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
    setJobsCount,
    setJobsStatus
} = jobsSlice.actions;
export default jobsSlice.reducer;
