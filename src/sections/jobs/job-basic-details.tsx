import type { FC } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader } from '@mui/material';
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {useCallback} from "react";
import {RouterLink} from "../../components/router-link.tsx";
import {Link} from "react-router-dom";

interface JobBasicDetailsProps {
  clientName?: string;
  status?: string;
  serviceType?: string;
  summary: string;
}

export const JobBasicDetails: FC<JobBasicDetailsProps> = (props) => {
  const { clientName, status, serviceType, summary } = props;

  const getSeverityColor = useCallback((status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'completed':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  }, []);

  return (
    <Card sx={{pb: 3}}>
      <CardHeader title="Overview" />
      <PropertyList>
        <PropertyListItem
          divider
          label="Client"
          value={clientName}
        />
        <PropertyListItem
            divider
            label="Status"
            value={status}
        >
          <SeverityPill color={getSeverityColor(status)}>
            {status}
          </SeverityPill>
        </PropertyListItem>
        <PropertyListItem
          divider
          label="Service Type"
          value={serviceType}
        />
        <PropertyListItem
            label="Summary"
            value={summary}
        />
      </PropertyList>
    </Card>
  );
};

JobBasicDetails.propTypes = {
  clientName: PropTypes.string,
  status: PropTypes.string,
  serviceType: PropTypes.string,
  summary: PropTypes.string.isRequired,
};
