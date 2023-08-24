import {useCallback} from "react";
import {ServiceStatus, ServiceType} from "../types/service.ts";
import {colors} from "@mui/material";

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

export const getServiceScheduleBlockColor = (service_type: string, status: string) => {
    if (status === ServiceStatus.SCHEDULED) {
        switch (service_type) {
            case ServiceType.RECURRING:
                return colors.blueGrey[500];
            case ServiceType.ON_DEMAND:
                return colors.blue[500];
            case ServiceType.DEMO:
                return colors.purple[500];
            case ServiceType.TRIAL:
                return colors.pink[500];
            default:
                return colors.grey[500];
        }
    } else if (status === ServiceStatus.IN_PROGRESS) {
        return colors.amber[500];
    } else if (status === ServiceStatus.COMPLETED) {
        return colors.green[100];
    } else if (status === ServiceStatus.CANCELLED) {
        return colors.red[100];
    } else if (status === ServiceStatus.INCOMPLETE) {
        return colors.orange[300];
    }
}
