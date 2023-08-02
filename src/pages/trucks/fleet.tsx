import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {Theme} from "@mui/material";
import {Box, Divider, Stack, Typography, useMediaQuery} from "@mui/material";
import {Seo} from "../../components/seo.tsx";
import {FleetList} from "../../sections/trucks/fleet-list.tsx";
import {Truck} from "../../types/truck.ts";
import {FleetToolbar} from "../../sections/trucks/fleet-toolbar.tsx";
import {FleetMap} from "../../sections/trucks/fleet-map.tsx";
import {FleetDrawer} from "../../sections/trucks/fleet-drawer.tsx";
import {useMounted} from "../../hooks/use-mounted.ts";
import {useDispatch, useSelector} from "react-redux";
import {clientsApi} from "../../api/clients";
import {setClientsStatus, setFilteredClients} from "../../slices/clients";
import {Status} from "../../utils/status.ts";
import {trucksApi} from "../../api/trucks";
import {setTruckStatus, upsertManyTrucks} from "../../slices/trucks";
import {useAuth} from "../../hooks/use-auth.ts";
import {Client} from "../../types/client.ts";

// const useTrucks = (): Truck[] => {
//     return [
//         {
//             id: "Truck #1",
//             location: "Carmel, IN, USA",
//             latitude: 39.95923,
//             longitude: -86.15655,
//             startedAt: "Sep 01, 7:53 AM",
//             departedAt: "Sep 01, 8:02 AM",
//             arrivedAt: "Sep 01, 8:18 AM"
//         },
//         {
//             id: "Truck #2",
//             location: "Carmel, IN, USA",
//             latitude: 39.99074,
//             longitude: -86.23345,
//             startedAt: "Sep 01, 8:21 AM",
//             departedAt: "Sep 01, 8:36 AM",
//             arrivedAt: "Sep 01, 9:54 AM"
//         },
//         {
//             id: "Truck #3",
//             location: "Zionsville, IN, USA",
//             latitude: 39.98331,
//             longitude: -86.26225,
//             startedAt: "Sep 01, 6:34 AM",
//             departedAt: "Sep 01, 7:41 AM",
//             arrivedAt: "Sep 01, 9:20 AM"
//         },
//         {
//             id: "Truck #4",
//             location: "Meridian Hills, IN, USA",
//             latitude: 39.88429,
//             longitude: -86.14803,
//             startedAt: "Sep 01, 6:34 AM",
//             departedAt: "Sep 01, 7:41 AM",
//             arrivedAt: "Sep 01, 9:20 AM"
//         },
//     ];
// };

interface TrucksSearchState {
    organization_id: string;
}

const useTrucksStore = (searchState: TrucksSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleTrucksGet = useCallback(
        async () => {
            try {
                const response = await trucksApi.getTrucks(searchState);

                if (isMounted()) {
                    dispatch(upsertManyTrucks(response.data));
                    dispatch(setTruckStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setTruckStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleTrucksGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useTrucks = (trucks: Truck[] = []) => {
    return useMemo(
        () => {
            return Object.values(trucks);
        },
        [trucks]
    );
};

export const FleetPage = () => {
    const auth = useAuth();
    const [searchState, setSearchState] = useState<TrucksSearchState>({
        organization_id: auth.user.organizationID,
    });

    const rootRef = useRef<HTMLDivElement | null>(null);
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    useTrucksStore(searchState);

    const trucksStore = useSelector((state: any) => state.trucks);

    const trucks = useTrucks(trucksStore.trucks)

    const [openDrawer, setOpenDrawer] = useState<boolean>(false);
    const [currentVehicleId, setCurrentVehicleId] = useState<string | undefined>(trucks[0]?.id);

    useEffect(() => {
        if (trucks.length > 0) {
            setCurrentVehicleId(trucks[0]?.id);
        }
    }, [trucks]);

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
            <Seo title="Dashboard: Logistics Fleet"/>
            <Divider/>
            <Box
                component="main"
                ref={rootRef}
                sx={{
                    display: "flex",
                    flex: "1 1 auto",
                    overflow: "hidden",
                    position: "relative"
                }}
            >
                {mdUp && (
                    <Box
                        sx={{
                            borderRightColor: "divider",
                            borderRightStyle: "solid",
                            borderRightWidth: 1,
                            flex: "0 0 400px"
                        }}
                    >
                        <Box sx={{p: 2}}>
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
                        flex: "1 1 auto",
                        overflow: "hidden",
                        position: "relative"
                    }}
                >
                    {!mdUp && <FleetToolbar onDrawerOpen={handleDrawerOpen}/>}
                    {currentVehicleId && <FleetMap
                        currentVehicleId={currentVehicleId}
                        onVehicleSelect={handleVehicleSelect}
                        trucks={trucks}
                    />}
                    {!currentVehicleId && <Box sx={{pt: '45vh'}}>
                        <Typography variant={'h5'} color={'text.secondary'} align={'center'}>
                            Select a vehicle from the list to view its details.
                        </Typography>
                    </Box>}
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
