import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";

interface ServiceOnSiteContactProps {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: number;
}
export const ServiceOnSiteContact: FC<ServiceOnSiteContactProps> = (props) => {
  const {first_name, last_name, phone_number, email} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props} sx={{pb: 2}}>
      <CardHeader title="On-Site Contact" />
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
          label="Phone Number"
          value={phone_number.toString()}
        />
      </PropertyList>
    </Card>
  );
};
