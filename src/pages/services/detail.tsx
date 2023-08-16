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
import {ClientBasicDetails} from "../../sections/clients/client-basic-details.tsx";
import {ClientLocation} from "../../sections/clients/client-location.tsx";
import {ClientContact} from "../../sections/clients/client-contact.tsx";
import {jobsApi} from "../../api/jobs";
import {setJobsStatus, upsertOneJob} from "../../slices/jobs";
import {JobBasicDetails} from "../../sections/jobs/job-basic-details.tsx";
import {JobBookingDetails} from "../../sections/jobs/job-booking-details.tsx";
import {JobRecurrenceDetails} from "../../sections/jobs/job-recurrence-details.tsx";
import {Service} from "../../types/service.ts";
import {servicesApi} from "../../api/services";
import {JobServices} from "../../sections/jobs/job-services.tsx";
import {setServicesStatus, upsertOneService} from "../../slices/services";
import {ServiceBasicDetails} from "../../sections/services/service-basic-details.tsx";
import {ServiceLogisticsDetails} from "../../sections/services/service-logistics-details.tsx";
import {ServiceOnSiteContact} from "../../sections/services/service-on-site-contact.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Report", value: "report"},
];

const useService = (serviceID: string) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleServiceGet = useCallback(async () => {
        try {
            const response = await servicesApi.getService({id: serviceID});

            if (isMounted()) {
                dispatch(upsertOneService(response));
                dispatch(setServicesStatus(Status.SUCCESS));
            }
        } catch (err) {
            console.error(err);
            dispatch(setServicesStatus(Status.ERROR));
        }
    }, [isMounted]);

    useEffect(
        () => {
            handleServiceGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export const ServiceDetailsPage = () => {
    const params = useParams();
    const [currentTab, setCurrentTab] = useState<string>("details");
    // const invoices = useInvoices();

    useService(params.serviceID);

    // @ts-ignore
    const service = useSelector((state) => state.services).services[params.serviceID];

    const handleTabsChange = useCallback(
        (event: ChangeEvent<{}>, value: string): void => {
            setCurrentTab(value);
        },
        []
    );

    if (!service) {
        return null;
    }

    return (
        <>
            <Seo title={`Service: ${service.id}`}/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 2
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={3}>
                        <Stack spacing={2}>
                            <div>
                                <Link
                                    color="text.primary"
                                    component={RouterLink}
                                    href={paths.schedule}
                                    sx={{
                                        alignItems: "center",
                                        display: "inline-flex"
                                    }}
                                    underline="hover"
                                >
                                    <SvgIcon sx={{mr: 1}}>
                                        <ArrowLeftIcon/>
                                    </SvgIcon>
                                    <Typography variant="subtitle2">
                                        Schedule
                                    </Typography>
                                </Link>
                            </div>
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
                                            SER-{service.id.split("-").shift().toString().toUpperCase()}
                                        </Typography>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <SeverityPill color={getSeverityStatusColor(service.status)}>
                                                {service.status}
                                            </SeverityPill>
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
                                    spacing={4}
                                >
                                    <Grid
                                        xs={12}
                                        lg={4}
                                    >
                                        <ServiceBasicDetails
                                            clientID={service.client.id}
                                            jobID={service.job.id}
                                            clientName={service.client.name}
                                            status={service.status}
                                            serviceType={service.job.service_type}
                                            summary={service.summary}
                                            charge_per_unit={service.job.charge_per_unit}
                                            charge_unit={service.job.charge_unit}
                                        />
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        lg={8}
                                    >
                                        <Stack spacing={4}>
                                            <ServiceLogisticsDetails
                                                driver_notes={service.driver_notes}
                                                street_address={service.location.street_address}
                                                city={service.location.city}
                                                state={service.location.state}
                                                zip={service.location.zip}
                                                timestamp={service.timestamp}
                                                duration={service.duration}
                                            />
                                            {/*{service.service_type === 'Recurring' && <JobRecurrenceDetails*/}
                                            {/*    services_per_week={service.services_per_week}*/}
                                            {/*    days_of_week={service.days_of_week}*/}
                                            {/*    start_window={service.start_window}*/}
                                            {/*    end_window={service.end_window}*/}
                                            {/*/>}*/}
                                            <ServiceOnSiteContact
                                                first_name={service.on_site_contact.first_name}
                                                last_name={service.on_site_contact.last_name}
                                                email={service.on_site_contact.email}
                                                phone_number={service.on_site_contact.phone_number}
                                            />
                                          {/*<CustomerEmailsSummary />*/}
                                          {/*<CustomerDataManagement />*/}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {currentTab === 'services' && <JobServices jobID={service.id} clientID={service.client.id} />}
                        {/*{currentTab === 'logs' && <CustomerLogs logs={logs} />}*/}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

