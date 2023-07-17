import type { FC } from 'react';
import type { Theme } from '@mui/material';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";

interface ServiceLogisticsDetailsProps {
    street_address?: string;
    city?: string;
    state?: string;
    zip?: string;
    start?: string;
    end?: string;
    duration?: number;
}
export const ServiceLogisticsDetails: FC<ServiceLogisticsDetailsProps> = (props) => {
  const {street_address, end, zip, duration, start, city, state} = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props} sx={{pb: 2}}>
      <CardHeader title="Logistics" />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Address"
          value={`${street_address}, ${city}, ${state} ${zip}`}
        />
        <PropertyListItem
          align={align}
          divider
          label="Start"
          value={format(new Date(start), 'MM/dd/yyyy h:mm a')}
        />
        <PropertyListItem
          align={align}
          divider
          label="End"
          value={format(new Date(end), 'MM/dd/yyyy h:mm a')}
        />
          <PropertyListItem
              align={align}
              label="Duration"
              value={`${duration} minutes`}
          />
      </PropertyList>
    </Card>
  );
};

