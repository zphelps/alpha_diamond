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
    Stack, TextField,
    Typography
} from "@mui/material";
import {ArrowDropDown} from "@mui/icons-material";
import {_clientTypes} from "../select-client";
import Checkbox from "@mui/material/Checkbox";
import {DatePicker, DateTimePicker, TimePicker} from "@mui/x-date-pickers";
import {format} from "date-fns";


const _durationOptions = [15, 30, 45, 60, 75, 90, 105, 120];
interface SelectDurationProps {
    duration: number;
    setFieldValue: (field: string, value: any) => void;
}
export const SelectDateAndDuration: FC<SelectDurationProps> = (props) => {
    const {duration, setFieldValue} = props;

    const [checked, setChecked] = useState(false);

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 2}}
            >
                Date and Duration
            </Typography>

            <Stack direction={'row'} spacing={2}>
                <Select
                    fullWidth
                    value={duration}
                    onChange={(e) => setFieldValue('duration', e.target.value)}
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

                <DateTimePicker
                    sx={{width: '100%'}}
                    label="Date/Time"
                    onChange={(e) => {
                        setFieldValue('timestamp', e.toISOString());
                    }}
                    // @ts-ignore
                    renderInput={(inputProps) => <TextField {...inputProps} />}
                    value={new Date()}
                />
            </Stack>

            <Stack direction={'row'} alignItems={'center'}>
                <Checkbox
                    value={checked}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setChecked(true);
                            setFieldValue('timestamp', null);
                            setFieldValue('services_per_week', 1);
                        } else {
                            setChecked(false);
                            setFieldValue('days_of_week', []);
                            setFieldValue('services_per_week', null);
                        }
                    }}
                />
                <Typography
                    variant={'subtitle2'}
                >
                    Schedule as soon as possible
                </Typography>
            </Stack>

        </Stack>
    );
}
