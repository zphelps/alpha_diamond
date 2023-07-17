import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    Button,
    Card,
    CardContent, CardHeader, Divider, FormControl,
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
import {PropertyList} from "../../../../components/property-list.tsx";
import {PropertyListItem} from "../../../../components/property-list-item.tsx";
import {SeverityPill} from "../../../../components/severity-pill.tsx";
import {CreateJobFormValues} from "../../../../pages/jobs/create.tsx";
import {daysOfWeek} from "../select-recurrence";

interface ReviewProps {
    formValues: CreateJobFormValues;
}

export const Review: FC<ReviewProps> = (props) => {
    const {formValues} = props;

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 0.75}}
            >
                Review
            </Typography>

            <Typography
                color={'text.secondary'}
                variant={'subtitle2'}
                sx={{mb: 3}}
            >
                Confirm the details of your job before submitting.
            </Typography>

            <Stack direction={'row'} spacing={2}>
                <Card variant={'outlined'} sx={{pb: 2, width: '100%'}}>
                    <CardHeader title="Overview" />
                    <PropertyList>
                        <PropertyListItem
                            divider
                            label="Type"
                            value={formValues.service_type}
                        />
                        <PropertyListItem
                            divider
                            label="Client"
                            // @ts-ignore
                            value={formValues.client.name}
                        />
                        <PropertyListItem
                            divider
                            label="Location"
                            // @ts-ignore
                            value={`${formValues.location.street_address}, ${formValues.location.city}, ${formValues.location.state} ${formValues.location.zip}`}
                        />
                        <PropertyListItem
                            divider
                            label="On-Site Contact"
                            // @ts-ignore
                            value={`${formValues.on_site_contact.first_name} ${formValues.on_site_contact.last_name}`}
                        />
                        <PropertyListItem
                            label="Price"
                            value={`$${formValues.recurring_charge}`}
                        />
                    </PropertyList>
                </Card>

                <Card variant={'outlined'} sx={{pb: 2, width: '100%'}}>
                    <CardHeader title="Logistics" />
                    <PropertyList>
                        <PropertyListItem
                            divider
                            label="Duration"
                            value={`${formValues.duration} minutes`}
                        />
                        {(formValues.days_of_week ?? []).length > 0 && <PropertyListItem
                            divider
                            label="Days of Week"
                            value={`${formValues.days_of_week.map((d) => daysOfWeek[d-1].label).join(' | ')}`}
                        />}
                        {(formValues.days_of_week ?? []).length === 0 && <PropertyListItem
                            divider
                            label="Services Per Week"
                            value={formValues.services_per_week.toString()}
                        />}
                        <PropertyListItem
                            divider
                            label="Time Window"
                            value={!formValues.start_time_window ? 'Any' : `${formValues.start_time_window} - ${formValues.end_time_window}`}
                        />
                        <PropertyListItem
                            divider
                            label="Summary"
                            value={formValues.summary}
                        />
                        <PropertyListItem
                            label="Driver Notes"
                            value={formValues.driver_notes}
                        />
                    </PropertyList>
                </Card>
            </Stack>

            <Divider sx={{mt: 3, mb: 1}} />

        </Stack>
    );
}
