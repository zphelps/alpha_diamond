// sections
import {Seo} from "../../components/seo.tsx";
import {
    Box,
    Button,
    Card,
    Container,
    Stack,
    SvgIcon,
    Typography
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {useMounted} from "../../hooks/use-mounted.ts";
import {clientsApi} from "../../api/clients";
import {Client} from "../../types/client.ts";
import {useSelection} from "../../hooks/use-selection.tsx";
import {ClientListSearch} from "../../sections/clients/client-list-search.tsx";
import {ClientListTable} from "../../sections/clients/client-list-table.tsx";
import {
    setClientsCount,
    setClientsStatus,
    setFilteredClients,
    upsertManyClients
} from "../../slices/clients";
import {useDispatch, useSelector} from "react-redux";
import {Status} from "../../utils/status.ts";
import {useNavigate} from "react-router-dom";
import {paths} from "../../paths.ts";
import {useAuth} from "../../hooks/use-auth.ts";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

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
    inactive?: boolean;
    type?: string[];
}

interface ClientsSearchState {
    filters: Filters;
    organization_id: string;
    franchise_id: string;
    page: number;
    rowsPerPage: number;
}

const useClientsSearch = (organization_id: string, franchise_id: string) => {
    const [state, setState] = useState<ClientsSearchState>({
        filters: {
            query: undefined,
            active: undefined,
            inactive: undefined,
            type: undefined,
        },
        organization_id: organization_id,
        franchise_id: franchise_id,
        page: 0,
        rowsPerPage: 15,
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

const useClientsStore = (searchState: ClientsSearchState, setLoading) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleClientsGet = useCallback(
        async () => {
            try {
                const response = await clientsApi.getClients(searchState);

                if (isMounted()) {
                    dispatch(setFilteredClients(response.data));
                    dispatch(setClientsCount(response.count));
                    dispatch(setClientsStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setClientsStatus(Status.ERROR));
            }
            setLoading(false);
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

export default function ClientListPage() {
    const navigate = useNavigate();
    const auth = useAuth();

    // @ts-ignore
    const clientsStore = useSelector((state) => state.clients);

    const [loading, setLoading] = useState<boolean>(clientsStore.clientsCount === 0);

    const clientsSearch = useClientsSearch(auth.user.organization.id, auth.user.franchise.id);
    useClientsStore(clientsSearch.state, setLoading);

    const clientsIds = useClientsIds(clientsStore.filteredClients);
    const clientsSelection = useSelection<string>(clientsIds);

    const filteredClients = useFilteredClients(clientsStore.filteredClients);

    useEffect(() => {
        setLoading(true);
    }, [clientsSearch.state]);

    // @ts-ignore
    return (
        <>
            <Seo title="Clients"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 2
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={4}
                        >
                            <Typography variant="h4">
                                Clients
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={3}
                            >
                                <Button
                                    onClick={() => navigate(paths.clients.create)}
                                    startIcon={(
                                        <SvgIcon>
                                            <PlusIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="contained"
                                >
                                    Add
                                </Button>
                            </Stack>
                        </Stack>
                        <Card>
                            <ClientListSearch
                                resultsCount={clientsStore.clientsCount}
                                onFiltersChange={clientsSearch.handleFiltersChange}
                            />

                            <ClientListTable
                                loading={loading}
                                count={clientsStore.clientsCount}
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
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

