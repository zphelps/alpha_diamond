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
import {CreateClientFormValues} from "../../../../pages/clients/create.tsx";

interface SelectAccountContactProps {
    values: CreateClientFormValues;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

export const SelectAccountContact: FC<SelectAccountContactProps> = (props) => {
    const {
        values,
        setFieldValue
    } = props;

    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("account_contact.first_name", event.target.value === "" ? null : event.target.value);
    }

    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("account_contact.last_name", event.target.value === "" ? null : event.target.value);
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("account_contact.email", event.target.value === "" ? null : event.target.value);
    }

    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("account_contact.phone", event.target.value === "" ? null : event.target.value);
    }

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Account Contact
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                This is the primary contact for your account. You can change your account contact later.
            </Typography>
            <Stack spacing={2}>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        value={values.account_contact.first_name ?? ""}
                        onChange={handleFirstNameChange}
                        label={"First Name"}
                    />
                    <TextField
                        required
                        fullWidth
                        value={values.account_contact.last_name ?? ""}
                        onChange={handleLastNameChange}
                        label={"Last Name"}
                    />
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        value={values.account_contact.email ?? ""}
                        onChange={handleEmailChange}
                        label={"Email"}
                    />
                    <TextField
                        required
                        fullWidth
                        value={values.account_contact.phone ?? ""}
                        onChange={handlePhoneChange}
                        type={'number'}
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
