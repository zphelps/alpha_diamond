import React, {FC, useEffect, useState} from 'react';
import {useAuth} from "../../hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {
    Box,
    Button, Card,
    Dialog,
    Divider, FormControl, InputAdornment, InputLabel,
    Link, MenuItem, OutlinedInput, Select,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper, TextField,
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
import {Add, ArrowDropDown, Check, HourglassEmptyOutlined} from "@mui/icons-material";
import {BinSize, BinType} from "../../types/bin-type.ts";
import {_clientTypes} from "../../pages/clients/list.tsx";
import Checkbox from "@mui/material/Checkbox";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

const steps = [
    {
        label: 'General',
        description: `Provide some basic information to help drivers identify this type of bin at the service location. 
            You can change this later.`,
    },
    {
        label: 'Hauler Information',
        description: "Which provider hauls bins of this type? The information provided below will be used to contact the " +
            "client's hauler when there are bins of this type that are full. You can change this later.",
    },
    {
        label: 'Pricing',
        description: `How much do you want to charge to service this type of bin? You can change this later.`,
    },
];

const _binSizes = [
    BinSize.TWENTY_YARD,
    BinSize.THIRTY_YARD,
    BinSize.FORTY_YARD,
    BinSize.FIFTY_YARD,
    BinSize.SIXTY_YARD,
    BinSize.OTHER,
]

type Action = 'create' | 'update'

interface AddBinTypeDialogProps {
    action?: Action;
    initialBinType?: BinType;
    client_id: string;
    client_location_id: string;
    onClose?: () => void;
    onSubmit?: (binType: BinType) => void;
    open?: boolean;
}

export const AddBinTypeDialog: FC<AddBinTypeDialogProps> = (props) => {
    const {
        action,
        initialBinType,
        client_id,
        client_location_id,
        onClose,
        onSubmit,
        open = false,
    } = props;

    const navigate = useNavigate();

    const [binType, setBinType] = useState<BinType>({
        id: initialBinType?.id ?? uuid(),
        name: initialBinType?.name ?? null,
        description: initialBinType?.description ?? null,
        size: initialBinType?.size ?? null,
        on_demand_charge: initialBinType?.on_demand_charge ?? null,
        client_location_id: client_location_id,
        hauler: initialBinType?.hauler ?? {
            id: uuid(),
            name: null,
            email: null,
            phone: null,
            client_id: client_id,
            rate: null,
        }
    });

    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setBinType({
            id: uuid(),
            name: null,
            description: null,
            size: null,
            on_demand_charge: null,
            client_location_id: client_location_id,
            hauler: {
                id: uuid(),
                name: null,
                email: null,
                phone: null,
                client_id: client_id,
                rate: null,
            }
        });
        setActiveStep(0);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            name: event.target.value === "" ? null : event.target.value,
        })
    }

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            description: event.target.value === "" ? null : event.target.value,
        })
    }

    const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            size: event.target.value === "" ? null : event.target.value as BinSize,
        })
    }

    const handleHaulerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            hauler: {
                ...binType.hauler,
                name: event.target.value === "" ? null : event.target.value,
            }
        })
    }

    const handleHaulerEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            hauler: {
                ...binType.hauler,
                email: event.target.value === "" ? null : event.target.value,
            }
        })
    }

    const handleHaulerPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            hauler: {
                ...binType.hauler,
                phone: event.target.value === "" ? null : Number(event.target.value),
            }
        })
    }

    const handleHaulerRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            hauler: {
                ...binType.hauler,
                rate: event.target.value === "" ? null : Number(event.target.value),
            }
        })
    }

    const handleOnDemandChargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBinType({
            ...binType,
            on_demand_charge: event.target.value === "" ? null : Number(event.target.value),
        })
    }

    const handleAddBinType = async () => {
        await onSubmit?.(binType);
        handleReset();
        onClose();
    }

    useEffect(() => {
        console.log(binType);
    }, [binType]);

    useEffect(() => {
        console.log(initialBinType);
        if (initialBinType) {
            setBinType(initialBinType);
        }
    }, [initialBinType]);


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
                    },
                }}
            >
                <Box sx={{p: 3}}>
                    <Typography
                        variant="h5"
                        sx={{mb: 1.5}}
                    >
                        {action === 'update' ? 'Update Bin Type' : `Add Bin Type`}
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
                                        <Stack spacing={2}>
                                            <TextField
                                                required
                                                fullWidth
                                                value={binType.name ?? ""}
                                                onChange={handleNameChange}
                                                label={"Name"}
                                            />
                                            <TextField
                                                required
                                                fullWidth
                                                multiline
                                                rows={3}
                                                value={binType.description ?? ""}
                                                onChange={handleDescriptionChange}
                                                label={"Description"}
                                            />
                                            <FormControl
                                                sx={{
                                                    flexShrink: 0,
                                                    minWidth: 200,
                                                }}
                                            >
                                                <InputLabel>Bin Size</InputLabel>
                                                <Select
                                                    value={binType.size ?? ""}
                                                    placeholder={'Select Bin'}
                                                    onChange={handleSizeChange}
                                                    input={<OutlinedInput label="Size" placeholder={'Size'} />}
                                                    endAdornment={(
                                                        <InputAdornment position="end">
                                                            <ArrowDropDown fontSize="small" />
                                                        </InputAdornment>
                                                    )}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: { maxHeight: 240 },
                                                        },
                                                    }}
                                                >
                                                    {_binSizes.map((option) => (
                                                        <MenuItem key={option} value={option}>
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Stack>

                                    )}
                                    {activeStep === 1 && (
                                        <Stack spacing={2}>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={binType.hauler.name ?? ""}
                                                    onChange={handleHaulerNameChange}
                                                    label={"Name"}
                                                />
                                                <TextField
                                                    required
                                                    fullWidth
                                                    value={binType.hauler.email ?? ""}
                                                    onChange={handleHaulerEmailChange}
                                                    label={"Email"}
                                                />
                                            </Stack>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type={"number"}
                                                    value={binType.hauler.phone ?? ""}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Typography variant={'caption'}>+1</Typography></InputAdornment>,
                                                    }}
                                                    onChange={handleHaulerPhoneChange}
                                                    label={"Phone"}
                                                />
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type={"number"}
                                                    value={binType.hauler.rate ?? ""}
                                                    onChange={handleHaulerRateChange}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Typography variant={'body2'}>$</Typography></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end"><Typography variant={'body2'}>/ haul</Typography></InputAdornment>,
                                                    }}
                                                    label={"Rate"}
                                                />
                                            </Stack>
                                        </Stack>
                                    )}
                                    {activeStep === 2 && (
                                        <TextField
                                            required
                                            fullWidth
                                            type={"number"}
                                            value={binType.on_demand_charge ?? ""}
                                            onChange={handleOnDemandChargeChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Typography variant={'body2'}>$</Typography></InputAdornment>,
                                                endAdornment: <InputAdornment position="end"><Typography variant={'body2'}>/ bin</Typography></InputAdornment>,
                                            }}
                                            label={"Charge Per Bin"}
                                        />
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
                                            onClick={index === steps.length - 1 ? handleAddBinType : handleNext}
                                            sx={{ mt: 1, mr: 1 }}
                                            startIcon={index === steps.length - 1 && <Check />}
                                            disabled={(
                                                (activeStep === 0 && (!binType.name || !binType.description || !binType.size))
                                                || (activeStep === 1 && (!binType.hauler.name || !binType.hauler.email || !binType.hauler.phone || !binType.hauler.rate))
                                                || (activeStep === 2 && (!binType.on_demand_charge))
                                            )}
                                        >
                                            {index === steps.length - 1 ? `${action === 'update' ? 'Update' : 'Add'} Bin Type` : 'Continue'}
                                        </Button>
                                    </Stack>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                <Divider/>
            </Dialog>
        </>
    );
};
