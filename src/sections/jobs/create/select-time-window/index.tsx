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
import {ArrowDropDown, Check} from "@mui/icons-material";
import {_clientTypes} from "../select-client";
import Checkbox from "@mui/material/Checkbox";
import {addMinutes, format, formatRelative, isAfter, isBefore, set} from "date-fns";


const _startTimeOptions = [
    set(new Date(), {hours: 7, minutes: 0}),
    set(new Date(), {hours: 7, minutes: 30}),
    set(new Date(), {hours: 8, minutes: 0}),
    set(new Date(), {hours: 8, minutes: 30}),
    set(new Date(), {hours: 9, minutes: 0}),
    set(new Date(), {hours: 9, minutes: 30}),
    set(new Date(), {hours: 10, minutes: 0}),
    set(new Date(), {hours: 10, minutes: 30}),
    set(new Date(), {hours: 11, minutes: 0}),
    set(new Date(), {hours: 11, minutes: 30}),
    set(new Date(), {hours: 12, minutes: 0}),
    set(new Date(), {hours: 12, minutes: 30}),
    set(new Date(), {hours: 13, minutes: 0}),
    set(new Date(), {hours: 13, minutes: 30}),
    set(new Date(), {hours: 14, minutes: 0}),
    set(new Date(), {hours: 14, minutes: 30}),
    set(new Date(), {hours: 15, minutes: 0}),
    set(new Date(), {hours: 15, minutes: 30}),
    set(new Date(), {hours: 16, minutes: 0}),
    set(new Date(), {hours: 16, minutes: 30}),
    set(new Date(), {hours: 17, minutes: 0}),
    set(new Date(), {hours: 17, minutes: 30}),
    set(new Date(), {hours: 18, minutes: 0}),
    set(new Date(), {hours: 18, minutes: 30}),
    set(new Date(), {hours: 19, minutes: 0}),
    set(new Date(), {hours: 19, minutes: 30}),
    set(new Date(), {hours: 20, minutes: 0}),
];
interface SelectTimeWindowProps {
    start_time_window: string;
    end_time_window: string;
    any_time: boolean;
    duration: number;
    setFieldValue: (field: string, value: any) => void;
}

export const SelectTimeWindow: FC<SelectTimeWindowProps> = (props) => {
    const {start_time_window, end_time_window, duration, setFieldValue, any_time} = props;
    const [autoSelect, setAutoSelect] = useState(any_time);

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 0.75}}
            >
                Time Window
            </Typography>

            <Typography
                color={'text.secondary'}
                variant={'subtitle2'}
                sx={{mb: 3}}
            >
                Specific time windows can be set for service completion, or they can be set to occur at any time of day.
            </Typography>

            <Stack direction={'row'} spacing={2}>
                <Select
                    fullWidth
                    disabled={autoSelect}
                    value={start_time_window ?? ''}
                    onChange={(e) => {
                        setFieldValue('start_time_window', e.target.value);
                        setFieldValue('end_time_window', null);
                    }}
                    input={<OutlinedInput />}
                    startAdornment={
                        <InputAdornment position="start">
                            <Typography variant={'subtitle2'}>Start Window</Typography>
                        </InputAdornment>
                    }
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
                    {_startTimeOptions.map((option) => (
                        <MenuItem key={option.toLocaleTimeString()} value={format(Date.parse(option.toISOString()), 'HH:mm')}>
                            {`${format(Date.parse(option.toISOString()), 'hh:mm a')}`}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    fullWidth
                    disabled={autoSelect || !start_time_window}
                    value={end_time_window ?? ''}
                    onChange={(e) => setFieldValue('end_time_window', e.target.value)}
                    input={<OutlinedInput />}
                    startAdornment={
                        <InputAdornment position="start">
                            <Typography variant={'subtitle2'}>End Window</Typography>
                        </InputAdornment>
                    }
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
                    {_startTimeOptions.filter((e, i) => !start_time_window ||
                        isAfter(e, addMinutes(set(new Date(), {
                                        hours: parseInt(start_time_window.split(':')[0]),
                                        minutes: parseInt(start_time_window.split(':')[1]),
                                        seconds: 0
                                    }), duration))).map((option) => (
                        <MenuItem key={option.toLocaleTimeString()} value={format(Date.parse(option.toISOString()), 'HH:mm')}>
                            {`${format(Date.parse(option.toISOString()), 'hh:mm a')}`}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>

            <Stack direction={'row'} alignItems={'center'} sx={{mt: 1}}>
                <Checkbox
                    value={autoSelect}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setAutoSelect(true)
                            setFieldValue('any_time_window', true)
                            setFieldValue('start_time_window', null);
                            setFieldValue('end_time_window', null);
                        } else {
                            setAutoSelect(false)
                            setFieldValue('any_time_window', false)
                        }
                    }}
                />
                <Typography
                    variant={'subtitle2'}
                >
                    Any time of day
                </Typography>
            </Stack>


        </Stack>
    );
}
