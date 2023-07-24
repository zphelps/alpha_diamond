import { useCallback, useRef, useState } from 'react';
import type { Theme } from '@mui/material';
import { Box, Divider, Typography, useMediaQuery } from '@mui/material';
import {Seo} from "../../components/seo.tsx";
import {FleetList} from "../../sections/trucks/fleet-list.tsx";
import {Truck} from "../../types/truck.ts";
import {FleetToolbar} from "../../sections/trucks/fleet-toolbar.tsx";
import {FleetMap} from "../../sections/trucks/fleet-map.tsx";
import {FleetDrawer} from "../../sections/trucks/fleet-drawer.tsx";

const useTrucks = (): Truck[] => {
  return [
    {
      id: 'Truck #1',
      location: 'Carmel, IN, USA',
      latitude: 39.95923,
      longitude: -86.15655,
      startedAt: 'Sep 01, 7:53 AM',
      departedAt: 'Sep 01, 8:02 AM',
      arrivedAt: 'Sep 01, 8:18 AM'
    },
    {
      id: 'Truck #2',
      location: 'Carmel, IN, USA',
      latitude: 39.99074,
      longitude: -86.23345,
      startedAt: 'Sep 01, 8:21 AM',
      departedAt: 'Sep 01, 8:36 AM',
      arrivedAt: 'Sep 01, 9:54 AM'
    },
    {
      id: 'Truck #3',
      location: 'Zionsville, IN, USA',
      latitude: 39.98331,
      longitude: -86.26225,
      startedAt: 'Sep 01, 6:34 AM',
      departedAt: 'Sep 01, 7:41 AM',
      arrivedAt: 'Sep 01, 9:20 AM'
    },
      {
          id: 'Truck #4',
          location: 'Meridian Hills, IN, USA',
          latitude: 39.88429,
          longitude: -86.14803,
          startedAt: 'Sep 01, 6:34 AM',
          departedAt: 'Sep 01, 7:41 AM',
          arrivedAt: 'Sep 01, 9:20 AM'
      },
  ];
};

export const FleetPage = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const trucks = useTrucks();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [currentVehicleId, setCurrentVehicleId] = useState<string | undefined>(trucks[0]?.id);

  const handleVehicleSelect = useCallback(
    (vehicleId: string): void => {
      setCurrentVehicleId(vehicleId);
    },
    []
  );

  const handleVehicleDeselect = useCallback(
    (): void => {
      setCurrentVehicleId(undefined);
    },
    []
  );

  const handleDrawerOpen = useCallback(
    (): void => {
      setOpenDrawer(true);
    },
    []
  );

  const handleDrawerClose = useCallback(
    (): void => {
      setOpenDrawer(false);
    },
    []
  );

  return (
    <>
      <Seo title="Dashboard: Logistics Fleet" />
      <Divider />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {mdUp && (
          <Box
            sx={{
              borderRightColor: 'divider',
              borderRightStyle: 'solid',
              borderRightWidth: 1,
              flex: '0 0 400px'
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">
                Fleet
              </Typography>
            </Box>
            <FleetList
              currentVehicleId={currentVehicleId}
              onVehicleDeselect={handleVehicleDeselect}
              onVehicleSelect={handleVehicleSelect}
              trucks={trucks}
            />
          </Box>
        )}
        <Box
          sx={{
            flex: '1 1 auto',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {!mdUp && <FleetToolbar onDrawerOpen={handleDrawerOpen} />}
          <FleetMap
            currentVehicleId={currentVehicleId}
            onVehicleSelect={handleVehicleSelect}
            trucks={trucks}
          />
        </Box>
      </Box>
      {!mdUp && (
        <FleetDrawer
          container={rootRef.current}
          onClose={handleDrawerClose}
          open={openDrawer}
        >
          <FleetList
            currentVehicleId={currentVehicleId}
            onVehicleDeselect={handleVehicleDeselect}
            onVehicleSelect={handleVehicleSelect}
            trucks={trucks}
          />
        </FleetDrawer>
      )}
    </>
  );
};
