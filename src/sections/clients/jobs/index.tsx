import type {FC} from "react";
import PropTypes from "prop-types";
import {format} from "date-fns";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {
    Card,
    CardHeader,
    IconButton, Link,
    SvgIcon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow, Typography
} from "@mui/material";
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useMounted} from "../../../hooks/use-mounted.ts";
import {useAuth} from "../../../hooks/use-auth.ts";
import {jobsApi} from "../../../api/jobs";
import {setFilteredJobs, setJobsStatus, upsertManyJobs} from "../../../slices/jobs";
import {Status} from "../../../utils/status.ts";
import {Job} from "../../../types/job.ts";
import {Scrollbar} from "../../../components/scrollbar.tsx";
import {RouterLink} from "../../../components/router-link.tsx";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../../utils/severity-color.ts";
import {SeverityPill} from "../../../components/severity-pill.tsx";
import {getJobRecurrenceDescription} from "../../../utils/job-recurrence-description.ts";

interface ClientJobsSearchState {
    client_id: string;
    page: number;
    rowsPerPage: number;
    organization_id: string;
    franchise_id: string;
}

const useClientJobsSearch = (client_id: string, organization_id: string, franchise_id: string) => {
    const [state, setState] = useState<ClientJobsSearchState>({
        client_id: client_id,
        page: 0,
        rowsPerPage: 5,
        organization_id: organization_id,
        franchise_id: franchise_id
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

const useClientJobsStore = (searchState: ClientJobsSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleClientJobsGet = useCallback(
        async () => {
            try {

                console.log(searchState)
                const response = await jobsApi.getJobs(searchState);

                if (isMounted()) {
                    dispatch(upsertManyJobs(response.data));
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
            handleClientJobsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useClientJobs = (client_id: string, clientJobs: Job[] = []) => {
    return useMemo(
        () => {
            return Object.values(clientJobs).filter((job) => job.client.id === client_id);
        },
        [clientJobs, client_id]
    );
};

interface ClientJobsProps {
    clientID: string;
}

export const ClientJobs: FC<ClientJobsProps> = (props) => {
    const {clientID, ...other} = props;
    const auth = useAuth();

    const clientJobsSearch = useClientJobsSearch(clientID, auth.user.organization.id, auth.user.franchise.id);
    useClientJobsStore(clientJobsSearch.state);

    // @ts-ignore
    const clientJobsStore = useSelector((state) => state.jobs);

    const filteredClientJobs = useClientJobs(clientID, clientJobsStore.jobs);

    return (
        <Card {...other}>
            <CardHeader
                title="Jobs"
            />
            <Scrollbar>
                <Table sx={{minWidth: 600}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                #
                            </TableCell>
                            <TableCell>
                                Summary
                            </TableCell>
                            <TableCell>
                                When
                            </TableCell>
                            <TableCell>
                                Type
                            </TableCell>
                            <TableCell>
                                Status
                            </TableCell>
                            <TableCell align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredClientJobs.length > 0 && filteredClientJobs.map((job) => {
                            return (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        <Link
                                            component={RouterLink}
                                            href={`/jobs/${job.id}`}
                                        >
                                            JOB-
                                            {job.id.split("-").shift().toUpperCase()}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {job.summary}
                                    </TableCell>
                                    <TableCell>
                                        {getJobRecurrenceDescription(job)}
                                    </TableCell>
                                    <TableCell>
                                        {/*@ts-ignore*/}
                                        <SeverityPill color={getSeverityServiceTypeColor(job.service_type)}>
                                            {job.service_type}
                                        </SeverityPill>
                                    </TableCell>
                                    <TableCell>
                                        {/*@ts-ignore*/}
                                        <SeverityPill color={getSeverityStatusColor(job.status)}>
                                            {job.status}
                                        </SeverityPill>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={RouterLink}
                                            href={`/jobs/${job.id}`}
                                        >
                                            <SvgIcon>
                                                <ArrowRightIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={filteredClientJobs.length}
                onPageChange={clientJobsSearch.handlePageChange}
                onRowsPerPageChange={clientJobsSearch.handleRowsPerPageChange}
                page={clientJobsSearch.state.page}
                rowsPerPage={clientJobsSearch.state.rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Card>
    );
};

ClientJobs.propTypes = {
    clientID: PropTypes.string
};
