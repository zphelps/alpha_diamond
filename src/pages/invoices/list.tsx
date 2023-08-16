import type {ChangeEvent, MouseEvent} from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import FilterFunnel01Icon from "@untitled-ui/icons-react/build/esm/FilterFunnel01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import type {Theme} from "@mui/material";
import {Box, Button, Card, Container, Divider, Stack, SvgIcon, Typography, useMediaQuery} from "@mui/material";
import {Invoice, InvoiceStatus} from "../../types/invoice.ts";
import {useMounted} from "../../hooks/use-mounted.ts";
import {Seo} from "../../components/seo.tsx";
import {InvoiceListSidebar} from "../../sections/invoices/invoice-list-sidebar.tsx";
import {InvoiceListContainer} from "../../sections/invoices/invoice-list-container.tsx";
import {InvoiceListSummary} from "../../sections/invoices/invoice-list-summary.tsx";
import {InvoiceListTable} from "../../sections/invoices/invoice-list-table.tsx";
import {invoicesApi} from "../../api/invoices";
import {useDispatch, useSelector} from "react-redux";
import {setFilteredInvoices, setInvoicesCount, setInvoicesStatus, upsertManyInvoices} from "../../slices/invoices";
import {setFilteredJobs, setJobCount, setJobsStatus} from "../../slices/jobs";
import {Status} from "../../utils/status.ts";
import {jobsApi} from "../../api/jobs";
import {Job} from "../../types/job.ts";
import {InvoiceListSearch} from "../../sections/invoices/invoice-list-search.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {paths} from "../../paths.ts";
import {JobListSearch} from "../../sections/jobs/job-list-search.tsx";
import {JobListTable} from "../../sections/jobs/job-list-table.tsx";

interface Filters {
    endDate?: Date;
    query?: string;
    startDate?: Date;
    status?: InvoiceStatus;
}

interface InvoicesSearchState {
    filters: Filters;
    page: number;
    rowsPerPage: number;
}

const useInvoicesSearch = () => {
    const [state, setState] = useState<InvoicesSearchState>({
        filters: {
            status: undefined,
            endDate: undefined,
            query: undefined,
            startDate: undefined
        },
        page: 0,
        rowsPerPage: 15
    });

    const handleFiltersChange = useCallback(
        (filters: Filters): void => {
            setState((prevState) => ({
                ...prevState,
                filters,
                page: 0
            }));
        },
        []
    );

    const handlePageChange = useCallback(
        (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
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

const useInvoicesStore = (searchState: InvoicesSearchState, setLoading) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleInvoicesGet = useCallback(
        async () => {
            try {
                setLoading(true);
                dispatch(setInvoicesStatus(Status.LOADING));
                const response = await invoicesApi.getInvoices(searchState);

                if (isMounted()) {
                    dispatch(setFilteredInvoices(response.data));
                    dispatch(setInvoicesCount(response.count));
                    dispatch(setInvoicesStatus(Status.SUCCESS));
                }
            } catch (err) {
                dispatch(setInvoicesStatus(Status.ERROR));
                console.error(err);
            }
            setLoading(false);
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleInvoicesGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useFilteredInvoices = (invoices: Invoice[] = []) => {
    return useMemo(
        () => {
            // if (query && invoices.length > 0) {
            //     return invoices.filter((invoice) => {
            //         return invoice.client.name.toLowerCase().includes(query.toLowerCase())
            //     });
            // }
            return Object.values(invoices);
        },
        [invoices]
    );
};

export const InvoicesPage = () => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
    const invoicesSearch = useInvoicesSearch();
    // const invoicesStore = useInvoicesStore(invoicesSearch.state);
    const [group, setGroup] = useState<boolean>(true);
    const [openSidebar, setOpenSidebar] = useState<boolean>(lgUp);

    // @ts-ignore
    const invoicesStore = useSelector((state) => state.invoices);

    const filteredInvoices = useFilteredInvoices(invoicesStore.filteredInvoices);

    const [loading, setLoading] = useState(invoicesStore.invoicesCount === 0);
    useInvoicesStore(invoicesSearch.state, setLoading)

    const handleGroupChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setGroup(event.target.checked);
        },
        []
    );

    const handleFiltersToggle = useCallback(
        (): void => {
            setOpenSidebar((prevState) => !prevState);
        },
        []
    );

    const handleFiltersClose = useCallback(
        (): void => {
            setOpenSidebar(false);
        },
        []
    );

    return (
        <>
            <Seo title="Invoices"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 3
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
                                Invoices
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={3}
                            >
                                <Button
                                    component={RouterLink}
                                    href={paths.invoices.create}
                                    startIcon={(
                                        <SvgIcon>
                                            <PlusIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="contained"
                                >
                                    Create
                                </Button>
                            </Stack>
                        </Stack>
                        <InvoiceListSummary/>
                        <Card>
                            <InvoiceListSearch
                                onFiltersChange={invoicesSearch.handleFiltersChange}
                                resultsCount={invoicesStore.invoicesCount}
                            />
                            <InvoiceListTable
                                loading={loading}
                                count={invoicesStore.invoicesCount}
                                group={group}
                                items={filteredInvoices}
                                onPageChange={invoicesSearch.handlePageChange}
                                onRowsPerPageChange={invoicesSearch.handleRowsPerPageChange}
                                page={invoicesSearch.state.page}
                                rowsPerPage={invoicesSearch.state.rowsPerPage}
                            />
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};
