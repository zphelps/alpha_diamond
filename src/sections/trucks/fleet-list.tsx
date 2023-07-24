import type { FC } from 'react';
import PropTypes from 'prop-types';
import { Divider, Stack } from '@mui/material';
import {Truck} from "../../types/truck.ts";
import {FleetTruck} from "./fleet-truck.tsx";

interface FleetDetailsProps {
  currentVehicleId?: string;
  onVehicleDeselect?: () => void;
  onVehicleSelect?: (vehicleId: string) => void;
  trucks?: Truck[];
}

export const FleetList: FC<FleetDetailsProps> = (props) => {
  const { onVehicleDeselect, onVehicleSelect, currentVehicleId, trucks = [] } = props;

  return (
    <Stack
      component="ul"
      divider={<Divider />}
      sx={{
        borderBottomColor: 'divider',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        listStyle: 'none',
        m: 0,
        p: 0
      }}
    >
      {trucks.map((truck) => {
        const selected = currentVehicleId ? currentVehicleId === truck.id : false;

        return (
          <FleetTruck
            key={truck.id}
            onDeselect={onVehicleDeselect}
            onSelect={onVehicleSelect}
            selected={selected}
            truck={truck}
          />
        );
      })}
    </Stack>
  );
};

FleetList.propTypes = {
  currentVehicleId: PropTypes.string,
  onVehicleDeselect: PropTypes.func,
  onVehicleSelect: PropTypes.func,
  trucks: PropTypes.array
};
