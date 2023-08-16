import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import {AddBusiness, AddBusinessOutlined, AdsClick, Repeat} from "@mui/icons-material";
import {ClientListSearch} from "../../sections/clients/client-list-search.tsx";
import {ClientListTable} from "../../sections/clients/client-list-table.tsx";
import {SelectClientListSearch} from "./select-client-list-search.tsx";
import {SelectClientListTable} from "./select-client-list-table.tsx";
import {useDispatch, useSelector} from "react-redux";
import {useSelection} from "../../hooks/use-selection.tsx";
import {useMounted} from "../../hooks/use-mounted.ts";
import {clientsApi} from "../../api/clients";
import {setClientsStatus, setFilteredClients} from "../../slices/clients";
import {Status} from "../../utils/status.ts";
import {Client} from "../../types/client.ts";

export const _clientTypes = [
    'Commercial',
    'National Account',
    'Revenue Sharing',
    'Referral',
    'Training',
    'Grandfathered',
];

// ----------------------------------------------------------------------
interface Filters {
    query?: string;
    active?: boolean;
    type?: string[];
}

interface ClientsSearchState {
    filters: Filters;
    page: number;
    rowsPerPage: number;
}

const useClientsSearch = () => {
    const [state, setState] = useState<ClientsSearchState>({
        filters: {
            query: undefined,
            active: true,
            type: undefined,
        },
        page: 0,
        rowsPerPage: 5,
    });

    const handleFiltersChange = useCallback(
        (filters: Filters): void => {
            setState((prevState) => ({
                ...prevState,
                filters
            }));
        },
        []
    );

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
        handleFiltersChange,
        handlePageChange,
        handleRowsPerPageChange,
        state
    };
};

const useClientsStore = (searchState: ClientsSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleClientsGet = useCallback(
        async () => {
            try {
                const response = await clientsApi.getClients(searchState);

                if (isMounted()) {
                    dispatch(setFilteredClients(response.data));
                    dispatch(setClientsStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setClientsStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleClientsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useClientsIds = (clients: Client[] = []) => {
    return useMemo(
        () => {
            return Object.keys(clients);
        },
        [clients]
    );
};

const useFilteredClients = (clients: Client[] = []) => {
    return useMemo(
        () => {
            return Object.values(clients);
        },
        [clients]
    );
};
interface SelectClientProps {
    handleClientChange: (client?: Client) => void;
}
export const SelectClient: FC<SelectClientProps> = (props) => {
    const {handleClientChange} = props;

    const clientsSearch = useClientsSearch();
    useClientsStore(clientsSearch.state);

    // @ts-ignore
    const clientsStore = useSelector((state) => state.clients);

    const clientsIds = useClientsIds(clientsStore.filteredClients);
    const clientsSelection = useSelection<string>(clientsIds);

    const filteredClients = useFilteredClients(clientsStore.filteredClients);

    useEffect(() => {
        if (clientsSelection.selected.length === 1) {
            handleClientChange(filteredClients.find((client) => client.id === clientsSelection.selected[0]));
        } else {
            handleClientChange(null);
        }
    }, [clientsSelection.selected])

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 2}}
            >
                Select Client
            </Typography>
            <SelectClientListSearch
                resultsCount={clientsStore.filteredClientsCount}
                onFiltersChange={clientsSearch.handleFiltersChange}
            />

            <SelectClientListTable
                count={clientsStore.filteredClientsCount}
                items={filteredClients}
                onDeselectAll={clientsSelection.handleDeselectAll}
                onDeselectOne={clientsSelection.handleDeselectOne}
                onPageChange={clientsSearch.handlePageChange}
                onRowsPerPageChange={clientsSearch.handleRowsPerPageChange}
                onSelectAll={clientsSelection.handleSelectAll}
                onSelectOne={clientsSelection.handleSelectOne}
                page={clientsSearch.state.page}
                rowsPerPage={clientsSearch.state.rowsPerPage}
                selected={clientsSelection.selected}
            />
        </Stack>
    );
}
