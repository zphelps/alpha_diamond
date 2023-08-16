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
import {setFilteredJobs, setJobCount, setJobsStatus} from "../../slices/jobs";
import {jobsApi} from "../../api/jobs";
import {JobListSearch} from "../../sections/jobs/job-list-search.tsx";
import {JobListTable} from "../../sections/jobs/job-list-table.tsx";
import {Job} from "../../types/job.ts";
import {paths} from "../../paths.ts";
import {RouterLink} from "../../components/router-link.tsx";
import {Loading01} from "@untitled-ui/icons-react";
import {useAuth} from "../../hooks/use-auth.ts";

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
    franchise_id?: string;
    organization_id?: string;
    page: number;
    rowsPerPage: number;
    sortBy: string;
    sortDir: 'asc' | 'desc';
}

const useJobsSearch = (organization_id: string, franchise_id: string) => {
    const [state, setState] = useState<JobsSearchState>({
        filters: {
            query: undefined,
            active: undefined,
            inactive: undefined,
            type: undefined,
        },
        franchise_id: franchise_id,
        organization_id: organization_id,
        page: 0,
        rowsPerPage: 15,
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

const useJobsStore = (searchState: JobsSearchState, setLoading) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleJobsGet = useCallback(
        async () => {
            try {
                dispatch(setJobsStatus(Status.LOADING));
                const response = await jobsApi.getJobs(searchState);

                if (isMounted()) {
                    dispatch(setFilteredJobs(response.data));
                    dispatch(setJobCount(response.count));
                    dispatch(setJobsStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setJobsStatus(Status.ERROR));
            }
            setLoading(false);
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

const useJobIds = (jobs: Job[] = []) => {
    return useMemo(
        () => {
            return Object.keys(jobs);
        },
        [jobs]
    );
};

const useFilteredJobs = (jobs: Job[] = [], query) => {
    return useMemo(
        () => {
            if (query && jobs.length > 0) {
                return jobs.filter((job) => {
                    return job.client.name.toLowerCase().includes(query.toLowerCase())
                });
            }
            return Object.values(jobs);
        },
        [jobs, query]
    );
};

export default function JobListPage() {
    const auth = useAuth();
    const jobsSearch = useJobsSearch(auth.user.organization.id, auth.user.franchise.id);

    // @ts-ignore
    const jobsStore = useSelector((state) => state.jobs);

    const [loading, setLoading] = useState(jobsStore.jobsCount === 0);
    useJobsStore(jobsSearch.state, setLoading);

    const jobIds = useJobIds(jobsStore.filteredJobs);

    const filteredJobs = useFilteredJobs(jobsStore.filteredJobs, jobsSearch.state.filters.query);

    useEffect(() => {
        setLoading(true);
    }, [jobsSearch.state])

    useEffect(() => {
        if ((filteredJobs ?? []).length > 0 && jobsSearch.state.filters.query) {
            filteredJobs.filter((job) => job.client.name.toLowerCase().includes(jobsSearch.state.filters.query.toLowerCase()))
        }
    }, [jobsSearch.state.filters.query])

    return (
        <>
            <Seo title="Jobs"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 3
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={2.5}>
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
                                resultsCount={jobsStore.jobCount}
                                onFiltersChange={jobsSearch.handleFiltersChange}
                                onSortChange={jobsSearch.handleSortChange}
                                sortBy={jobsSearch.state.sortBy}
                                sortDir={jobsSearch.state.sortDir}
                            />

                            <JobListTable
                                loading={loading}
                                count={jobsStore.jobCount}
                                items={filteredJobs}
                                onPageChange={jobsSearch.handlePageChange}
                                onRowsPerPageChange={jobsSearch.handleRowsPerPageChange}
                                page={jobsSearch.state.page}
                                rowsPerPage={jobsSearch.state.rowsPerPage}
                            />
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

