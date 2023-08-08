import { configureStore } from '@reduxjs/toolkit'
import clientsReducer from "../slices/clients"
import jobsReducer from "../slices/jobs"
import servicesReducer from "../slices/services"
import clientLocationsReducer from "../slices/client-locations"
import clientUsersReducer from "../slices/client-users"
import trucksReducer from "../slices/trucks"
import invoicesReducer from "../slices/invoices"

export const store = configureStore({
    reducer: {
        clients: clientsReducer,
        jobs: jobsReducer,
        services: servicesReducer,
        clientLocations: clientLocationsReducer,
        clientUsers: clientUsersReducer,
        trucks: trucksReducer,
        invoices: invoicesReducer,
    },
})
