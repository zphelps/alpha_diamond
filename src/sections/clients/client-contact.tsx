import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";

interface ClientContactProps {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: number;
}
export const ClientContact: FC<ClientContactProps> = (props) => {
  const {first_name, last_name, phone_number, email} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props}>
      <CardHeader title="Primary Contact" />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Name"
          value={`${first_name} ${last_name}`}
        />
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={email}
        />
        <PropertyListItem
          align={align}
          divider
          label="Phone Number"
          value={phone_number.toString()}
        />
      </PropertyList>
      <Divider />
      <CardActions sx={{ flexWrap: 'wrap' }}>
        <Button size="small">
          View All Contacts
        </Button>
      </CardActions>
    </Card>
  );
};
