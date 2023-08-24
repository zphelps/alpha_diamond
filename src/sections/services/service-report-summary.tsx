import type {FC} from "react";
import PropTypes from "prop-types";
import {Button, capitalize, Card, CardActions, CardHeader, Link, Typography} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {useCallback} from "react";
import {RouterLink} from "../../components/router-link.tsx";
import {ChargeUnit} from "../../types/job.ts";
import {Service} from "../../types/service.ts";
import {format} from "date-fns";

interface ServiceReportSummaryProps {
    service: Service;
}

export const ServiceReportSummary: FC<ServiceReportSummaryProps> = (props) => {
    const {service} = props;

    return (
        <Card sx={{pb: 3}}>
            <CardHeader title="Summary"/>
            <PropertyList>
                <PropertyListItem
                    divider
                    label="Completed On"
                    value={format(new Date(service.completed_on), "EEEE 'at' HH:mm a (M/dd/yy)")}
                />
                <PropertyListItem
                    label="Truck"
                    value={service.truck.name}
                />
            </PropertyList>
        </Card>
    );
};
