import type {FC} from "react";
import {Box, Card, Stack, Typography, Unstable_Grid2 as Grid} from "@mui/material";
import {Service} from "../../types/service.ts";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {format} from "date-fns";
import numeral from 'numeral';
import {ChargeUnit} from "../../types/job.ts";

interface ServiceChargeDetailsProps {
    service: Service;
}

export const ServiceChargeDetails: FC<ServiceChargeDetailsProps> = (props) => {
    const {service} = props;
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
                    lg={6}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {numeral(service.num_units_to_charge * service.job.charge_per_unit).format(`$0,0.00`)}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{mt: 1}}
                            variant="overline"
                        >
                            Total
                        </Typography>
                    </Stack>
                </Grid>
                <Grid
                    xs={12}
                    lg={6}
                >
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{p: 3}}
                    >
                        <Typography variant="h5">
                            {service.job.charge_unit === ChargeUnit.PERCENT_COMPACTED ? `${service.num_units_to_charge * 100}%` : service.num_units_to_charge}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            {(() => {
                                switch (service.job.charge_unit) {
                                    case ChargeUnit.BIN:
                                        return "Bins Smashed"
                                    case ChargeUnit.HOUR:
                                        return "Hours"
                                    case ChargeUnit.PERCENT_COMPACTED:
                                        return "Total Compaction"
                                }
                                return "Units Charged"
                            })()}
                        </Typography>
                    </Stack>
                </Grid>
                {/*<Grid*/}
                {/*    xs={12}*/}
                {/*    sm={6}*/}
                {/*    md={3}*/}
                {/*>*/}
                {/*    <Stack*/}
                {/*        alignItems="center"*/}
                {/*        spacing={1}*/}
                {/*        sx={{p: 3}}*/}
                {/*    >*/}
                {/*        <Typography variant="h5">*/}
                {/*            230*/}
                {/*        </Typography>*/}
                {/*        <Typography*/}
                {/*            color="text.secondary"*/}
                {/*            variant="overline"*/}
                {/*        >*/}
                {/*            Today&apos;s Visitors*/}
                {/*        </Typography>*/}
                {/*    </Stack>*/}
                {/*</Grid>*/}
                {/*<Grid*/}
                {/*    xs={12}*/}
                {/*    md={3}*/}
                {/*    sm={6}*/}
                {/*>*/}
                {/*    <Stack*/}
                {/*        alignItems="center"*/}
                {/*        spacing={1}*/}
                {/*        sx={{p: 3}}*/}
                {/*    >*/}
                {/*        <Stack*/}
                {/*            alignItems="center"*/}
                {/*            direction="row"*/}
                {/*            spacing={1}*/}
                {/*        >*/}
                {/*            <Typography*/}
                {/*                component="span"*/}
                {/*                variant="h5"*/}
                {/*            >*/}
                {/*                5*/}
                {/*            </Typography>*/}
                {/*            <SeverityPill color="primary">*/}
                {/*                Live*/}
                {/*            </SeverityPill>*/}
                {/*        </Stack>*/}
                {/*        <Typography*/}
                {/*            color="text.secondary"*/}
                {/*            variant="overline"*/}
                {/*        >*/}
                {/*            Active now*/}
                {/*        </Typography>*/}
                {/*    </Stack>*/}
                {/*</Grid>*/}
            </Grid>
        </Card>
    );
};
