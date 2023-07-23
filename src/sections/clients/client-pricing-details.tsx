import type { FC } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";

interface ClientPricingDetailsProps {
  on_demand_charge?: string;
  recurring_charge?: string;
}

export const ClientPricingDetails: FC<ClientPricingDetailsProps> = (props) => {
  const { on_demand_charge, recurring_charge } = props;

  return (
    <Card sx={{pb: 3}}>
      <CardHeader title="Pricing" />
      <PropertyList>
        <PropertyListItem
          divider
          label="On-Demand"
          value={`$${on_demand_charge}`}
        />
        <PropertyListItem
          label="Recurring Charge (Monthly)"
          value={`$${recurring_charge}`}
        />
      </PropertyList>
    </Card>
  );
};

ClientPricingDetails.propTypes = {
  recurring_charge: PropTypes.string,
  on_demand_charge: PropTypes.string,
};
