import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const trucksSlice = createSlice({
    name: "trucksSlice",
    initialState: {
        trucks: {},
        status: Status.IDLE,
    },
    reducers: {
        upsertManyTrucks: (state, action) => {
            const trucks = action.payload;
            trucks.forEach((service) => {
                state.trucks[service.id] = Object.assign({}, state.trucks[service.id], service);
            });
        },
        upsertOneTruck: (state, action) => {
            const truck = action.payload;
            state.trucks[truck.id] = Object.assign({}, state.trucks[truck.id], truck);
        },
        setTruckStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyTrucks,
    upsertOneTruck,
    setTruckStatus
} = trucksSlice.actions;
export default trucksSlice.reducer;
