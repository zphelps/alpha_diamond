import type {FC} from "react";
import {useCallback} from "react";
import Truck02Icon from "@untitled-ui/icons-react/build/esm/Truck02";
import {
    Avatar,
    Box,
    ButtonBase, Chip,
    Collapse,
    Divider,
    LinearProgress,
    Stack,
    SvgIcon,
    Typography
} from "@mui/material";
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    timelineItemClasses,
    TimelineSeparator
} from "@mui/lab";
import {Truck} from "../../types/truck.ts";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {getTruckStatusColor} from "../../utils/severity-color.ts";

interface FleetTruckProps {
    onDeselect?: () => void;
    onSelect?: (vehicleId: string) => void;
    selected?: boolean;
    truck: Truck;
}

export const FleetTruck: FC<FleetTruckProps> = (props) => {
    const {onDeselect, onSelect, selected, truck} = props;

    const handleToggle = useCallback(
        (): void => {
            if (!selected) {
                onSelect?.(truck.id);
            } else {
                onDeselect?.();
            }
        },
        [
            onDeselect,
            onSelect,
            selected,
            truck
        ]
    );

    return (
        <Stack component="li">
            <ButtonBase
                sx={{
                    alignItems: "center",
                    justifyContent: "flex-start",
                    p: 2,
                    textAlign: "left",
                    width: "100%"
                }}
                onClick={handleToggle}
            >
                <Avatar sx={{mr: 2, p: 2.75}}>
                    <SvgIcon fontSize={"medium"}>
                        <Truck02Icon/>
                    </SvgIcon>
                </Avatar>
                <div>
                    <Typography sx={{mb: 0.5}} variant={"subtitle1"}>
                        {truck.name}
                    </Typography>
                    <SeverityPill
                        color={"info"}
                        sx={{mr: 1}}
                    >
                        {`#${truck.id.split("-").shift().toUpperCase()}`}
                    </SeverityPill>
                    <SeverityPill
                        color={getTruckStatusColor(truck.status)}
                    >
                        {truck.status}
                    </SeverityPill>
                </div>
            </ButtonBase>
            <Collapse in={selected}>
                <Divider/>
                <Box sx={{p: 2}}>
                    <Stack spacing={1}>
                        <Typography
                            color="text.secondary"
                            variant="caption"
                        >
                            Service Progress (good)
                        </Typography>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                        >
                            <LinearProgress
                                value={8}
                                sx={{flexGrow: 1}}
                                variant="determinate"
                            />
                            {/*<Typography*/}
                            {/*  color="text.secondary"*/}
                            {/*  variant="body2"*/}
                            {/*>*/}
                            {/*  Temp*/}
                            {/*</Typography>*/}
                        </Stack>
                    </Stack>
                    <Timeline
                        position="right"
                        sx={{
                            px: 3,
                            [`& .${timelineItemClasses.root}:before`]: {
                                flex: 0,
                                padding: 0
                            }
                        }}
                    >
                        <TimelineItem>
                            <TimelineSeparator>
                                <TimelineDot color="primary"/>
                                <TimelineConnector/>
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography variant="body2">
                                        Day Started
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {truck.startedAt}
                                    </Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelineSeparator>
                                <TimelineDot color="primary"/>
                                <TimelineConnector/>
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography variant="body2">
                                        Chrysalis Global
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {truck.departedAt}
                                    </Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelineSeparator>
                                <TimelineDot color="primary"/>
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography variant="body2">
                                        Arrived
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {truck.arrivedAt}
                                    </Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                    </Timeline>
                </Box>
            </Collapse>
        </Stack>
    );
};
