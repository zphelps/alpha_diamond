import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const clientsSlice = createSlice({
    name: "clientsSlice",
    initialState: {
        clients: {},
        filteredClients: [],
        filteredClientsCount: 0,
        status: Status.IDLE,
    },
    reducers: {
        upsertManyClients: (state, action) => {
            const clients = action.payload;
            clients.forEach((client) => {
                state.clients[client.id] = Object.assign({}, state.clients[client.id], client);
            });
        },
        upsertOneClient: (state, action) => {
            const client = action.payload;
            state.clients[client.id] = Object.assign({}, state.clients[client.id], client);
        },
        setFilteredClients: (state, action) => {
            state.filteredClients = action.payload;
            state.filteredClientsCount = action.payload.length;
            clientsSlice.caseReducers.upsertManyClients(state, action);
        },
        setClientsStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyClients,
    upsertOneClient,
    setFilteredClients,
    setClientsStatus
} = clientsSlice.actions;
export default clientsSlice.reducer;
