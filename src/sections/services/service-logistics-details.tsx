import type {FC} from "react";
import type {Theme} from "@mui/material";
import {Button, Card, CardActions, CardHeader, Divider, useMediaQuery} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";

interface ServiceLogisticsDetailsProps {
    formatted_address?: string;
    timestamp?: string;
    duration?: number;
    driver_notes?: string;
}

export const ServiceLogisticsDetails: FC<ServiceLogisticsDetailsProps> = (props) => {
    const {driver_notes, formatted_address, duration, timestamp} = props;
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    const align = mdUp ? "horizontal" : "vertical";

    return (
        <Card {...props} sx={{pb: 2}}>
            <CardHeader title="Logistics"/>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Address"
                    value={formatted_address}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Scheduled For"
                    value={format(new Date(timestamp), "MM/dd/yyyy h:mm a")}
                />
                <PropertyListItem
                    divider
                    align={align}
                    label="Duration"
                    value={`${duration} minutes`}
                />
                <PropertyListItem
                    align={align}
                    label="Driver Instructions"
                    value={`${driver_notes}`}
                />
            </PropertyList>
        </Card>
    );
};


