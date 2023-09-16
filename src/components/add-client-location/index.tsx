import React, {FC, useEffect, useState} from 'react';
import {useAuth} from "../../hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {
    Box,
    Button, Card,
    Dialog,
    Divider, IconButton, InputAdornment,
    Link,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Typography
} from "@mui/material";
import {Service, ServiceType} from "../../types/service.ts";
import PropTypes from "prop-types";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";
import {PropertyList} from "../../components/property-list.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {getJobRecurrenceDescription} from "../../utils/job-recurrence-description.ts";
import { CreateClientFormValues } from '../../pages/clients/create.tsx';
import GooglePlacesAutocomplete from "../google-places-autocomplete.tsx";
import {Add, ArrowDownward, Check, Delete, HourglassEmptyOutlined} from "@mui/icons-material";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {AddBinTypeDialog} from "../add-bin-type";
import {ClientLocation} from "../../types/client-location.ts";
import {ClientContact} from "../../types/client-contact.ts";
import {BinType} from "../../types/bin-type.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

const steps = [
    {
        label: 'Name',
        description: `What would you like to name this location? You can change this later.`,
    },
    {
        label: 'Service Address',
        description: 'Where will you be providing services for this location? You can change this later.',
    },
    {
        label: 'On-Site Contact',
        description: `Provide contact information for someone who will be on-site at this location. 
                        If drivers run into issues completing a service, this will be their point of contact to resolve 
                        the issue. You can change this later.`,
    },
    {
        label: 'Billing',
        description: `Where should invoices be billed to for this location? You can change this later.`,
    },
    {
        label: 'Bin Types',
        description: `Please specify the types of bins that you will be servicing at this location. You can add more bin types later.`,
    },
];

interface AddClientLocationDialogProps {
    client_id: string;
    onClose?: () => void;
    onSubmit?: (location: ClientLocation) => void;
    open?: boolean;
}

export const AddClientLocationDialog: FC<AddClientLocationDialogProps> = (props) => {
    const {
        onClose,
        onSubmit,
        client_id,
        open = false,
    } = props;

    const navigate = useNavigate();

    const addBinTypeDialog = useDialog();

    const [activeStep, setActiveStep] = React.useState(0);

    const [location, setLocation] = useState<ClientLocation>({
        id: uuid(),
        client_id: client_id,
        name: null,
        billing_name: null,
        billing_email: null,
        billing_phone: null,
        billing_address: null,
        service_address: null,
        service_location_latitude: null,
        service_location_longitude: null,
        on_site_contact: {
            id: uuid(),
            client_id: client_id,
            first_name: null,
            last_name: null,
            email: null,
            phone: null,
        },
        bin_types: [],
        total_revenue: 0,
    });

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setLocation({
            id: uuid(),
            client_id: client_id,
            name: null,
            billing_name: null,
            billing_email: null,
            billing_phone: null,
            billing_address: null,
            service_address: null,
            service_location_latitude: null,
            service_location_longitude: null,
            on_site_contact: {
                id: uuid(),
                client_id: client_id,
                first_name: null,
                last_name: null,
                email: null,
                phone: null,
            },
            bin_types: [],
            total_revenue: 0,
        });
        setActiveStep(0);
    }

    const handleAddLocation = async () => {
        if (location.name
            && location.service_address
            && location.service_location_latitude
            && location.service_location_longitude
            && location.on_site_contact.first_name
            && location.on_site_contact.last_name
            && location.on_site_contact.email
            && location.on_site_contact.phone
            && location.billing_name
            && location.billing_email
            && location.billing_phone
            && location.billing_address
            && location.bin_types.length > 0
        ) {
            await onSubmit?.(location);
            handleReset();
            onClose?.();
        } else {
            toast.error('Please fill out all fields.');
        }
    }

    const handleLocationNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            name: event.target.value === '' ? null : event.target.value,
        })
    }

    const handleServiceAddressChange = (value) => {
        console.log(value)
        if (value) {
            setLocation({
                ...location,
                service_address: value.description,
                service_location_latitude: value.lat,
                service_location_longitude: value.lng,
            })
        } else {
            setLocation({
                ...location,
                service_address: null,
                service_location_latitude: null,
                service_location_longitude: null,
            })
        }
    }

    const handleOnSiteContactFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            on_site_contact: {
                ...location.on_site_contact,
                first_name: event.target.value === '' ? null : event.target.value,
            }
        })
    }

    const handleOnSiteContactLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            on_site_contact: {
                ...location.on_site_contact,
                last_name: event.target.value === '' ? null : event.target.value,
            }
        })
    }

    const handleOnSiteContactEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            on_site_contact: {
                ...location.on_site_contact,
                email: event.target.value === '' ? null : event.target.value,
            }
        })
    }

    const handleOnSiteContactPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            on_site_contact: {
                ...location.on_site_contact,
                phone: event.target.value === '' ? null : Number(event.target.value),
            }
        })
    }

    const handleBillingNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            billing_name: event.target.value === '' ? null : event.target.value,
        })
    }

    const handleBillingEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            billing_email: event.target.value === '' ? null : event.target.value,
        })
    }

    const handleBillingPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            billing_phone: event.target.value === '' ? null : Number(event.target.value),
        })
    }

    const handleBillingAddressChange = (value) => {
        if (value) {
            setLocation({
                ...location,
                billing_address: value.description,
            })
        } else {
            setLocation({
                ...location,
                billing_address: null,
            })
        }
    }

    useEffect(() => {
        console.log(location)
    }, [location]);

    return (
        <>
            <Dialog
                fullWidth
                onClose={onClose}
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        margin: 0,
                        width: '100%',
                        minWidth: {xs: '100%', sm: '100%', md: 800},
                    },
                }}
            >
                <Box sx={{p: 3}}>
                    <Typography
                        variant="h5"
                        sx={{mb: 1.5}}
                    >
                        {`Add Location`}
                    </Typography>

                    <Divider sx={{my: 2}}/>

                    <Stepper activeStep={activeStep} orientation="vertical" >
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    {step.label}
                                </StepLabel>
                                <StepContent>
                                    <Typography
                                        variant={'body2'}
                                        color={'text.secondary'}
                                        sx={{mb: 2}}
                                    >
                                        {step.description}
                                    </Typography>
                                    {activeStep === 0 && (
                                        <TextField
                                            required
                                            fullWidth
                                            value={location.name ?? ""}
                                            onChange={handleLocationNameChange}
                                            label={"Name"}
                                        />
                                    )}
                                    {activeStep === 1 && (
                                        <GooglePlacesAutocomplete handleAddressChange={handleServiceAddressChange} />
                                    )}
                                    {activeStep === 2 && (
                                        <Stack spacing={2}>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={location.on_site_contact?.first_name ?? ""}
                                                    onChange={handleOnSiteContactFirstNameChange}
                                                    label={"First Name"}
                                                />
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={location.on_site_contact?.last_name ?? ""}
                                                    onChange={handleOnSiteContactLastNameChange}
                                                    label={"Last Name"}
                                                />
                                            </Stack>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={location.on_site_contact?.email ?? ""}
                                                    onChange={handleOnSiteContactEmailChange}
                                                    label={"Email"}
                                                />
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type={'number'}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Typography variant={'body2'}>+1</Typography></InputAdornment>,
                                                    }}
                                                    value={location.on_site_contact?.phone ?? ""}
                                                    onChange={handleOnSiteContactPhoneChange}
                                                    label={"Phone"}
                                                />
                                            </Stack>
                                        </Stack>
                                    )}
                                    {activeStep === 3 && (
                                        <Stack spacing={2}>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={location.billing_name ?? ""}
                                                    onChange={handleBillingNameChange}
                                                    label={"Name"}
                                                />
                                            </Stack>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={location.billing_email ?? ""}
                                                    onChange={handleBillingEmailChange}
                                                    label={"Email"}
                                                />
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type={'number'}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Typography variant={'body2'}>+1</Typography></InputAdornment>,
                                                    }}
                                                    value={location.billing_phone ?? ""}
                                                    onChange={handleBillingPhoneChange}
                                                    label={"Phone"}
                                                />
                                            </Stack>
                                            <GooglePlacesAutocomplete handleAddressChange={handleBillingAddressChange} />
                                        </Stack>
                                    )}
                                    {activeStep === 4 && (
                                        <Stack spacing={2}>
                                            {location.bin_types.length > 0 && (
                                                <Card variant={'outlined'} sx={{borderRadius: '10px'}}>
                                                    <Table>
                                                        <TableHead>
                                                            <TableCell>
                                                                Name
                                                            </TableCell>
                                                            <TableCell>
                                                                Hauler
                                                            </TableCell>
                                                            <TableCell align={'right'}>
                                                                Haul Rate
                                                            </TableCell>
                                                            <TableCell align={'right'}>
                                                                On-Demand Charge
                                                            </TableCell>
                                                            <TableCell align={'right'}>
                                                                Actions
                                                            </TableCell>
                                                        </TableHead>
                                                        <TableBody>
                                                            {location.bin_types.map((bin_type, index) => (
                                                                <TableRow key={bin_type.id}>
                                                                    <TableCell>
                                                                        {bin_type.name}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {bin_type.hauler.name}
                                                                    </TableCell>
                                                                    <TableCell align={'right'}>
                                                                        ${bin_type.hauler.rate}
                                                                    </TableCell>
                                                                    <TableCell align={'right'}>
                                                                        ${bin_type.on_demand_charge}
                                                                    </TableCell>
                                                                    <TableCell align={'right'}>
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                setLocation({
                                                                                    ...location,
                                                                                    bin_types: location.bin_types.filter((value, i) => i !== index)
                                                                                })
                                                                            }}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            )}

                                            {location.bin_types.length === 0 && (
                                                <Stack alignItems={'center'} sx={{mt: 2}}>
                                                    <HourglassEmptyOutlined fontSize={'large'} sx={{color: 'text.secondary'}} />
                                                    <Typography
                                                        variant={'subtitle1'}
                                                        color={'text.secondary'}
                                                        sx={{mb: 2, mt: 1}}
                                                    >
                                                        No bin types added yet.
                                                    </Typography>
                                                    <Typography
                                                        variant={'caption'}
                                                        color={'text.secondary'}
                                                    >
                                                        (Add one)
                                                    </Typography>
                                                    <ArrowDownward fontSize={'small'} sx={{color: 'text.secondary'}} />
                                                </Stack>
                                            )}
                                            <Button
                                                onClick={addBinTypeDialog.handleOpen}
                                                variant={'outlined'}
                                                startIcon={<Add />}
                                            >
                                                Bin Type
                                            </Button>
                                        </Stack>
                                    )}
                                    <Stack direction={'row'} justifyContent={'end'} sx={{ mt: 1, alignItems:'end' }}>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={index === steps.length - 1 ? handleAddLocation : handleNext}
                                            sx={{ mt: 1, mr: 1 }}
                                            startIcon={index === steps.length - 1 && <Check />}
                                            disabled={(
                                                (activeStep === 0 && !location.name)
                                                || (activeStep === 1 && (!location.service_address
                                                    || !location.service_location_longitude
                                                    || !location.service_location_latitude))
                                                || (activeStep === 2 && (!location.on_site_contact.first_name
                                                    || !location.on_site_contact.last_name
                                                    || !location.on_site_contact.email
                                                    || !location.on_site_contact.phone))
                                                || (activeStep === 3 && (!location.billing_name
                                                    || !location.billing_email
                                                    || !location.billing_phone
                                                    || !location.billing_address))
                                                || (activeStep === 4 && location.bin_types.length === 0)
                                            )}
                                        >
                                            {index === steps.length - 1 ? 'Add Location' : 'Continue'}
                                        </Button>
                                    </Stack>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {/*<Divider sx={{my: 2}}/>*/}

                    {/*<Stack direction={'row'} justifyContent={'end'} spacing={1}>*/}
                    {/*    <Button*/}
                    {/*        onClick={() => {*/}
                    {/*            onClose?.();*/}
                    {/*        }}*/}
                    {/*        variant={'contained'}*/}
                    {/*    >*/}
                    {/*        Add*/}
                    {/*    </Button>*/}
                    {/*    <Button*/}
                    {/*        onClick={() => {*/}
                    {/*            onClose?.();*/}
                    {/*        }}*/}
                    {/*        variant={'outlined'}*/}
                    {/*    >*/}
                    {/*        Close*/}
                    {/*    </Button>*/}
                    {/*</Stack>*/}
                </Box>
                <Divider/>
            </Dialog>
            <AddBinTypeDialog
                client_id={client_id}
                client_location_id={location.id}
                open={addBinTypeDialog.open}
                onClose={addBinTypeDialog.handleClose}
                onSubmit={(binType) => {
                    setLocation({
                        ...location,
                        bin_types: [
                            ...location.bin_types,
                            binType,
                        ]
                    })
                }}
            />
        </>
    );
};
