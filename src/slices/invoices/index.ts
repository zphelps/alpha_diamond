import { createSlice } from "@reduxjs/toolkit";
import {Status} from "../../utils/status";

const invoicesSlice = createSlice({
    name: "invoicesSlice",
    initialState: {
        invoices: {},
        filteredInvoices: [],
        status: Status.IDLE,
        invoicesCount: 0,
    },
    reducers: {
        upsertManyInvoices: (state, action) => {
            const invoices = action.payload;
            invoices.forEach((invoice) => {
                state.invoices[invoice.id] = Object.assign({}, state.invoices[invoice.id], invoice);
            });
        },
        upsertOneInvoice: (state, action) => {
            const invoice = action.payload;
            state.invoices[invoice.id] = Object.assign({}, state.invoices[invoice.id], invoice);
        },
        setInvoicesCount: (state, action) => {
            state.invoicesCount = action.payload;
        },
        setFilteredInvoices: (state, action) => {
            state.filteredInvoices = action.payload;
            invoicesSlice.caseReducers.upsertManyInvoices(state, action);
        },
        setInvoicesStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const {
    upsertManyInvoices,
    upsertOneInvoice,
    setInvoicesCount,
    setFilteredInvoices,
    setInvoicesStatus
} = invoicesSlice.actions;
export default invoicesSlice.reducer;
