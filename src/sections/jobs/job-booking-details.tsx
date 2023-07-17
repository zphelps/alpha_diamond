import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";
import PropTypes from "prop-types";
import {JobBasicDetails} from "./job-basic-details.tsx";

interface JobBookingDetailsProps {
    origin?: string;
    created_at?: string;
    updated_on?: string;
}
export const JobBookingDetails: FC<JobBookingDetailsProps> = (props) => {
  const {origin, created_at, updated_on} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props} sx={{pb: 2}}>
      <CardHeader title="Booking Details" />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Origin"
          value={origin}
        />
        <PropertyListItem
          align={align}
          divider
          label="Created On"
          value={format(new Date(created_at), 'MM/dd/yyyy h:mm a')}
        />
        <PropertyListItem
          align={align}
          divider={false}
          label="Updated On"
          value={format(new Date(updated_on), 'MM/dd/yyyy h:mm a')}
        />
      </PropertyList>
    </Card>
  );
};


