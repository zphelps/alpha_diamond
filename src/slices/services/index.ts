import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const servicesSlice = createSlice({
    name: "servicesSlice",
    initialState: {
        services: {},
        status: Status.IDLE,
    },
    reducers: {
        upsertManyServices: (state, action) => {
            const services = action.payload;
            services.forEach((service) => {
                state.services[service.id] = Object.assign({}, state.services[service.id], service);
            });
        },
        upsertOneService: (state, action) => {
            const service = action.payload;
            state.services[service.id] = Object.assign({}, state.services[service.id], service);
        },
        setServicesStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyServices,
    upsertOneService,
    setServicesStatus
} = servicesSlice.actions;
export default servicesSlice.reducer;
