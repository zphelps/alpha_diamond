import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const clientLocationsSlice = createSlice({
    name: "clientLocationsSlice",
    initialState: {
        locations: {},
        status: Status.IDLE,
    },
    reducers: {
        upsertManyClientLocations: (state, action) => {
            const clientLocations = action.payload;
            clientLocations.forEach((location) => {
                state.locations[location.client_id] = Object.assign({}, {});
                state.locations[location.client_id][location.id] = Object.assign({}, state.locations[location.client_id][location.id], location);
            });
        },
        upsertOneClientLocation: (state, action) => {
            const location = action.payload;
            state.locations[location.client_id] = Object.assign({}, {});
            state.locations[location.client_id][location.id] = Object.assign({}, state.locations[location.client_id][location.id], location);
        },
        setClientLocationsStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyClientLocations,
    upsertOneClientLocation,
    setClientLocationsStatus
} = clientLocationsSlice.actions;
export default clientLocationsSlice.reducer;
