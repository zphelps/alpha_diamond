import type {FC} from "react";
import {Box, Card, Stack, Typography, Unstable_Grid2 as Grid} from "@mui/material";
import {Job} from "../../types/job.ts";
import {SeverityPill} from "../severity-pill.tsx";
import { ServiceType } from "../../types/service.ts";

interface JobsSummaryProps {
    jobs: Job[];
}

export const JobsSummary: FC<JobsSummaryProps> = (props) => {
    const {jobs} = props;

    return (
        <Card>
            <Grid
                container
                sx={{
                    "& > *:not(:last-of-type)": {
                        borderRight: (theme) => ({
                                md: `1px solid ${theme.palette.divider}`
                            }
                        ),
                        borderBottom: (theme) => ({
                                xs: `1px solid ${theme.palette.divider}`,
                                md: "none"
                            }
                        )
                    }
                }}
            >
                <Grid
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {jobs.filter((job) => job.service_type === ServiceType.RECURRING).length}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{mt: 1}}
                            variant="overline"
                        >
                            Recurring Job{jobs.filter((job) => job.service_type === ServiceType.RECURRING).length === 1 ? "" : "s"}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {jobs.filter((job) => job.service_type === ServiceType.ON_DEMAND).length}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{mt: 1}}
                            variant="overline"
                        >
                            On-Demand Job{jobs.filter((job) => job.service_type === ServiceType.ON_DEMAND).length === 1 ? "" : "s"}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {jobs.filter((job) => job.service_type === ServiceType.DEMO).length}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{mt: 1}}
                            variant="overline"
                        >
                            Demo Job{jobs.filter((job) => job.service_type === ServiceType.DEMO).length === 1 ? "" : "s"}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {jobs.filter((job) => job.service_type === ServiceType.TRIAL).length}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{mt: 1}}
                            variant="overline"
                        >
                            Trial Job{jobs.filter((job) => job.service_type === ServiceType.TRIAL).length === 1 ? "" : "s"}
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Card>
    )
};
