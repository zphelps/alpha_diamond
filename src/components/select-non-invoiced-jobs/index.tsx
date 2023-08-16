import 'react'
import {Scrollbar} from "../scrollbar.tsx";
import {
    Box,
    Button, Card,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Skeleton from "@mui/material/Skeleton";
import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {useSelection} from "../../hooks/use-selection.tsx";
import {Service} from "../../types/service.ts";
import {endOfMonth, format} from "date-fns";
import {useMounted} from "../../hooks/use-mounted.ts";
import {servicesApi} from "../../api/services";
import {SeverityPill} from "../severity-pill.tsx";
import {getSeverityServiceTypeColor} from "../../utils/severity-color.ts";
import {ChargeUnit} from "../../types/job.ts";
import {KeyboardArrowDown, KeyboardArrowUp} from "@mui/icons-material";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {useAuth} from "../../hooks/use-auth.ts";

interface JobServicesSearchState {
    invoiced: boolean;
    completed: boolean;
    exclude_ids?: string[];
    clientID: string;
    organization_id: string;
    franchise_id: string;
    page: number;
    rowsPerPage: number;
}

const useClientServicesSearch = (clientID: string, existing_service_ids: string[], organization_id: string, franchise_id: string) => {
    const [state, setState] = useState<JobServicesSearchState>({
        clientID: clientID,
        invoiced: false,
        exclude_ids: existing_service_ids,
        completed: true,
        organization_id: organization_id,
        franchise_id: franchise_id,
        page: 0,
        rowsPerPage: 5,
    });

    const handleClientIDChange = useCallback(
        (clientID: string): void => {
            setState((prevState) => ({
                ...prevState,
                clientID
            }));
        }, []);

    const handleExcludeIDsChange = useCallback(
        (exclude_ids: string[]): void => {
            setState((prevState) => ({
                ...prevState,
                exclude_ids
            }));
        }, []);

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
        handleClientIDChange,
        handleExcludeIDsChange,
        state
    };
};

export interface NonInvoicedClientJob {
    id: string;
    charge_unit: string;
    service_type: string;
    charge_per_unit?: number;
    services: Service[];
}

interface ClientJobsStoreState {
    jobs: {
        [id: string]: NonInvoicedClientJob;
    };
    jobsCount: number;
}

/**
 * Get the row identifier for a job (month + job id)
 * @param completedOn
 * @param jobID
 */
const getJobRowIdentifier = (completedOn: string, jobID: string) => {
    return `${format(Date.parse(completedOn), 'M')}-${jobID}`;
}

const useClientServicesStore = (searchState: JobServicesSearchState) => {
    const isMounted = useMounted();
    const [state, setState] = useState<ClientJobsStoreState>({
        jobs: {},
        jobsCount: 0
    });

    const handleClientServicesGet = useCallback(
        async () => {
            try {
                console.log(searchState)
                const response = await servicesApi.getServices(searchState);

                const services = response.data;

                console.log(services);

                if (isMounted()) {
                    setState({
                        jobs: services.reduce((jobs, service) => {
                            if (jobs[getJobRowIdentifier(service.completed_on, service.job.id)]) {
                                jobs[service.job.id].services.push(service);
                            } else {
                                jobs[getJobRowIdentifier(service.completed_on, service.job.id)] = {
                                    id: service.job.id,
                                    charge_unit: service.job.charge_unit,
                                    service_type: service.job.service_type,
                                    charge_per_unit: service.job.charge_per_unit,
                                    services: [service]
                                };
                            }
                            return jobs;
                        }, {}),
                        jobsCount: response.count
                    });
                }
            } catch (err) {
                console.error(err);
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleClientServicesGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );

    return {
        ...state
    };
};

const useClientServices = (clientJobsStoreState: ClientJobsStoreState) => {
    return useMemo(
        () => {
            return Object.values(clientJobsStoreState.jobs); //.filter((service) => !service.invoice_id && service.completed_on);
        },
        [clientJobsStoreState.jobs]
    );
};

const useClientServicesIds = (clientJobs: NonInvoicedClientJob[] = []) => {
    return useMemo(
        () => {
            return Object.values(clientJobs).map((job) => getJobRowIdentifier(job.services[0].completed_on, job.id));
        },
        [clientJobs]
    );
};

function Row(props: { job: NonInvoicedClientJob, selectedAll: boolean, selectedSome: boolean, clientServicesSelection: any }) {
    const {job, clientServicesSelection, selectedSome, selectedAll} = props;
    const [open, setOpen] = React.useState(false);
    const isSelected = clientServicesSelection.selected.includes(getJobRowIdentifier(job.services[0].completed_on, job.id));
    return (
        <>
            <TableRow key={job.id} selected={isSelected} sx={{"& > *": {borderBottom: "unset"}}}>
                <TableCell padding="checkbox" align={"center"}>
                    <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                            if (event.target.checked) {
                                clientServicesSelection.handleSelectOne(getJobRowIdentifier(job.services[0].completed_on, job.id));
                            } else {
                                clientServicesSelection.handleDeselectOne(getJobRowIdentifier(job.services[0].completed_on, job.id));
                            }
                        }}
                    />
                </TableCell>
                <TableCell
                    onClick={() => setOpen(!open)}
                >
                    <Typography variant={'body2'} sx={{letterSpacing: 0.2}}>
                        #{job.id.split("-").shift().toUpperCase()}
                    </Typography>

                </TableCell>
                <TableCell align={"center"}>
                    {format(Date.parse(job.services[0].completed_on), "MMMM")}
                </TableCell>
                <TableCell align={"center"}>
                    <SeverityPill
                        color={getSeverityServiceTypeColor(job.service_type)}
                    >
                        {job.service_type}
                    </SeverityPill>
                </TableCell>
                <TableCell align={"center"}>
                    {job.services.length}
                </TableCell>
                <TableCell align={"center"}>
                    ${job.charge_unit === ChargeUnit.MONTH
                    ? job.charge_per_unit
                    : job.services.reduce((total, service) => {
                        return total + job.charge_per_unit * service.num_units_to_charge;
                    }, 0)}
                </TableCell>
                <TableCell>
                    <Button
                        size="small"
                        onClick={() => setOpen(!open)}
                        endIcon={open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    >
                        Charge Breakdown
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell size={"small"} style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1.5}}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                                Service(s)
                            </Typography>
                            <Card variant={"outlined"} sx={{borderRadius: "10px"}}>
                                <Table size="small" aria-label="job-services">
                                    <TableHead sx={{m: 0, p: 0}}>
                                        <TableRow sx={{m: 0, p: 0}}>
                                            <TableCell size={"small"} sx={{p: 1}}>#</TableCell>
                                            <TableCell size={"small"} sx={{p: 1}}>Summary</TableCell>
                                            <TableCell size={"small"} sx={{p: 1}}>Completed</TableCell>
                                            {job.charge_unit !== ChargeUnit.MONTH && <TableCell align="right" size={"small"} sx={{p: 1}}>$
                                                / {job.charge_unit}</TableCell>}
                                            {job.charge_unit !== ChargeUnit.MONTH && <TableCell align="right" size={"small"}
                                                                                                sx={{p: 1}}>{job.charge_unit !== ChargeUnit.PERCENT_COMPACTED && "#"} {job.charge_unit}s</TableCell>}
                                            {job.charge_unit !== ChargeUnit.MONTH && <TableCell align="right" size={"small"} sx={{p: 1}}>Charges
                                                ($)</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {job.services.map((service) => (
                                            <TableRow key={service.id} sx={{"& > *": {borderBottom: "unset"}}}>
                                                <TableCell sx={{p: 1}} component="th" scope="row" size={"small"}>
                                                    SER-{service.id.split("-").shift().toUpperCase()}
                                                </TableCell>
                                                <TableCell sx={{p: 1}} size={"small"}>{service.summary}</TableCell>
                                                <TableCell sx={{p: 1}}
                                                           size={"small"}>{format(Date.parse(service.completed_on), "MM/dd/yyyy hh:mm a")}</TableCell>
                                                {job.charge_unit !== ChargeUnit.MONTH && <TableCell sx={{p: 1}} align="right" size={"small"}>
                                                    ${job.charge_per_unit}
                                                </TableCell>}
                                                {job.charge_unit !== ChargeUnit.MONTH && <TableCell sx={{p: 1}} align="right" size={"small"}>
                                                    {service.num_units_to_charge}
                                                </TableCell>}
                                                {job.charge_unit !== ChargeUnit.MONTH && <TableCell sx={{p: 1}} align="right" size={"small"}>
                                                    {`$${Math.round(service.num_units_to_charge * job.charge_per_unit)}`}
                                                </TableCell>}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

interface SelectNonInvoicedJobsProps {
    client_id: string;
    existing_service_ids: string[];
    handleJobSelectionChange: (jobs: NonInvoicedClientJob[]) => void;
}

export const SelectNonInvoicedJobs = (props) => {
    const auth = useAuth();
    const {client_id, existing_service_ids, handleJobSelectionChange} = props;

    const clientServicesSearch = useClientServicesSearch(client_id, existing_service_ids, auth.user.organization.id, auth.user.franchise.id);
    const clientServicesStore = useClientServicesStore(clientServicesSearch.state);

    const filteredClientServices = useClientServices(clientServicesStore);

    const clientServicesIds = useClientServicesIds(filteredClientServices);
    const clientServicesSelection = useSelection<string>(clientServicesIds);

    const selectedSome = (clientServicesSelection.selected.length > 0) && (clientServicesSelection.selected.length < filteredClientServices.length);
    const selectedAll = (filteredClientServices.length > 0) && (clientServicesSelection.selected.length === filteredClientServices.length);

    useEffect(() => {
        if (!clientServicesSelection.selected) return;
        handleJobSelectionChange(clientServicesSelection.selected.map((row_identifier) => clientServicesStore.jobs[row_identifier]));
    }, [clientServicesSelection.selected])

    return (
        <>
            <Scrollbar>
                <Table sx={{minWidth: 750}}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedAll}
                                    indeterminate={selectedSome}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            clientServicesSelection.handleSelectAll();
                                        } else {
                                            clientServicesSelection.handleDeselectAll();
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                Job #
                            </TableCell>
                            <TableCell align={"center"}>
                                Month
                            </TableCell>
                            <TableCell align={"center"}>
                                Type
                            </TableCell>
                            <TableCell align={"center"}>
                                # of Services
                            </TableCell>
                            <TableCell align={"center"}>
                                Total ($)
                            </TableCell>
                            <TableCell width={200}>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!filteredClientServices) && [...Array(3)].map((_, rowIndex) => (
                            <TableRow key={rowIndex} sx={{px: 2, mx: 2}}>
                                <TableCell sx={{pl: 3.5, py: 3}}>
                                    <Skeleton variant="text" width="60%" height={24}/>
                                </TableCell>
                                <TableCell sx={{pl: 2, m: 0}} align={'center'}>
                                    <Skeleton variant="text" width="90%" height={24}/>
                                </TableCell>
                                <TableCell sx={{pl: 6, m: 0}} align={'center'}>
                                    <Skeleton variant="text" width="75%" height={24}/>
                                </TableCell>
                                <TableCell sx={{pl: 9, m: 0}}>
                                    <Skeleton variant="text" width="50%" height={24}/>
                                </TableCell>
                                <TableCell sx={{m: 0, pl: 6}} align={'center'}>
                                    <Skeleton variant="text" width="65%" height={24}/>
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="text" width="90%" height={24}/>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredClientServices.map((job) => {
                            return <Row key={job.services[0].id} job={job} selectedAll={selectedAll} selectedSome={selectedSome}
                                        clientServicesSelection={clientServicesSelection}/>;
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={filteredClientServices.length}
                onPageChange={clientServicesSearch.handlePageChange}
                onRowsPerPageChange={clientServicesSearch.handleRowsPerPageChange}
                page={clientServicesSearch.state.page}
                rowsPerPage={clientServicesSearch.state.rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </>
    )
}
