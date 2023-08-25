import type {FC} from "react";
import type {Theme} from "@mui/material";
import {Button, Card, CardActions, CardHeader, Divider, useMediaQuery} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";
import PropTypes from "prop-types";
import {JobBasicDetails} from "./job-basic-details.tsx";

interface JobServiceDetailsProps {
    timestamp?: string;
    formatted_address?: string;
    duration?: number;
    contact_name?: string;
    driver_notes?: string;
}

export const JobServiceDetails: FC<JobServiceDetailsProps> = (props) => {
    const {driver_notes, timestamp, formatted_address, contact_name, duration} = props;
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    const align = mdUp ? "horizontal" : "vertical";

    return (
        <Card {...props} sx={{pb: 2}}>
            <CardHeader title="Service Details"/>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Scheduled For"
                    value={format(new Date(timestamp), "MM/dd/yyyy h:mm a")}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Location"
                    value={formatted_address}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Duration"
                    value={`${duration} minutes`}
                />
                <PropertyListItem
                    divider
                    align={align}
                    label="On-Site Contact"
                    value={contact_name}
                />
                <PropertyListItem
                    align={align}
                    label="Driver Instructions"
                    value={driver_notes}
                />
            </PropertyList>
        </Card>
    );
};


