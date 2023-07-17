import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const clientUsersSlice = createSlice({
    name: "clientUsersSlice",
    initialState: {
        users: {},
        status: Status.IDLE,
    },
    reducers: {
        upsertManyClientUsers: (state, action) => {
            const clientUsers = action.payload;
            clientUsers.forEach((user) => {
                state.users[user.client_id] = Object.assign({}, {});
                state.users[user.client_id][user.id] = Object.assign({}, state.users[user.client_id][user.id], user);
            });
        },
        upsertOneClientUser: (state, action) => {
            const clientUser = action.payload;
            state.users[clientUser.client_id] = Object.assign({}, {});
            state.users[clientUser.client_id][clientUser.id] = Object.assign({}, state.users[clientUser.client_id][clientUser.id], clientUser);
        },
        setClientUsersStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyClientUsers,
    upsertOneClientUser,
    setClientUsersStatus
} = clientUsersSlice.actions;
export default clientUsersSlice.reducer;
