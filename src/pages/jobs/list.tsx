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
import {useDispatch, useSelector} from "react-redux";
import {Status} from "../../utils/status.ts";
import {setFilteredJobs, setJobsCount, setJobsStatus} from "../../slices/jobs";
import {jobsApi} from "../../api/jobs";
import {JobListSearch} from "../../sections/jobs/job-list-search.tsx";
import {JobListTable} from "../../sections/jobs/job-list-table.tsx";
import {Job} from "../../types/job.ts";
import {paths} from "../../paths.ts";
import {RouterLink} from "../../components/router-link.tsx";
import {Loading01} from "@untitled-ui/icons-react";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export const _jobTypes = [
    'Recurring',
    'On-Demand',
    'Demo',
];

// ----------------------------------------------------------------------
interface Filters {
    query?: string;
    active?: boolean;
    inactive?: boolean;
    type?: string[];
}

interface JobsSearchState {
    filters: Filters;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    sortDir: 'asc' | 'desc';
}

const useJobsSearch = () => {
    const [state, setState] = useState<JobsSearchState>({
        filters: {
            query: undefined,
            active: undefined,
            inactive: undefined,
            type: undefined,
        },
        page: 0,
        rowsPerPage: 5,
        sortBy: 'updatedAt',
        sortDir: 'desc'
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

    const handleSortChange = useCallback(
        (sort: { sortBy: string; sortDir: 'asc' | 'desc'; }): void => {
            setState((prevState) => ({
                ...prevState,
                sortBy: sort.sortBy,
                sortDir: sort.sortDir
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
        handleSortChange,
        handlePageChange,
        handleRowsPerPageChange,
        state
    };
};

const useJobsStore = (searchState: JobsSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleJobsGet = useCallback(
        async () => {
            try {
                dispatch(setJobsStatus(Status.LOADING));
                const response = await jobsApi.getJobs(searchState);

                if (isMounted()) {
                    dispatch(setFilteredJobs(response.data));
                    dispatch(setJobsCount(response.count));
                    dispatch(setJobsStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setJobsStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleJobsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useJobIds = (clients: Client[] = []) => {
    return useMemo(
        () => {
            return Object.keys(clients);
        },
        [clients]
    );
};

const useFilteredJobs = (jobs: Job[] = []) => {
    return useMemo(
        () => {
            return Object.values(jobs);
        },
        [jobs]
    );
};

export default function JobListPage() {
    const jobsSearch = useJobsSearch();
    useJobsStore(jobsSearch.state);

    // @ts-ignore
    const jobsStore = useSelector((state) => state.jobs);

    const jobIds = useJobIds(jobsStore.filteredJobs);
    const jobsSelection = useSelection<string>(jobIds);

    const filteredJobs = useFilteredJobs(jobsStore.filteredJobs);

    // @ts-ignore
    return (
        <>
            <Seo title="Jobs"/>
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
                                Jobs
                            </Typography>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={3}
                            >
                                <Button
                                    component={RouterLink}
                                    href={paths.jobs.create}
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
                        <Card>
                            <JobListSearch
                                resultsCount={jobsStore.filteredJobsCount}
                                onFiltersChange={jobsSearch.handleFiltersChange}
                                onSortChange={jobsSearch.handleSortChange}
                                sortBy={jobsSearch.state.sortBy}
                                sortDir={jobsSearch.state.sortDir}
                            />

                            <JobListTable
                                count={jobsStore.jobsCount}
                                items={filteredJobs}
                                onDeselectAll={jobsSelection.handleDeselectAll}
                                onDeselectOne={jobsSelection.handleDeselectOne}
                                onPageChange={jobsSearch.handlePageChange}
                                onRowsPerPageChange={jobsSearch.handleRowsPerPageChange}
                                onSelectAll={jobsSelection.handleSelectAll}
                                onSelectOne={jobsSelection.handleSelectOne}
                                page={jobsSearch.state.page}
                                rowsPerPage={jobsSearch.state.rowsPerPage}
                                selected={jobsSelection.selected}
                            />
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

