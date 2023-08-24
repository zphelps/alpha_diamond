import React, {FC, useEffect, useState} from 'react';
import {useAuth} from "../../hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {Box, Button, Dialog, Divider, Link, Stack, Typography} from "@mui/material";
import {Service, ServiceType} from "../../types/service.ts";
import PropTypes from "prop-types";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {format} from "date-fns";
import {PropertyList} from "../../components/property-list.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {getJobRecurrenceDescription} from "../../utils/job-recurrence-description.ts";

interface ServicePreviewDialogProps {
    service?: Service;
    onClose?: () => void;
    open?: boolean;
}

export const ServicePreviewPreviewDialog: FC<ServicePreviewDialogProps> = (props) => {
    const {
        service,
        onClose,
        open = false,
    } = props;

    const navigate = useNavigate();

    return (
        <>
            <Dialog
                fullWidth
                onClose={onClose}
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        margin: 0,
                        width: '100%',
                    },
                }}
            >
                <Box sx={{p: 3}}>
                    <Typography
                        variant="h5"
                        sx={{mb: 1.5}}
                    >
                        {`SER-${service?.id.split('-')[0].toUpperCase()}`}
                    </Typography>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                    >
                        <SeverityPill color={getSeverityServiceTypeColor(service?.job.service_type)}>
                            {service?.job.service_type}
                        </SeverityPill>
                        <SeverityPill color={getSeverityStatusColor(service?.status)}>
                            {service?.status}
                        </SeverityPill>
                    </Stack>

                    <Divider sx={{mt: 2.5}}/>

                    <PropertyList>
                        <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={'horizontal'}
                            divider
                            label="Client"
                        >
                            <Link
                                component={RouterLink}
                                href={`/clients/${service.client.id}`}
                            >
                                <Typography
                                    variant={"body2"}
                                >
                                    {service.client.name}
                                </Typography>
                            </Link>
                        </PropertyListItem>
                        {/*<PropertyListItem*/}
                        {/*    sx={{*/}
                        {/*        px: 0,*/}
                        {/*        py: 1.5,*/}
                        {/*    }}*/}
                        {/*    align={'horizontal'}*/}
                        {/*    divider*/}
                        {/*    label="Job"*/}
                        {/*>*/}
                        {/*    <Link*/}
                        {/*        component={RouterLink}*/}
                        {/*        href={`/jobs/${service.job.id}`}*/}
                        {/*    >*/}
                        {/*        <Typography*/}
                        {/*            variant={"body2"}*/}
                        {/*        >*/}
                        {/*            {`JOB-${service.job.id.split("-").shift().toUpperCase()}`}*/}
                        {/*        </Typography>*/}
                        {/*    </Link>*/}
                        {/*</PropertyListItem>*/}

                        {service.job.service_type === ServiceType.RECURRING && <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={"horizontal"}
                            divider
                            label="Recurrence"
                            // @ts-ignore
                            value={getJobRecurrenceDescription(service?.job)}
                        />}

                        <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={'horizontal'}
                            divider
                            label="Scheduled For"
                            value={format(new Date(service?.timestamp), 'MM/dd/yyyy h:mm a')}
                        />

                        <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={'horizontal'}
                            label="Duration"
                            divider
                            value={`${service?.duration} minutes`}
                        />

                        <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={'horizontal'}
                            divider
                            label="Address"
                            value={service?.location.formatted_address}
                        />

                        <PropertyListItem
                            sx={{
                                px: 0,
                                py: 1.5,
                            }}
                            align={'horizontal'}
                            label="On-Site Contact"
                            value={`${service?.on_site_contact.first_name} ${service?.on_site_contact.last_name}`}
                        />
                    </PropertyList>

                    <Divider sx={{mb: 2.5}}/>

                    <Stack direction={'row'} justifyContent={'end'} spacing={1}>
                        <Button
                            onClick={() => {
                                onClose?.();
                                navigate(`/services/${service?.id}`)
                            }}
                            variant={'contained'}
                        >
                            View Service
                        </Button>
                        <Button
                            onClick={() => {
                                onClose?.();
                            }}
                            variant={'outlined'}
                        >
                            Close
                        </Button>
                    </Stack>
                </Box>
                <Divider/>
            </Dialog>
        </>
    );
};

ServicePreviewPreviewDialog.propTypes = {
    // @ts-ignore
    service: PropTypes.object,
    onClose: PropTypes.func,
    open: PropTypes.bool,
};
