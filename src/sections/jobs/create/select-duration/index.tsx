import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    Button,
    Card,
    CardContent, FormControl,
    Grid,
    InputAdornment,
    InputLabel, MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Typography
} from "@mui/material";
import {ArrowDropDown} from "@mui/icons-material";
import {_clientTypes} from "../select-client";
import Checkbox from "@mui/material/Checkbox";


const _durationOptions = [15, 30, 45, 60, 75, 90, 105, 120];
interface SelectDurationProps {
    duration: number;
    setFieldValue: (field: string, value: any) => void;
}
export const SelectDuration: FC<SelectDurationProps> = (props) => {
    const {duration, setFieldValue} = props;

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 2}}
            >
                Duration
            </Typography>

            <Select
                fullWidth
                value={duration}
                onChange={(e) => {
                    setFieldValue('duration', e.target.value)
                    setFieldValue('end_time_window', null);
                }}
                input={<OutlinedInput />}
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
                {_durationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {`${option} minutes`}
                    </MenuItem>
                ))}
            </Select>
        </Stack>
    );
}
