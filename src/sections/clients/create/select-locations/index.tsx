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

interface SelectClientLocationsProps {
    handleServiceLocationChange?: (e: never) => void;
    handleBillingLocationChange?: (e: never) => void;
}

export const SelectClientLocations: FC<SelectClientLocationsProps> = (props) => {
    const {
        handleServiceLocationChange,
        handleBillingLocationChange,
    } = props;

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Service Location
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                This is the location where you will be primarily providing services to the client. You can add more service locations later.
            </Typography>
            <Stack direction={'row'} spacing={2}>
                <GooglePlacesAutocomplete handleAddressChange={handleServiceLocationChange} />
            </Stack>

            <Divider sx={{my: 3}}/>
            
            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Billing Location
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                This is the location from which you will be sending invoices to the client. You can change your billing location later.
            </Typography>
            <Stack direction={'row'} spacing={2}>
                <GooglePlacesAutocomplete handleAddressChange={handleBillingLocationChange} />
            </Stack>
            <Divider sx={{my: 3}}/>
        </Stack>
    );
};
