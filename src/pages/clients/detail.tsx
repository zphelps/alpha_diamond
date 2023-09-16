import type {ChangeEvent} from "react";
import {useCallback, useEffect, useState} from "react";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";
import {
    Avatar, Backdrop,
    Box,
    Button,
    Chip, CircularProgress,
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
import {ClientOverview} from "../../sections/clients/tabs/details/client-overview.tsx";
import {ClientServiceContact} from "../../sections/clients/client-service-contact.tsx";
import {ClientPricing} from "../../sections/clients/tabs/details/client-pricing.tsx";
import {ClientAccountContact} from "../../sections/clients/client-account-contact.tsx";
import {ClientJobs} from "../../sections/clients/tabs/jobs";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {ClientRevenueByLocation} from "../../sections/clients/tabs/details/client-revenue-by-location.tsx";
import {ClientLocations} from "../../sections/clients/tabs/locations";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Jobs", value: "jobs"},
    {label: "Services", value: "services"},
    {label: "Invoices", value: "invoices"},
    {label: "Locations", value: "locations"},
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
    const clientStore = useSelector((state) => state.clients);

    const client = clientStore.clients[params.clientID];

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

    if (!client || !client.locations) {
        return <Stack sx={{alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            <CircularProgress/>
        </Stack>
    }

    return (
        <>
            <Seo title={`${client.name}`}/>
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
                                            {client.name ?? "Client Name"}
                                        </Typography>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <SeverityPill color={client.status === 'active' ? 'success' : 'error'}>
                                                {client.status}
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
                                    spacing={2}
                                >
                                    <Grid
                                        xs={12}
                                        lg={4}
                                    >
                                        <Stack spacing={2}>
                                            <ClientOverview
                                                client={client}
                                            />
                                            {/*<ClientAccountContact account_contact={client.account_contact} />*/}
                                            <ClientPricing
                                                monthly_charge={client.default_monthly_charge.toString()}
                                                hourly_charge={client.default_hourly_charge.toString()}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        lg={8}
                                    >
                                        <Stack spacing={2}>
                                            <ClientRevenueByLocation locations={client.locations} />
                                            {/*<ClientLocations*/}
                                            {/*    billing_location={client.service_location}*/}
                                            {/*    service_location={client.service_location}*/}
                                            {/*/>*/}
                                            {/*<ClientServiceContact*/}
                                            {/*    service_contact={client.service_contact}*/}
                                            {/*/>*/}
                                            {/*<ClientBillingContact*/}
                                            {/*    billing_contact={client.billing_contact}*/}
                                            {/*/>*/}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {currentTab === 'jobs' && <ClientJobs clientID={client.id} />}
                        {currentTab === 'locations' && <ClientLocations locations={client.locations} />}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

