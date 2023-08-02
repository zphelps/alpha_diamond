import { configureStore } from '@reduxjs/toolkit'
import clientsReducer from "../slices/clients"
import jobsReducer from "../slices/jobs"
import servicesReducer from "../slices/services"
import clientLocationsReducer from "../slices/client-locations"
import clientUsersReducer from "../slices/client-users"
import trucksReducer from "../slices/trucks"

export const store = configureStore({
    reducer: {
        clients: clientsReducer,
        jobs: jobsReducer,
        services: servicesReducer,
        clientLocations: clientLocationsReducer,
        clientUsers: clientUsersReducer,
        trucks: trucksReducer,
        // groupFeed: groupFeedReducer,
        // announcements: announcementsReducer,
        // calendarEvents: calendarEventsReducer,
        // groupEvents: groupEvents,
        // groups: groupsReducer,
        // forms: formsReducer,
        // groupMembers: groupMembersReducer,
        // conversations: conversationsReducer,
        // payments: paymentsReducer,
    },
})
