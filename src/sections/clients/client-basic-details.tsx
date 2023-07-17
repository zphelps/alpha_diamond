import type { FC } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";

interface ClientBasicDetailsProps {
  name?: string;
  type?: string;
  country?: string;
  status: string;
}

export const ClientBasicDetails: FC<ClientBasicDetailsProps> = (props) => {
  const { name, type, country, status } = props;

  return (
    <Card sx={{pb: 3}}>
      <CardHeader title="Overview" />
      <PropertyList>
        <PropertyListItem
          divider
          label="Name"
          value={name}
        />
        <PropertyListItem
          divider
          label="Type"
          value={type}
        />
        <PropertyListItem
          divider
          label="Country"
          value={country}
        />
        <PropertyListItem
          label="Status"
          value={status}
        >
          <SeverityPill color={status === 'active' ? 'success' : 'error'}>
            {status}
            </SeverityPill>
        </PropertyListItem>
      </PropertyList>
    </Card>
  );
};

ClientBasicDetails.propTypes = {
  country: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  status: PropTypes.string.isRequired,
};
