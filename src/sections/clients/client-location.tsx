import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";

interface ClientLocationProps {
    street_address?: string;
    name?: string;
    city?: string;
    state?: string;
    zip?: number;
}
export const ClientLocation: FC<ClientLocationProps> = (props) => {
  const {street_address, city, state, zip, name} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props}>
      <CardHeader title="Primary Location" />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Name"
          value={name}
        />
        <PropertyListItem
          align={align}
          divider
          label="Street Address"
          value={street_address}
        />
        <PropertyListItem
          align={align}
          divider
          label="City"
          value={city}
        />
        <PropertyListItem
          align={align}
          divider
          label="State/Region"
          value={state}
        />
        <PropertyListItem
          align={align}
          divider
          label="Zip"
          value={zip.toString()}
        />
      </PropertyList>
      <Divider />
      <CardActions sx={{ flexWrap: 'wrap' }}>
        <Button size="small">
          View All Locations
        </Button>
      </CardActions>
    </Card>
  );
};
