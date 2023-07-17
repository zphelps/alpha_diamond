import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useSelection} from "../../../../hooks/use-selection.tsx";
import {useMounted} from "../../../../hooks/use-mounted.ts";
import {Status} from "../../../../utils/status.ts";
import {Client} from "../../../../types/client.ts";
import {clientLocationsApi} from "../../../../api/client-locations";
import {setClientLocationsStatus, upsertManyClientLocations} from "../../../../slices/client-locations";
import {SelectClientLocationListTable} from "./select-client-location-list-table.tsx";
import {ClientLocation} from "../../../../types/client-location.ts";

// ----------------------------------------------------------------------
interface ClientLocationsSearchState {
    client_id: string;
    page: number;
    rowsPerPage: number;
}

const useClientLocationsSearch = (client_id: string) => {
    const [state, setState] = useState<ClientLocationsSearchState>({
        client_id: client_id,
        page: 0,
        rowsPerPage: 5,
    });

    const handlePageChange = useCallback(
        // @ts-ignore
        (event: (MouseEvent<HTMLButtonElement, MouseEvent> | null), page: number): void => {
            setState((prevState) => ({
                ...prevState,
                page
            }));
        },
        []
    );

    const handleRowsPerPageChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setState((prevState) => ({
                ...prevState,
                rowsPerPage: parseInt(event.target.value, 10)
            }));
        },
        []
    );

    return {
        handlePageChange,
        handleRowsPerPageChange,
        state
    };
};

const useClientLocationsStore = (searchState: ClientLocationsSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleClientLocationsGet = useCallback(
        async () => {
            try {
                const response = await clientLocationsApi.getClientLocations(searchState);

                if (isMounted()) {
                    dispatch(upsertManyClientLocations(response.data));
                    dispatch(setClientLocationsStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setClientLocationsStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleClientLocationsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useClientLocationIds = (clientLocations: ClientLocation[] = []) => {
    return useMemo(
        () => {
            return Object.keys(clientLocations);
        },
        [clientLocations]
    );
};

const useFilteredClients = (clientLocations: ClientLocation[] = []) => {
    return useMemo(
        () => {
            return Object.values(clientLocations);
        },
        [clientLocations]
    );
};
interface SelectClientLocationProps {
    client_id: string;
    setFieldValue: (field: string, value: string) => void;
}
export const SelectClientLocation: FC<SelectClientLocationProps> = (props) => {
    const {client_id, setFieldValue} = props;

    const clientLocationsSearch = useClientLocationsSearch(client_id);
    useClientLocationsStore(clientLocationsSearch.state);

    // @ts-ignore
    const clientLocationsStore = useSelector((state) => state.clientLocations);

    const clientLocationsIds = useClientLocationIds(clientLocationsStore.locations);
    const clientLocationSelection = useSelection<string>(clientLocationsIds);

    const filteredClientLocations = useFilteredClients(clientLocationsStore.locations[client_id]);

    useEffect(() => {
        if (clientLocationSelection.selected.length === 1) {
            setFieldValue('location_id', clientLocationSelection.selected[0]);
            setFieldValue('location', clientLocationsStore.locations[client_id][clientLocationSelection.selected[0]])
        } else {
            setFieldValue('location_id', null);
            setFieldValue('location', null)
        }
    }, [clientLocationSelection.selected, setFieldValue])

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 2}}
            >
                Select Location
            </Typography>
            <SelectClientLocationListTable
                count={filteredClientLocations.length}
                items={filteredClientLocations}
                onDeselectAll={clientLocationSelection.handleDeselectAll}
                onDeselectOne={clientLocationSelection.handleDeselectOne}
                onPageChange={clientLocationsSearch.handlePageChange}
                onRowsPerPageChange={clientLocationsSearch.handleRowsPerPageChange}
                onSelectAll={clientLocationSelection.handleSelectAll}
                onSelectOne={clientLocationSelection.handleSelectOne}
                page={clientLocationsSearch.state.page}
                rowsPerPage={clientLocationsSearch.state.rowsPerPage}
                selected={clientLocationSelection.selected}
            />
        </Stack>
    );
}
