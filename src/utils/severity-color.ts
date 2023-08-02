import {useCallback} from "react";

export const getSeverityStatusColor = (status: string) => {
    switch (status) {
        case 'open':
            return 'success';
        case 'completed':
            return 'warning';
        case 'cancelled':
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

