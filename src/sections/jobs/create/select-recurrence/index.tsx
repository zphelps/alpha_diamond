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


const _freqOptions = [1, 2, 3, 4, 5];
interface SelectRecurrenceProps {
    days_of_week: number[];
    services_per_week: number;
    setFieldValue: (field: string, value: any) => void;
}

export const daysOfWeek = [
    {
        label: 'Monday',
        value: 1,
    },
    {
        label: 'Tuesday',
        value: 2,
    },
    {
        label: 'Wednesday',
        value: 3,
    },
    {
        label: 'Thursday',
        value: 4,
    },
    {
        label: 'Friday',
        value: 5,
    }
];
export const SelectRecurrence: FC<SelectRecurrenceProps> = (props) => {
    const {days_of_week, services_per_week, setFieldValue} = props;

    const [autoSelect, setAutoSelect] = useState(false);

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 0.75}}
            >
                Recurrence
            </Typography>

            <Typography
                color={'text.secondary'}
                variant={'subtitle2'}
                sx={{mb: 3}}
            >
                Service days can either be selected individually or by selecting the number of services per week.
            </Typography>

            <Stack direction={'row'}>
                {daysOfWeek.map((day) => (
                    <Button
                        disabled={!days_of_week}
                        fullWidth
                        key={day.value}
                        variant={'outlined'}
                        sx={{
                            mr: 2,
                            mb: 2,
                            p: 2,
                            color: (days_of_week ?? []).includes(day.value) ? 'primary.main' : 'text.secondary',
                            borderColor: (days_of_week ?? []).includes(day.value) ? 'primary.main' : 'text.disabled',
                            fontWeight: (days_of_week ?? []).includes(day.value) ? 'bold' : 'normal',
                        }}
                        onClick={() => {
                            const prev_services_per_week = (days_of_week ?? []).length;
                            if ((days_of_week ?? []).includes(day.value)) {
                                setFieldValue('days_of_week', (days_of_week ?? []).filter((d) => d !== day.value));
                                setFieldValue('services_per_week', prev_services_per_week === 1 ? null : prev_services_per_week - 1);
                            } else {
                                setFieldValue('days_of_week', [...(days_of_week ?? []), day.value]);
                                setFieldValue('services_per_week', prev_services_per_week + 1);
                            }
                        }}
                    >
                        {(days_of_week ?? []).includes(day.value) && (<Check sx={{mr: 1.5}}/>)}
                        {day.label}
                    </Button>
                ))}
            </Stack>

            <Stack direction={'row'} justifyContent={'space-between'}>
                <Stack direction={'row'} alignItems={'center'}>
                    <Checkbox
                        value={autoSelect}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setAutoSelect(true);
                                setFieldValue('days_of_week', null);
                                setFieldValue('services_per_week', 1);
                            } else {
                                setAutoSelect(false);
                                setFieldValue('days_of_week', []);
                                setFieldValue('services_per_week', null);
                            }
                        }}
                    />
                    <Typography
                        variant={'subtitle2'}
                    >
                        Automatically select service days
                    </Typography>
                </Stack>

                <Select
                    value={services_per_week ?? 1}
                    disabled={!autoSelect}
                    onChange={(e) => setFieldValue('services_per_week', e.target.value)}
                    input={<OutlinedInput placeholder={'Services / Week'}/>}
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
                    {_freqOptions.map((option) => (
                        <MenuItem key={option} value={option} placeholder={'Services / Week'}>
                            {`${option} service(s) / week`}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>


        </Stack>
    );
}
