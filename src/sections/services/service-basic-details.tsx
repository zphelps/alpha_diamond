import type {FC} from "react";
import PropTypes from "prop-types";
import {Button, Card, CardActions, CardHeader, Link, Typography} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {useCallback} from "react";
import {RouterLink} from "../../components/router-link.tsx";

interface ServiceBasicDetailsProps {
    jobID: string;
    clientID: string;
    clientName?: string;
    status?: string;
    serviceType?: string;
    total?: number;
    summary: string;
}

export const ServiceBasicDetails: FC<ServiceBasicDetailsProps> = (props) => {
    const {jobID, clientID, total, clientName, status, serviceType, summary} = props;

    const getSeverityColor = useCallback((status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "scheduled":
                return "warning";
            case "cancelled":
                return "error";
            default:
                return "info";
        }
    }, []);

    return (
        <Card sx={{pb: 3}}>
            <CardHeader title="Overview"/>
            <PropertyList>
                <PropertyListItem
                    divider
                    label="Job"
                >
                    <Link
                        component={RouterLink}
                        href={`/jobs/${jobID}`}
                    >
                        <Typography
                            variant={"body2"}
                        >
                            {`JOB-${jobID.split("-").shift().toUpperCase()}`}
                        </Typography>
                    </Link>
                </PropertyListItem>
                <PropertyListItem
                    divider
                    label="Client"
                >
                    <Link
                        component={RouterLink}
                        href={`/clients/${clientID}`}
                    >
                        <Typography
                            variant={"body2"}
                        >
                            {clientName}
                        </Typography>
                    </Link>
                </PropertyListItem>
                <PropertyListItem
                    divider
                    label="Status"
                    value={status}
                >
                    <SeverityPill color={getSeverityColor(status)}>
                        {status}
                    </SeverityPill>
                </PropertyListItem>
                <PropertyListItem
                    divider
                    label="Service Type"
                    value={serviceType}
                />
                <PropertyListItem
                    divider
                    label="Total"
                    value={`$${total}`}
                />
                <PropertyListItem
                    label="Summary"
                    value={summary}
                />
            </PropertyList>
        </Card>
    );
};

ServiceBasicDetails.propTypes = {
    clientName: PropTypes.string,
    status: PropTypes.string,
    serviceType: PropTypes.string,
    summary: PropTypes.string.isRequired,
};
