import type {FC} from "react";
import type {Theme} from "@mui/material";
import {Button, Card, CardActions, CardHeader, Divider, Stack, Tooltip, Typography, useMediaQuery} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format, parse, parseISO} from "date-fns";
import PropTypes from "prop-types";
import {JobBasicDetails} from "./job-basic-details.tsx";
import {AutoAwesome} from "@mui/icons-material";
import {daysOfWeek} from "./create/select-recurrence";

interface JobRecurrenceDetailsProps {
    services_per_week?: number;
    days_of_week?: string[];
    start_time_window?: string;
    end_time_window?: string;
}

export const JobRecurrenceDetails: FC<JobRecurrenceDetailsProps> = (props) => {
    const {services_per_week, days_of_week, start_time_window, end_time_window} = props;
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    const align = mdUp ? "horizontal" : "vertical";

    return (
        <Card {...props} sx={{pb: 2}}>
            <CardHeader title="Recurrence"/>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Services / Week"
                    value={services_per_week.toString()}
                />
                <PropertyListItem
                    divider
                    align={align}
                    label="Day(s) of Week"
                    value={(days_of_week && days_of_week.length > 0) && days_of_week.map((d) => daysOfWeek[parseInt(d) - 1].label).join(" | ")}
                >
                    {(!days_of_week || days_of_week.length === 0) &&
                        <Tooltip title={"Days are automatically selected to optimize service schedule"}
                                 placement={"top"}>
                            {/*@ts-ignore*/}
                            <AutoAwesome fontSize={"sm"} sx={{mr: 1.5, color: "text.secondary"}}/>
                        </Tooltip>}
                </PropertyListItem>
                {(!start_time_window || !end_time_window) && <PropertyListItem
                    align={align}
                    label="Time of Day"
                    value={"Any"}
                />}
                {start_time_window && end_time_window && <PropertyListItem
                    align={align}
                    divider
                    label="Start Window"
                    value={format(parseISO(`2000-01-01T${start_time_window}.000`), "h:mm a")}
                />}
                {start_time_window && end_time_window && <PropertyListItem
                    align={align}
                    label="End Window"
                    value={format(parseISO(`2000-01-01T${end_time_window}.000`), "h:mm a")}
                />}
            </PropertyList>
        </Card>
    );
};


