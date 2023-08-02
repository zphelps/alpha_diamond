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
import {addMinutes, format, set, startOfDay} from "date-fns";


const _durationOptions = [15, 30, 45, 60, 75, 90, 105, 120];
interface SelectDurationProps {
    duration: number;
    timestamp: string;
    setFieldValue: (field: string, value: any) => void;
}
export const SelectDateAndDuration: FC<SelectDurationProps> = (props) => {
    const {duration, timestamp, setFieldValue} = props;

    const [asSoonAsPossibleChecked, setAsSoonAsPossibleChecked] = useState(false);

    const [anytimeChecked, setAnytimeChecked] = useState(false);

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
                    input={<OutlinedInput sx={{height: '55px'}}/>}
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

                <Stack alignItems={'start'} sx={{mt: 1, width: '100%'}}>
                    <DatePicker
                        disabled={!timestamp}
                        sx={{width: '100%'}}
                        label="Date"
                        onChange={(e) => {
                            setFieldValue('timestamp', e.toISOString());
                            setFieldValue('start_time_window', format(e, 'HH:mm'));
                            setFieldValue('end_time_window', format(addMinutes(e, duration), 'HH:mm'));
                        }}
                        slots={{
                            textField: TextField,
                        }}

                        // @ts-ignore
                        // renderInput={(inputProps) => <TextField {...inputProps} />}
                        value={timestamp ? new Date(timestamp) : startOfDay(new Date())}
                    />
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox
                            disabled={anytimeChecked}
                            value={asSoonAsPossibleChecked}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setAsSoonAsPossibleChecked(true);
                                    setFieldValue('timestamp', null);
                                    setFieldValue('start_time_window', null);
                                    setFieldValue('end_time_window', null);
                                } else {
                                    setAsSoonAsPossibleChecked(false);
                                    const date = new Date();
                                    setFieldValue('timestamp', date.toISOString());
                                    setFieldValue('start_time_window', format(date, 'HH:mm'));
                                    setFieldValue('end_time_window', format(addMinutes(date, duration), 'HH:mm'));
                                }
                            }}
                        />
                        <Typography
                            variant={'subtitle2'}
                            color={anytimeChecked ? 'text.disabled' : 'text.primary'}
                        >
                            Schedule as soon as possible
                        </Typography>
                    </Stack>
                </Stack>

                <Stack alignItems={'start'} sx={{mt: 1, width: '100%'}}>
                    <TimePicker
                        disabled={anytimeChecked || asSoonAsPossibleChecked}
                        sx={{width: '100%'}}
                        label="Time"
                        onChange={(e) => {
                            setFieldValue('start_time_window', format(e, 'HH:mm'));
                            setFieldValue('end_time_window', format(addMinutes(e, duration), 'HH:mm'));
                        }}
                        slots={{
                            textField: TextField,
                        }}
                        value={timestamp ? new Date(timestamp) : startOfDay(new Date())}
                    />
                    <Stack direction={'row'} alignItems={'center'}>
                        <Checkbox
                            disabled={asSoonAsPossibleChecked}
                            value={anytimeChecked}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setAnytimeChecked(true);
                                    setFieldValue('start_time_window', null);
                                    setFieldValue('end_time_window', null);
                                } else {
                                    setAnytimeChecked(false);
                                    const date = new Date();
                                    setFieldValue('start_time_window', format(date, 'HH:mm'));
                                    setFieldValue('end_time_window', format(addMinutes(date, duration), 'HH:mm'));
                                }
                            }}
                        />
                        <Typography
                            variant={'subtitle2'}
                            color={asSoonAsPossibleChecked ? 'text.disabled' : 'text.primary'}
                        >
                            Any time of day
                        </Typography>
                    </Stack>

                </Stack>

            </Stack>



        </Stack>
    );
}
