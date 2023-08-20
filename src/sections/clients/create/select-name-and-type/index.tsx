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

interface SelectClientNameProps {
    handleClientNameChange: (e: never) => void;
    handleClientTypeChange: (e: never) => void;
}

export const SelectClientNameAndType: FC<SelectClientNameProps> = (props) => {
    const {
        handleClientNameChange,
        handleClientTypeChange,
    } = props;

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 3}}
            >
                Client Name & Type
            </Typography>
            <Stack direction={'row'} spacing={2}>
                <FormControl
                    sx={{
                        flexShrink: 0,
                        minWidth: 200,
                    }}
                >
                    <InputLabel>Type</InputLabel>
                    <Select
                        placeholder={'Select Type'}
                        defaultValue={''}
                        onChange={handleClientTypeChange}
                        input={<OutlinedInput label="Type" placeholder={'Type'} />}
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
                        {_clientTypes.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    required
                    fullWidth
                    onChange={handleClientNameChange}
                    label={"Name"}
                />
            </Stack>
            <Divider sx={{my: 3}}/>
        </Stack>
    );
};
