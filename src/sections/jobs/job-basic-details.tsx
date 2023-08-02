import type { FC } from 'react';
import PropTypes from 'prop-types';
import {Button, capitalize, Card, CardActions, CardHeader, Typography} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {useCallback} from "react";
import {RouterLink} from "../../components/router-link.tsx";
import Link from "@mui/material/Link";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";
interface JobBasicDetailsProps {
  clientName?: string;
  clientID?: string;
  status?: string;
  serviceType?: string;
  summary: string;
  driver_notes?: string;
}

export const JobBasicDetails: FC<JobBasicDetailsProps> = (props) => {
  const { clientName, clientID, status, serviceType, summary, driver_notes } = props;

  return (
    <Card sx={{pb: 3}}>
      <CardHeader title="Overview" />
      <PropertyList>
        <PropertyListItem
            divider
            label="Client"
        >
          <Link
              component={RouterLink}
              href={`/clients/${clientID}`}
          >
            <Typography
                variant={"body2"}
            >
              {clientName}
            </Typography>
          </Link>
        </PropertyListItem>
        <PropertyListItem
            divider
            label="Status"
            value={capitalize(status)}
        />
        <PropertyListItem
            divider
            label="Service Type"
            value={serviceType}
        />
        <PropertyListItem
            divider
            label="Summary"
            value={summary}
        />
        <PropertyListItem
            label="Driver Instructions"
            value={driver_notes}
        />
      </PropertyList>
    </Card>
  );
};

JobBasicDetails.propTypes = {
  clientName: PropTypes.string,
  clientID: PropTypes.string,
  status: PropTypes.string,
  serviceType: PropTypes.string,
  summary: PropTypes.string.isRequired,
};
