import "react";
import {ClientLocation} from "../../../../types/client-location.ts";
import React, {ChangeEvent, FC, useCallback, useEffect, useState} from "react";
import {
    Accordion, AccordionDetails,
    AccordionSummary, Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Divider,
    Grid, IconButton,
    List,
    ListItem, ListItemAvatar, ListItemText,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import {PropertyListItem} from "../../../../components/property-list-item.tsx";
import {PropertyList} from "../../../../components/property-list.tsx";
import Map, {Marker} from "react-map-gl";
import {mapboxConfig} from "../../../../config.ts";
import {
    Add, Build,
    ExpandMore,
    GpsFixed,
    Phone,
    PinDrop,
    PinDropOutlined,
    Place,
    PlaceOutlined,
    Receipt, Settings
} from "@mui/icons-material";
import {ReceiptCheck} from "@untitled-ui/icons-react";
import {AddBinTypeDialog} from "../../../../components/add-bin-type";
import {useDialog} from "../../../../hooks/use-dialog.tsx";
import {binTypesApi} from "../../../../api/bin-types";
import {haulersApi} from "../../../../api/haulers";
import toast from "react-hot-toast";
import {AddClientLocationDialog} from "../../../../components/add-client-location";
import {clientLocationsApi} from "../../../../api/client-locations";
import {clientContactsApi} from "../../../../api/client-contacts";
import {BinType} from "../../../../types/bin-type.ts";

const tabs = [
    {label: "Details", value: "details"},
    {label: "Bin Types", value: "bin-types"},
];

interface AddBinTypeDialogData {
    client_id: string;
    client_location_id: string;
    initialBinType?: BinType;
}

interface AddClientLocationDialogData {
    client_id: string;
}

interface ClientLocationsProps {
    locations: ClientLocation[];
}

export const ClientLocations: FC<ClientLocationsProps> = (props) => {
    const {locations} = props;
    const [currentTab, setCurrentTab] = useState<string>("details");

    const addBinTypeDialog = useDialog<AddBinTypeDialogData>();
    const addClientLocationDialog = useDialog<AddClientLocationDialogData>();

    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    const [markers, setMarkers] = useState<{ latitude: number, longitude: number }[]>([
        ...locations.map(location => ({
            latitude: location.service_location_latitude,
            longitude: location.service_location_longitude
        }))
    ]);

    const onMapClick = (event: any) => {
        console.log(event);
        const newMarker = {
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
        };
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    };

    const handleTabsChange = useCallback(
        (event: ChangeEvent<{}>, value: string): void => {
            setCurrentTab(value);
        },
        []
    );

    const handleAddBinType = useCallback(
        async (binType) => {
            console.log(binType);
            toast.loading("Adding bin type...");
            try {
                await haulersApi.create(binType.hauler);
                await binTypesApi.create({
                    id: binType.id,
                    name: binType.name,
                    description: binType.description,
                    size: binType.size,
                    on_demand_charge: binType.on_demand_charge,
                    hauler_id: binType.hauler.id,
                    client_location_id: binType.client_location_id,
                });
                toast.dismiss();
                toast.success("Bin type added");
            } catch (e) {
                console.log(e);
                toast.dismiss();
                toast.error("Failed to add bin type");
            }
        }, []);

    const handleUpdateBinType = useCallback(
        async (binType) => {
            console.log(binType);
            toast.loading("Updating bin type...");
            try {
                // await haulersApi.update(binType.hauler.id, binType.hauler);
                // await binTypesApi.update(binType.id, {
                //     name: binType.name,
                //     description: binType.description,
                //     size: binType.size,
                //     on_demand_charge: binType.on_demand_charge,
                //     hauler_id: binType.hauler.id,
                //     client_location_id: binType.client_location_id,
                // });
                toast.dismiss();
                toast.success("Bin type updated");
            } catch (e) {
                console.log(e);
                toast.dismiss();
                toast.error("Failed to update bin type");
            }
        }, []);

    const handleAddLocation = useCallback(
        async (location) => {
            console.log(location);
            toast.loading("Adding location...");
            try {
                await clientContactsApi.create({
                    id: location.on_site_contact.id,
                    first_name: location.on_site_contact.first_name,
                    last_name: location.on_site_contact.last_name,
                    email: location.on_site_contact.email,
                    phone: location.on_site_contact.phone,
                    client_id: location.client_id,
                });
                await clientLocationsApi.create({
                    id: location.id,
                    name: location.name,
                    service_address: location.service_address,
                    service_location_latitude: location.service_location_latitude,
                    service_location_longitude: location.service_location_longitude,
                    on_site_contact_id: location.on_site_contact.id,
                    billing_name: location.billing_name,
                    billing_address: location.billing_address,
                    billing_email: location.billing_email,
                    billing_phone: location.billing_phone,
                    client_id: location.client_id,
                });
                for (const binType of location.bin_types) {
                    await haulersApi.create(binType.hauler);
                    await binTypesApi.create({
                        id: binType.id,
                        name: binType.name,
                        description: binType.description,
                        size: binType.size,
                        on_demand_charge: binType.on_demand_charge,
                        hauler_id: binType.hauler.id,
                        client_location_id: binType.client_location_id,
                    });
                }
                toast.dismiss();
                toast.success("Location added");
            } catch (e) {
                console.log(e);
                toast.dismiss();
                toast.error("Failed to add location");
            }
        }, []);

    useEffect(() => {
        if (expanded === false) {
            setExpanded(locations[0].id);
        }
    }, [locations]);

    return (
        <>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Typography variant={"h5"}>
                    Locations
                </Typography>
                <Button
                    startIcon={<Add/>}
                    variant={"outlined"}
                    onClick={() => addClientLocationDialog.handleOpen({
                        client_id: locations[0].client_id
                    })}
                >
                    Location
                </Button>
            </Stack>
            <Grid container>
                <Grid item xs={12} md={12} lg={6} height={{xs: "20vh", lg: "70vh"}}>
                    <Card sx={{borderRadius: "10px", width: "100%", height: "100%", flex: 2}}>
                        <Map
                            interactive={true}
                            mapLib={import("mapbox-gl")}
                            initialViewState={{
                                longitude: locations[0].service_location_longitude,
                                latitude: locations[0].service_location_latitude,
                                zoom: 15
                            }}
                            mapboxAccessToken={mapboxConfig.apiKey}
                            style={{width: "100%", height: "100%"}}
                            mapStyle="mapbox://styles/mapbox/light-v9"
                            onClick={onMapClick}
                        >
                            {markers.map((marker, index) => (
                                <Marker key={index} latitude={marker.latitude} longitude={marker.longitude}>
                                    <Stack
                                        alignItems={"center"}
                                        sx={{
                                            height: 60,
                                            width: 60,
                                            filter: (theme) => `drop-shadow(0px 0px 5px ${theme.palette.primary.main})`,
                                            "& img": {
                                                height: "100%"
                                            }
                                        }}
                                    >
                                        <Place fontSize={"large"}/>
                                        {/*<GpsFixed/>*/}
                                    </Stack>
                                </Marker>
                            ))}
                        </Map>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                    {locations.map((location) => (
                        <Card key={location.id}
                              sx={{ml: {lg: 3, xs: 0}, mb: 2, mt: {lg: 0, xs: 3}, px: 0.5, pt: 1.5, pb: 0.75}}>
                            <Accordion expanded={expanded === location.id} onChange={handleChange(location.id)}
                                       elevation={0}
                                       disableGutters>
                                <AccordionSummary
                                    expandIcon={<ExpandMore/>}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Stack spacing={0.75}>
                                        <Typography variant={"h6"}>
                                            {location.name}
                                        </Typography>
                                        <Typography variant={"body1"} color={"text.secondary"}>
                                            {location.service_address}
                                        </Typography>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
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
                                        <Divider sx={{mb: 2}}/>
                                    </Box>
                                    {currentTab === "details" && <Card variant={"outlined"}
                                                                       sx={{
                                                                           width: "100%",
                                                                           p: 0,
                                                                           flex: 1,
                                                                           borderRadius: "12px"
                                                                       }}>

                                        <List>
                                            <ListItem alignItems={"flex-start"}>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <Build/>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Stack>
                                                    <Typography variant={"subtitle2"}>
                                                        Service Address
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.service_address.split(",")[0]}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.service_address.split(",").slice(1).join(",")}
                                                    </Typography>
                                                </Stack>
                                            </ListItem>
                                            <Divider variant="inset" component="li" sx={{my: 1}}/>
                                            <ListItem alignItems={"flex-start"}>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <Phone/>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Stack>
                                                    <Typography variant={"subtitle2"}>
                                                        On-Site Contact
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {`${location.on_site_contact.first_name} ${location.on_site_contact.last_name}`}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.on_site_contact.email}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.on_site_contact.phone}
                                                    </Typography>
                                                </Stack>
                                            </ListItem>
                                            <Divider variant="inset" component="li" sx={{my: 1}}/>
                                            <ListItem alignItems={"flex-start"}>
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <Receipt/>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Stack>
                                                    <Typography variant={"subtitle2"}>
                                                        Invoice To
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.billing_name}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.billing_address}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.billing_email}
                                                    </Typography>
                                                    <Typography variant={"body2"} color={"text.secondary"}>
                                                        {location.billing_phone}
                                                    </Typography>
                                                </Stack>
                                            </ListItem>
                                        </List>
                                    </Card>}
                                    {currentTab === "bin-types" && <Box>
                                        {location.bin_types.map((bin_type) => (
                                            <Card variant={"outlined"} key={bin_type.id}
                                                  sx={{
                                                      width: "100%",
                                                      pt: 1,
                                                      mb: 1.5,
                                                      flex: 1,
                                                      borderRadius: "12px"
                                                  }}>
                                                <Accordion disableGutters elevation={0}>
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMore/>}
                                                        aria-controls="panel1a-content"
                                                        id="panel1a-header"
                                                    >
                                                        <Stack>
                                                            <Typography variant={"subtitle1"}>
                                                                {bin_type.name}
                                                            </Typography>
                                                            <Typography variant={"body2"} color={"text.secondary"}>
                                                                Description: {bin_type.description}
                                                            </Typography>
                                                        </Stack>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <PropertyList>
                                                            <PropertyListItem
                                                                align={"horizontal"}
                                                                label={"On-Demand Charge"}
                                                                value={`$${bin_type.on_demand_charge}`}
                                                            />
                                                            <PropertyListItem
                                                                align={"horizontal"}
                                                                label={"Hauler"}
                                                                value={`${bin_type.hauler.name}`}
                                                            />
                                                            <PropertyListItem
                                                                align={"horizontal"}
                                                                label={"Haul Rate"}
                                                                value={`$${bin_type.hauler.rate}`}
                                                            />
                                                            <PropertyListItem
                                                                align={"horizontal"}
                                                                label={"Size"}
                                                                value={`${bin_type.size}`}
                                                            />
                                                        </PropertyList>
                                                        <Stack direction={"row"} justifyContent={"end"}>
                                                            <Button
                                                                onClick={() => addBinTypeDialog.handleOpen({
                                                                    client_id: location.client_id,
                                                                    client_location_id: location.id,
                                                                    initialBinType: bin_type
                                                                })}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button color={"error"}>
                                                                Delete
                                                            </Button>
                                                        </Stack>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Card>
                                        ))}
                                        <Button
                                            variant={"outlined"}
                                            sx={{mt: 1, width: "100%"}}
                                            onClick={() => addBinTypeDialog.handleOpen({
                                                client_id: location.client_id,
                                                client_location_id: location.id
                                            })}
                                        >
                                            <Add fontSize={"small"} sx={{mr: 0.5}}/>
                                            <Typography variant={"subtitle2"}>
                                                Add
                                            </Typography>
                                        </Button>
                                    </Box>}
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    ))}
                </Grid>
            </Grid>
            {addBinTypeDialog.data && <AddBinTypeDialog
                action={addBinTypeDialog.data.initialBinType ? "update" : "create"}
                client_id={addBinTypeDialog.data.client_id}
                client_location_id={addBinTypeDialog.data.client_location_id}
                initialBinType={addBinTypeDialog.data.initialBinType}
                open={addBinTypeDialog.open}
                onClose={addBinTypeDialog.handleClose}
                onSubmit={addBinTypeDialog.data.initialBinType ? handleUpdateBinType : handleAddBinType}
            />}
            {addClientLocationDialog.data && <AddClientLocationDialog
                open={addClientLocationDialog.open}
                onClose={addClientLocationDialog.handleClose}
                client_id={addClientLocationDialog.data.client_id}
                onSubmit={async (location) => {
                    await handleAddLocation(location);
                }}
            />}
        </>
    );
};
