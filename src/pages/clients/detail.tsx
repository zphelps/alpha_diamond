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
import {Client} from "../../types/client.ts";
import {useMounted} from "../../hooks/use-mounted.ts";
import {Seo} from "../../components/seo.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {paths} from "../../paths.ts";
import {useNavigate, useParams} from "react-router-dom";
import {clientsApi} from "../../api/clients";
import {useDispatch, useSelector} from "react-redux";
import {setClientsStatus, upsertOneClient} from "../../slices/clients";
import {Status} from "../../utils/status.ts";
import {ClientBasicDetails} from "../../sections/clients/client-basic-details.tsx";
import {ClientLocations} from "../../sections/clients/client-locations.tsx";
import {ClientServiceContact} from "../../sections/clients/client-service-contact.tsx";
import {ClientPricingDetails} from "../../sections/clients/client-pricing-details.tsx";
import {ClientBillingContact} from "../../sections/clients/client-billing-contact.tsx";
import {ClientJobs} from "../../sections/clients/jobs";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Jobs", value: "jobs"},
    {label: "Services", value: "services"},
    {label: "Invoices", value: "invoices"},
    // {label: "Locations", value: "locations"},
    // {label: "Contacts", value: "contacts"}
];

const useClient = (clientID: string) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleClientGet = useCallback(async () => {
        try {
            const response = await clientsApi.getClient({id: clientID});

            if (isMounted()) {
                dispatch(upsertOneClient(response));
                dispatch(setClientsStatus(Status.SUCCESS));
            }
        } catch (err) {
            console.error(err);
            dispatch(setClientsStatus(Status.ERROR));
        }
    }, [isMounted]);

    useEffect(
        () => {
            handleClientGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export const ClientDetailsPage = () => {
    const params = useParams();
    const [currentTab, setCurrentTab] = useState<string>(params.tab || "details");
    const navigate = useNavigate();

    useClient(params.clientID);

    // @ts-ignore
    const client = useSelector((state) => state.clients).clients[params.clientID];

    useEffect(() => {
        setCurrentTab(params.tab ?? 'details')
    }, [params.clientID, params.tab]);

    const handleTabsChange = useCallback(
        (event: ChangeEvent<{}>, value: string): void => {
            setCurrentTab(value);
            navigate(`/clients/${params.clientID}/${value}`, {replace: true})
        },
        []
    );

    if (!client) {
        return null;
    }

    return (
        <>
            <Seo title={`Client: ${client.name}`}/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 0
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
                            {/*        href={paths.clients.index}*/}
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
                            {/*            Clients*/}
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
                                        <Typography variant="h4">
                                            {client.name}
                                        </Typography>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Chip
                                                label={`ID-${client.id.split("-").shift().toUpperCase()}`}
                                                size="small"
                                            />
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
                                    spacing={2}
                                >
                                    <Grid
                                        xs={12}
                                        lg={4}
                                    >
                                        <Stack spacing={2}>
                                            <ClientBasicDetails
                                                name={client.name}
                                                country={client.country}
                                                type={client.type}
                                                status={client.status}
                                            />
                                            <ClientPricingDetails
                                                monthly_charge={client.default_monthly_charge.toString()}
                                                on_demand_charge={client.default_on_demand_charge.toString()}
                                                hourly_charge={client.default_hourly_charge.toString()}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        lg={8}
                                    >
                                        <Stack spacing={2}>
                                            <ClientLocations
                                                billing_location={client.service_location}
                                                service_location={client.service_location}
                                            />
                                            <ClientServiceContact
                                                service_contact={client.service_contact}
                                            />
                                            <ClientBillingContact
                                                billing_contact={client.billing_contact}
                                            />
                                          {/*<CustomerEmailsSummary />*/}
                                          {/*<CustomerDataManagement />*/}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {currentTab === 'jobs' && <ClientJobs clientID={client.id} />}
                        {/*{currentTab === 'logs' && <CustomerLogs logs={logs} />}*/}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

