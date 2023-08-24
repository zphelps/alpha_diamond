import type {FC} from "react";
import PropTypes from "prop-types";
import {Button, capitalize, Card, CardActions, CardHeader, Link, Typography} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {useCallback} from "react";
import {RouterLink} from "../../components/router-link.tsx";
import {ChargeUnit} from "../../types/job.ts";

interface ServiceBasicDetailsProps {
    jobID: string;
    clientID: string;
    clientName?: string;
    status?: string;
    serviceType?: string;
    summary: string;
    charge_per_unit: number;
    charge_unit: ChargeUnit;
}

export const ServiceBasicDetails: FC<ServiceBasicDetailsProps> = (props) => {
    const {charge_unit, charge_per_unit, jobID, clientID, clientName, status, serviceType, summary} = props;

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
                    value={capitalize(status)}
                />
                <PropertyListItem
                    divider
                    label="Service Type"
                    value={capitalize(serviceType)}
                />
                {charge_unit === ChargeUnit.MONTH && <PropertyListItem
                    divider
                    label="Monthly Charge"
                    value={`$${charge_per_unit}`}
                />}
                {charge_unit !== ChargeUnit.MONTH && <PropertyListItem
                    divider
                    label="Charge"
                    value={`$${charge_per_unit} / ${charge_unit}`}
                />}
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
