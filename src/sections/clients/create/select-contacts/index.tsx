import {FC, useEffect, useState} from "react";
import {
    Checkbox,
    Divider, FormControl,
    InputAdornment, InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {ChargeUnit} from "../../../../types/job.ts";
import {ServiceType} from "../../../../types/service.ts";
import {ArrowDropDown} from "@mui/icons-material";
import {_clientTypes} from "../../../../pages/clients/list.tsx";
import GooglePlacesAutocomplete from "../../../../components/google-places-autocomplete.tsx";

interface SelectClientContactsProps {
    handleServiceContactFirstNameChange?: (e: never) => void;
    handleServiceContactLastNameChange?: (e: never) => void;
    handleServiceContactEmailChange?: (e: never) => void;
    handleServiceContactPhoneChange?: (e: never) => void;
    handleBillingContactFirstNameChange?: (e: never) => void;
    handleBillingContactLastNameChange?: (e: never) => void;
    handleBillingContactEmailChange?: (e: never) => void;
    handleBillingContactPhoneChange?: (e: never) => void;
}

export const SelectClientContacts: FC<SelectClientContactsProps> = (props) => {
    const {
        handleServiceContactFirstNameChange,
        handleServiceContactLastNameChange,
        handleServiceContactEmailChange,
        handleServiceContactPhoneChange,
        handleBillingContactFirstNameChange,
        handleBillingContactLastNameChange,
        handleBillingContactEmailChange,
        handleBillingContactPhoneChange,
    } = props;

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Service Contact
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                This is the person who will receive service-related communications from Central. You can change your service contact later.
            </Typography>
            <Stack spacing={2}>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        onChange={handleServiceContactFirstNameChange}
                        label={"First Name"}
                    />
                    <TextField
                        required
                        fullWidth
                        onChange={handleServiceContactLastNameChange}
                        label={"Last Name"}
                    />
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        onChange={handleServiceContactEmailChange}
                        label={"Email"}
                    />
                    <TextField
                        required
                        fullWidth
                        onChange={handleServiceContactPhoneChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Typography variant={'caption'}>+1</Typography></InputAdornment>,
                        }}
                        label={"Phone"}
                    />
                </Stack>
            </Stack>

            <Divider sx={{my: 3}}/>

            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Billing Contact
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                This is the person who will receive billing-related communications from Central. You can change your billing contact later.
            </Typography>
            <Stack spacing={2}>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        onChange={handleBillingContactFirstNameChange}
                        label={"First Name"}
                    />
                    <TextField
                        required
                        fullWidth
                        onChange={handleBillingContactLastNameChange}
                        label={"Last Name"}
                    />
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        onChange={handleBillingContactEmailChange}
                        label={"Email"}
                    />
                    <TextField
                        required
                        fullWidth
                        onChange={handleBillingContactPhoneChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Typography variant={'caption'}>+1</Typography></InputAdornment>,
                        }}
                        label={"Phone"}
                    />
                </Stack>
            </Stack>
            <Divider sx={{my: 3}}/>
        </Stack>
    );
};
