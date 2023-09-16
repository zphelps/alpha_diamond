import React, {ChangeEvent, FC, useEffect, useState} from "react";
import {
    Box, Button,
    Checkbox, Collapse,
    Divider, IconButton,
    Stack, Table, TableBody, TableCell, TableHead, TableRow,
    Typography
} from "@mui/material";
import GooglePlacesAutocomplete from "../../../../components/google-places-autocomplete.tsx";
import Skeleton from "@mui/material/Skeleton";
import {CreateClientFormValues} from "../../../../pages/clients/create.tsx";
import {Hourglass01, Hourglass02, Hourglass03} from "@untitled-ui/icons-react";
import {Add, Delete, HourglassEmptyOutlined, KeyboardArrowDown, KeyboardArrowUp} from "@mui/icons-material";
import {AddClientLocationDialog} from "../../../../components/add-client-location";
import {useDialog} from "../../../../hooks/use-dialog.tsx";

function Row(props: { location: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void, values: CreateClientFormValues }) {
    const { location, values, setFieldValue } = props;
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {location.name}
                </TableCell>
                <TableCell align="right">{`${location.on_site_contact.first_name} ${location.on_site_contact.last_name}`}</TableCell>
                <TableCell align="right">{location.service_address}</TableCell>
                <TableCell align="right">{location.billing_address}</TableCell>
                <TableCell align={'right'}>
                    <IconButton
                        onClick={() => {
                            setFieldValue("locations", values.locations.filter((l) => l.id !== location.id));
                        }}
                    >
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="subtitle1" gutterBottom component="div">
                                Bin Types
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{py: 1}}>Name</TableCell>
                                        <TableCell sx={{py: 0}}>Bin Size</TableCell>
                                        <TableCell sx={{py: 0}} align="right">Hauler</TableCell>
                                        <TableCell sx={{py: 0}} align="right">Haul rate</TableCell>
                                        <TableCell sx={{py: 0}} align="right">On-Demand Charge</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {location.bin_types && location.bin_types.map((bin_type) => (
                                        <TableRow key={bin_type.id}>
                                            <TableCell component="th" scope="row">
                                                {bin_type.name}
                                            </TableCell>
                                            <TableCell>{bin_type.size}</TableCell>
                                            <TableCell align="right">{bin_type.hauler.name}</TableCell>
                                            <TableCell align="right">${bin_type.hauler.rate}</TableCell>
                                            <TableCell align="right">${bin_type.on_demand_charge}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

interface SelectClientLocationsProps {
    values: CreateClientFormValues;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

export const SelectClientLocations: FC<SelectClientLocationsProps> = (props) => {
    const {
        values,
        setFieldValue,
    } = props;

    const addClientLocationDialog = useDialog();

    return (
        <>
            <Stack>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                    <Stack>
                        <Typography
                            variant={"h6"}
                            sx={{mb: 1}}
                        >
                            Locations
                        </Typography>
                        <Typography
                            variant={"subtitle2"}
                            color={"text.secondary"}
                            sx={{mb: 3}}
                        >
                            Add at least one location where you will be providing services to the client. You can add more locations later.
                        </Typography>
                    </Stack>
                    <Box>
                        <Button
                            startIcon={<Add />}
                            variant={'contained'}
                            onClick={() => {
                                addClientLocationDialog.handleOpen();
                            }}
                        >
                            Add Location
                        </Button>
                    </Box>
                </Stack>

                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Name</TableCell>
                            <TableCell align="right">On-Site Contact</TableCell>
                            <TableCell align="right">Service Address</TableCell>
                            <TableCell align="right">Billing</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {values.locations && values.locations.map((row) => (
                            <Row key={row.id} location={row} setFieldValue={setFieldValue} values={values} />
                        ))}
                    </TableBody>
                </Table>

                {/*<Table sx={{ minWidth: 700 }}>*/}
                {/*    <TableHead>*/}
                {/*        <TableRow>*/}
                {/*            <TableCell>*/}
                {/*                Name*/}
                {/*            </TableCell>*/}
                {/*            <TableCell>*/}
                {/*                Service Address*/}
                {/*            </TableCell>*/}
                {/*        </TableRow>*/}
                {/*    </TableHead>*/}
                {/*    <TableBody>*/}
                {/*        {values.locations.map((location) => {*/}
                {/*            return (*/}
                {/*                <TableRow*/}
                {/*                    hover*/}
                {/*                    key={location.id}*/}
                {/*                >*/}
                {/*                    <TableCell>*/}
                {/*                        {location.name}*/}
                {/*                    </TableCell>*/}
                {/*                    <TableCell>*/}
                {/*                        {location.service_address}*/}
                {/*                    </TableCell>*/}
                {/*                </TableRow>*/}
                {/*            );*/}
                {/*        })}*/}
                {/*    </TableBody>*/}
                {/*</Table>*/}
                {values.locations.length === 0 && (
                    <Stack alignItems={'center'} justifyContent={'center'} sx={{my: 8}} spacing={1}>
                        <HourglassEmptyOutlined fontSize={'large'} />
                        <Typography variant={'subtitle1'}>
                            Add at least one location
                        </Typography>
                    </Stack>

                )}
                <Divider sx={{mb: 2}}/>
            </Stack>
            <AddClientLocationDialog
                open={addClientLocationDialog.open}
                onClose={addClientLocationDialog.handleClose}
                client_id={values.id}
                onSubmit={(location) => {
                    setFieldValue("locations", [...values.locations, location]);
                }}
            />
        </>
    );
};
