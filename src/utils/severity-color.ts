import {useCallback} from "react";

export const getSeverityStatusColor = (status: string) => {
    switch (status) {
        case 'open':
            return 'success';
        case 'in-progress':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        case 'incomplete':
            return 'error';
        default:
            return 'info';
    }
};

export const getSeverityServiceTypeColor = (status: string) => {
    switch (status) {
        case 'On-Demand':
            return 'warning';
        case 'Recurring':
            return 'primary';
        case 'Demo':
            return 'secondary';
        default:
            return 'info';
    }
};

