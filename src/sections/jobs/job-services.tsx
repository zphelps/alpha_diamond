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
    TableRow
} from "@mui/material";
import {Scrollbar} from "../../components/scrollbar.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {Service} from "../../types/service.ts";
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {useMounted} from "../../hooks/use-mounted.ts";
import {useDispatch, useSelector} from "react-redux";
import {Status} from "../../utils/status.ts";
import {servicesApi} from "../../api/services";
import {setServicesStatus, upsertManyServices} from "../../slices/services";
import {getSeverityStatusColor} from "../../utils/severity-color.ts";
import {useAuth} from "../../hooks/use-auth.ts";

interface JobServicesSearchState {
    jobID: string;
    page: number;
    rowsPerPage: number;
}

const useJobServicesSearch = (jobID: string) => {
    const [state, setState] = useState<JobServicesSearchState>({
        jobID,
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

const useJobServicesStore = (searchState: JobServicesSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();
    const auth = useAuth();

    const handleJobServicesGet = useCallback(
        async () => {
            try {
                const response = await servicesApi.getServices({
                    organization_id: auth.user?.organization_id,
                    franchise_id: auth.user?.franchise_id,
                    ...searchState
                });

                if (isMounted()) {
                    dispatch(upsertManyServices(response.data));
                    dispatch(setServicesStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setServicesStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleJobServicesGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useJobServices = (jobID: string, clientServices: Service[] = []) => {
    return useMemo(
        () => {
            return Object.values(clientServices).filter((service) => service.job.id === jobID);
        },
        [clientServices, jobID]
    );
};

interface JobServicesProps {
    jobID: string;
    clientID: string;
}

export const JobServices: FC<JobServicesProps> = (props) => {
    const {clientID, jobID, ...other} = props;

    const jobServicesSearch = useJobServicesSearch(jobID);
    useJobServicesStore(jobServicesSearch.state);

    // @ts-ignore
    const jobServicesStore = useSelector((state) => state.services);

    const filteredJobServices = useJobServices(jobID, jobServicesStore.services);

    return (
        <Card {...other}>
            <CardHeader
                // action={<MoreMenu />}
                title="Recent Services"
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
                                Scheduled For
                            </TableCell>
                            <TableCell>
                                Location
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
                        {filteredJobServices.map((service) => {
                            const issueDate = format(new Date(service.timestamp), "MM/dd/yyyy h:mm a");

                            return (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        <Link
                                            component={RouterLink}
                                            href={`/services/${service.id}`}
                                        >
                                            SER-
                                            {service.id.split("-").shift().toUpperCase()}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {service.summary}
                                    </TableCell>
                                    <TableCell>
                                        {issueDate}
                                    </TableCell>
                                    <TableCell>
                                        {`${service.location.street_address}, ${service.location.city}, ${service.location.state}`}
                                    </TableCell>
                                    <TableCell>
                                        {/*@ts-ignore*/}
                                        <SeverityPill color={getSeverityStatusColor(service.status)}>
                                            {service.status}
                                        </SeverityPill>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={RouterLink}
                                            href={`/services/${service.id}`}
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
                count={filteredJobServices.length}
                onPageChange={jobServicesSearch.handlePageChange}
                onRowsPerPageChange={jobServicesSearch.handleRowsPerPageChange}
                page={jobServicesSearch.state.page}
                rowsPerPage={jobServicesSearch.state.rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Card>
    );
};

JobServices.propTypes = {
    jobID: PropTypes.string
};
