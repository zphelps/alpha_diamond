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


const _startTimeOptions = [
    new Date(2000, 1, 1, 7, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 7, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 8, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 8, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 9, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 9, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 10, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 10, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 11, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 11, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 12, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 12, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 13, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 13, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 14, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 14, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 15, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 15, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 16, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 16, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 17, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 17, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 18, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 18, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 19, 0).toLocaleTimeString(),
    new Date(2000, 1, 1, 19, 30).toLocaleTimeString(),
    new Date(2000, 1, 1, 20, 0).toLocaleTimeString(),
];
interface SelectTimeWindowProps {
    start_time_window: string;
    end_time_window: string;
    any_time: boolean;
    setFieldValue: (field: string, value: any) => void;
}

export const SelectTimeWindow: FC<SelectTimeWindowProps> = (props) => {
    const {start_time_window, end_time_window, setFieldValue, any_time} = props;
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
                        <MenuItem key={option} value={option}>
                            {`${option}`}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    fullWidth
                    disabled={autoSelect}
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
                    {_startTimeOptions.filter((e, i) => i > _startTimeOptions.indexOf(start_time_window)).map((option) => (
                        <MenuItem key={option} value={option}>
                            {`${option}`}
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
