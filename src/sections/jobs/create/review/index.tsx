import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    Box,
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
import {_clientTypes} from "../../../../components/select-client";
import Checkbox from "@mui/material/Checkbox";
import {PropertyList} from "../../../../components/property-list.tsx";
import {PropertyListItem} from "../../../../components/property-list-item.tsx";
import {SeverityPill} from "../../../../components/severity-pill.tsx";
import {CreateJobFormValues} from "../../../../pages/jobs/create.tsx";
import {daysOfWeek} from "../select-recurrence";
import {schedulerApi} from "../../../../api/scheduler";
import {ChargeUnit, Job} from "../../../../types/job.ts";
import {getSeverityServiceTypeColor} from "../../../../utils/severity-color.ts";
import {format} from "date-fns";

interface ReviewProps {
    formValues: CreateJobFormValues;
}

export const Review: FC<ReviewProps> = (props) => {
    const {formValues} = props;
    const [loading, setLoading] = useState(false);

    return loading ? (
        <Stack>
            <Typography>
                Finalizing job...
            </Typography>
        </Stack>
        ) : (
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
                Confirm the details of your job before submitting. You can always edit the details of the job later.
                {formValues.service_type === 'Recurring' && ` **NOTE: Services for this recurring job will not begin until the next calendar week.**`}
            </Typography>

            <Stack direction={'row'} spacing={2}>
                <Card variant={'outlined'} sx={{pb: 2, width: '100%'}}>
                    <CardHeader title="Overview" />
                    <PropertyList>
                        <PropertyListItem
                            divider
                            label="Type"
                            // value={formValues.service_type}
                        >
                            <SeverityPill color={getSeverityServiceTypeColor(formValues.service_type)}>
                                {formValues.service_type}
                            </SeverityPill>
                        </PropertyListItem>
                        <PropertyListItem
                            divider
                            label="Client"
                            // @ts-ignore
                            value={formValues.client.name}
                        />
                        <PropertyListItem
                            divider
                            label="Service Location"
                            // @ts-ignore
                            value={`${formValues.location.formatted_address}`}
                        />
                        <PropertyListItem
                            divider
                            label="On-Site Contact"
                            // @ts-ignore
                            value={`${formValues.on_site_contact.first_name} ${formValues.on_site_contact.last_name}`}
                        />
                        {formValues.charge_unit === ChargeUnit.MONTH && <PropertyListItem
                            label="Monthly Charge"
                            value={`$${formValues.charge_per_unit}`}
                        />}
                        {formValues.charge_unit !== ChargeUnit.MONTH && <PropertyListItem
                            label="Charge"
                            value={`$${formValues.charge_per_unit} / ${formValues.charge_unit}`}
                        />}
                    </PropertyList>
                </Card>

                <Card variant={'outlined'} sx={{pb: 2, width: '100%'}}>
                    <CardHeader title={formValues.service_type === 'Recurring' ? 'Recurrence Logistics' : 'Service Logistics'} />
                    <PropertyList>
                        {formValues.timestamp && <PropertyListItem
                            divider
                            label="Scheduled For"
                            value={formValues.start_time_window
                                ? format(new Date(formValues.timestamp), "MM/dd/yyyy HH:mm a")
                                : `Any time on ${format(new Date(formValues.timestamp), "MM/dd/yyyy")}`}
                        />}
                        {!formValues.timestamp && formValues.service_type !== 'Recurring' && <PropertyListItem
                            divider
                            label="Scheduled For"
                            value={'ASAP'}
                        />}
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
                        {formValues.services_per_week && (formValues.days_of_week ?? []).length <= 0 && <PropertyListItem
                            divider
                            label="Services Per Week"
                            value={formValues.services_per_week.toString()}
                        />}
                        {formValues.service_type === 'Recurring' && <PropertyListItem
                            divider
                            label="Time Window"
                            value={!formValues.start_time_window ? "Any" : `${formValues.start_time_window} - ${formValues.end_time_window}`}
                        />}
                        <PropertyListItem
                            divider
                            label="Summary"
                            value={formValues.summary}
                        />
                        <PropertyListItem
                            label="Driver Instructions"
                            value={formValues.driver_notes}
                        />
                    </PropertyList>
                </Card>
            </Stack>

            <Divider sx={{mt: 3, mb: 1}} />

        </Stack>
    );
}
