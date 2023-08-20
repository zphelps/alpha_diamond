import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";

interface ClientLocationsProps {
    service_location: {
        name?: string;
        formatted_address?: string;
    }
    billing_location: {
        name?: string;
        formatted_address?: string;
    }
}
export const ClientLocations: FC<ClientLocationsProps> = (props) => {
  const {service_location, billing_location} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props} sx={{pb: 2}}>
      <CardHeader title="Locations" />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Service"
          value={service_location.formatted_address}
        />
        <PropertyListItem
          align={align}
          label="Billing"
          value={billing_location.formatted_address}
        />
      </PropertyList>
    </Card>
  );
};
