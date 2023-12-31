import type {ChangeEvent} from "react";
import {useCallback, useEffect, useState} from "react";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Typography,
    Unstable_Grid2 as Grid
} from "@mui/material";
import {useMounted} from "../../hooks/use-mounted.ts";
import {Seo} from "../../components/seo.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {paths} from "../../paths.ts";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Status} from "../../utils/status.ts";
import {ClientOverview} from "../../sections/clients/tabs/details/client-overview.tsx";
import {ClientLocations} from "../../sections/clients/client-locations.tsx";
import {ClientServiceContact} from "../../sections/clients/client-service-contact.tsx";
import {jobsApi} from "../../api/jobs";
import {setJobsStatus, upsertOneJob} from "../../slices/jobs";
import {JobBasicDetails} from "../../sections/jobs/job-basic-details.tsx";
import {JobBookingDetails} from "../../sections/jobs/job-booking-details.tsx";
import {JobRecurrenceDetails} from "../../sections/jobs/job-recurrence-details.tsx";
import {Service} from "../../types/service.ts";
import {servicesApi} from "../../api/services";
import {JobServices} from "../../sections/jobs/job-services.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";
import {format} from "date-fns";
import {JobServiceDetails} from "../../sections/jobs/job-service-details.tsx";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Services", value: "services"},
    {label: "Invoices", value: "invoices"},
];

const useJob = (jobID: string) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleJobGet = useCallback(async () => {
        try {
            const response = await jobsApi.getJob({id: jobID});

            if (isMounted()) {
                dispatch(upsertOneJob(response));
                dispatch(setJobsStatus(Status.SUCCESS));
            }
        } catch (err) {
            console.error(err);
            dispatch(setJobsStatus(Status.ERROR));
        }
    }, [isMounted]);

    useEffect(
        () => {
            handleJobGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export const JobDetailsPage = () => {
    const params = useParams();
    const [currentTab, setCurrentTab] = useState<string>("details");
    // const invoices = useInvoices();

    useJob(params.jobID);

    // @ts-ignore
    const job = useSelector((state) => state.jobs).jobs[params.jobID];

    const handleTabsChange = useCallback(
        // @ts-ignore
        (event: ChangeEvent<{}>, value: string): void => {
            setCurrentTab(value);
        },
        []
    );

    if (!job) {
        return null;
    }

    return (
        <>
            <Seo title={`Job: ${job.client.name}`}/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Divider sx={{mb: 4}}/>
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Stack spacing={2}>
                            {/*<div>*/}
                            {/*    <Link*/}
                            {/*        color="text.primary"*/}
                            {/*        component={RouterLink}*/}
                            {/*        href={paths.jobs.index}*/}
                            {/*        sx={{*/}
                            {/*            alignItems: "center",*/}
                            {/*            display: "inline-flex"*/}
                            {/*        }}*/}
                            {/*        underline="hover"*/}
                            {/*    >*/}
                            {/*        <SvgIcon sx={{mr: 1}}>*/}
                            {/*            <ArrowLeftIcon/>*/}
                            {/*        </SvgIcon>*/}
                            {/*        <Typography variant="subtitle2">*/}
                            {/*            Jobs*/}
                            {/*        </Typography>*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                            <Stack
                                alignItems="flex-start"
                                direction={{
                                    xs: "column",
                                    md: "row"
                                }}
                                justifyContent="space-between"
                                spacing={4}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Stack spacing={2}>
                                        <Typography variant="h4" letterSpacing={0.6}>
                                            JOB-{job.id.split("-").shift().toString().toUpperCase()}
                                        </Typography>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            {/*<Typography variant="subtitle2">*/}
                                            {/*    Client:*/}
                                            {/*</Typography>*/}
                                            <SeverityPill color={getSeverityStatusColor(job.status)}>
                                                {job.status}
                                            </SeverityPill>
                                            <SeverityPill color={getSeverityServiceTypeColor(job.service_type)}>
                                                {job.service_type}
                                            </SeverityPill>
                                            {/*<Chip*/}
                                            {/*    label={job.client.name}*/}
                                            {/*    size="small"*/}
                                            {/*/>*/}
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Button
                                        color="inherit"
                                        // component={RouterLink}
                                        endIcon={(
                                            <SvgIcon>
                                                <Edit02Icon/>
                                            </SvgIcon>
                                        )}
                                        // href={paths.dashboard.customers.edit}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        endIcon={(
                                            <SvgIcon>
                                                <ChevronDownIcon/>
                                            </SvgIcon>
                                        )}
                                        variant="contained"
                                    >
                                        Actions
                                    </Button>
                                </Stack>
                            </Stack>
                            <div>
                                <Tabs
                                    indicatorColor="primary"
                                    onChange={handleTabsChange}
                                    scrollButtons="auto"
                                    sx={{mt: 0}}
                                    textColor="primary"
                                    value={currentTab}
                                    variant="scrollable"
                                >
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.value}
                                            label={tab.label}
                                            value={tab.value}
                                        />
                                    ))}
                                </Tabs>
                                <Divider/>
                            </div>
                        </Stack>
                        {currentTab === "details" && (
                            <div>
                                <Grid
                                    container
                                    spacing={3}
                                >
                                    <Grid
                                        xs={12}
                                        lg={4}
                                    >
                                        <JobBasicDetails
                                            clientName={job.client.name}
                                            clientID={job.client.id}
                                            status={job.status}
                                            serviceType={job.service_type}
                                            summary={job.summary}
                                            charge_unit={job.charge_unit}
                                            charge_per_unit={job.charge_per_unit}
                                        />
                                        {/*{job.primary_contact && <ClientContact*/}
                                        {/*    first_name={job.primary_contact.first_name}*/}
                                        {/*    last_name={job.primary_contact.last_name}*/}
                                        {/*    email={job.primary_contact.email}*/}
                                        {/*    phone_number={job.primary_contact.phone_number}*/}
                                        {/*/>}*/}
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        lg={8}
                                    >
                                        <Stack spacing={3}>
                                            {job.service_type === 'On-Demand' && <JobServiceDetails
                                                driver_notes={job.driver_notes}
                                                contact_name={`${job.on_site_contact.first_name} ${job.on_site_contact.last_name}`}
                                                duration={job.duration}
                                                timestamp={job.timestamp}
                                                formatted_address={job.location.formatted_address}
                                            />}
                                            <JobBookingDetails
                                                origin={job.origin}
                                                created_at={job.created_at}
                                                updated_on={job.updated_on}
                                            />
                                            {job.service_type === 'Recurring' && <JobRecurrenceDetails
                                                services_per_week={job.services_per_week}
                                                days_of_week={job.days_of_week}
                                                start_time_window={job.start_time_window}
                                                end_time_window={job.end_time_window}
                                            />}
                                            {/*{job.primary_contact && <ClientContact*/}
                                            {/*    first_name={job.primary_contact.first_name}*/}
                                            {/*    last_name={job.primary_contact.last_name}*/}
                                            {/*    email={job.primary_contact.email}*/}
                                            {/*    phone_number={job.primary_contact.phone_number}*/}
                                            {/*/>}*/}
                                          {/*<CustomerEmailsSummary />*/}
                                          {/*<CustomerDataManagement />*/}
                                        </Stack>
                                    </Grid>
                                </Grid>
                                {/*<Typography*/}
                                {/*    variant={'caption'}*/}
                                {/*    color={'text.secondary'}*/}
                                {/*>*/}
                                {/*    Origin: {job.origin}  |  Created on {format(new Date(job.created_at), 'MM/dd/yyyy h:mm a')}  |  Last updated on {format(new Date(job.updated_on), 'MM/dd/yyyy h:mm a')}.*/}
                                {/*</Typography>*/}
                            </div>
                        )}
                        {currentTab === 'services' && <JobServices jobID={job.id} clientID={job.client.id} />}
                        {/*{currentTab === 'logs' && <CustomerLogs logs={logs} />}*/}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

