import type {FC} from "react";
import PropTypes from "prop-types";
import {Button, Card, CardActions, CardHeader, Typography} from "@mui/material";
import {PropertyList} from "../../../../components/property-list.tsx";
import {PropertyListItem} from "../../../../components/property-list-item.tsx";
import {SeverityPill} from "../../../../components/severity-pill.tsx";

interface ClientPricingDetailsProps {
    monthly_charge?: string;
    hourly_charge?: string;
}

export const ClientPricing: FC<ClientPricingDetailsProps> = (props) => {
    const {monthly_charge, hourly_charge} = props;

    return (
        <Card sx={{pb: 3}}>
            <CardHeader title="Pricing"/>
            <PropertyList>
                <PropertyListItem
                    divider
                    align={'horizontal'}
                    label="Monthly Charge"
                    value={`$${monthly_charge}`}
                />
                <PropertyListItem
                    divider
                    align={'horizontal'}
                    label="Hourly Charge"
                    value={`$${hourly_charge}`}
                />
                <PropertyListItem
                    align={'horizontal'}
                    label="On-Demand Charge"
                    value={`$${hourly_charge}`}
                >
                    <Typography variant={'body2'} color={'text.secondary'}>
                        *Varies by location/bin type
                    </Typography>
                </PropertyListItem>
            </PropertyList>
        </Card>
    );
};

ClientPricing.propTypes = {
    monthly_charge: PropTypes.string,
    hourly_charge: PropTypes.string,
};
