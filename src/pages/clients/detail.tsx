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
import {useParams} from "react-router-dom";
import {clientsApi} from "../../api/clients";
import {useDispatch, useSelector} from "react-redux";
import {setClientsStatus, upsertOneClient} from "../../slices/clients";
import {Status} from "../../utils/status.ts";
import {ClientBasicDetails} from "../../sections/clients/client-basic-details.tsx";
import {ClientLocation} from "../../sections/clients/client-location.tsx";
import {ClientContact} from "../../sections/clients/client-contact.tsx";
import {ClientPricingDetails} from "../../sections/clients/client-pricing-details.tsx";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Jobs", value: "jobs"},
    {label: "Invoices", value: "invoices"},
    {label: "Locations", value: "locations"},
    {label: "Contacts", value: "contacts"}
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

// const useInvoices = (): CustomerInvoice[] => {
//   const isMounted = useMounted();
//   const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
//
//   const handleInvoicesGet = useCallback(async () => {
//     try {
//       const response = await customersApi.getInvoices();
//
//       if (isMounted()) {
//         setInvoices(response);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }, [isMounted]);
//
//   useEffect(
//     () => {
//       handleInvoicesGet();
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     []
//   );
//
//   return invoices;
// };

export const ClientDetailsPage = () => {
    const params = useParams();
    const [currentTab, setCurrentTab] = useState<string>("details");
    // const invoices = useInvoices();

    useClient(params.clientID);

    // @ts-ignore
    const client = useSelector((state) => state.clients).clients[params.clientID];



    const handleTabsChange = useCallback(
        (event: ChangeEvent<{}>, value: string): void => {
            setCurrentTab(value);
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
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Stack spacing={2}>
                            <div>
                                <Link
                                    color="text.primary"
                                    component={RouterLink}
                                    href={paths.clients.index}
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
                                        Clients
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
                                        <Typography variant="h4">
                                            {client.name}
                                        </Typography>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Typography variant="subtitle2">
                                                id:
                                            </Typography>
                                            <Chip
                                                label={client.id}
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
                                                type={client.type.name}
                                                status={client.status}
                                            />
                                            <ClientPricingDetails
                                                recurring_charge={client.recurring_charge.toString()}
                                                on_demand_charge={client.on_demand_charge.toString()}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        lg={8}
                                    >
                                        <Stack spacing={2}>
                                            {client.primary_location && <ClientLocation
                                                street_address={client.primary_location.street_address}
                                                city={client.primary_location.city}
                                                state={client.primary_location.state}
                                                zip={client.primary_location.zip}
                                                name={client.primary_location.name}
                                            />}
                                            {client.primary_contact && <ClientContact
                                                first_name={client.primary_contact.first_name}
                                                last_name={client.primary_contact.last_name}
                                                email={client.primary_contact.email}
                                                phone_number={client.primary_contact.phone_number}
                                            />}
                                          {/*<CustomerEmailsSummary />*/}
                                          {/*<CustomerDataManagement />*/}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {/*{currentTab === 'invoices' && <CustomerInvoices invoices={invoices} />}*/}
                        {/*{currentTab === 'logs' && <CustomerLogs logs={logs} />}*/}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

