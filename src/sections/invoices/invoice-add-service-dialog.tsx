import "react";
import React, {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    Box,
    Button, Card,
    Dialog,
    Divider,
    Stack,
    Typography
} from "@mui/material";
import {endOfMonth, format, startOfMonth} from "date-fns";
import PropTypes from "prop-types";
import {FieldArrayMethodProps} from "react-hook-form";
import {ChargeUnit} from "../../types/job.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {NonInvoicedClientJob, SelectNonInvoicedJobs} from "../../components/select-non-invoiced-jobs";

interface InvoiceAddServiceDialogProps {
    client_id?: string;
    existing_service_ids?: string[];
    append: (value: unknown, options?: FieldArrayMethodProps) => void;
    onClose?: () => void;
    open?: boolean;
}

export const InvoiceAddServiceDialog: FC<InvoiceAddServiceDialogProps> = (props) => {
    const {
        client_id,
        existing_service_ids,
        onClose,
        open = false,
        append,
    } = props;

    const [selectedJobs, setSelectedJobs] = useState<NonInvoicedClientJob[]>([]);

    const handleJobSelectionChange = useCallback(
        (jobs: NonInvoicedClientJob[]) => {
            setSelectedJobs(jobs);
        }, []);

    if (!client_id || !existing_service_ids) {
        return null;
    }

    return (
        <>
            <Dialog
                fullWidth
                onClose={onClose}
                open={open}
                sx={{
                    "& .MuiDialog-paper": {
                        margin: 0,
                        width: "100%",
                        minWidth: "60%",
                    },
                }}
            >
                <Box sx={{p: 3}}>
                    <Typography
                        variant="h5"
                        sx={{mb: 3}}
                    >
                        Add Job(s)
                    </Typography>

                    <Card variant={"outlined"} sx={{borderRadius: "10px"}}>
                        <SelectNonInvoicedJobs
                            client_id={client_id}
                            existing_service_ids={existing_service_ids}
                            handleJobSelectionChange={handleJobSelectionChange}
                        />
                    </Card>

                    <Stack sx={{mt: 2}} direction={"row"} justifyContent={"end"} spacing={1}>
                        <Button
                            onClick={() => {
                                onClose?.();
                            }}
                            variant={"outlined"}
                        >
                            Close
                        </Button>
                        <Button
                            disabled={selectedJobs.length === 0}
                            onClick={() => {
                                for (const job of selectedJobs) {
                                    // const [month, job_id] = row_identifier.split("->");
                                    // const job = clientServicesStore.jobs[row_identifier];
                                    if (job.charge_unit === ChargeUnit.MONTH) {
                                        props.append({
                                            id: uuid(),
                                            date: endOfMonth(Date.parse(job.services[0].completed_on)).toISOString(),
                                            job_id: job.id,
                                            charge_unit: job.charge_unit,
                                            charge_per_unit: job.charge_per_unit,
                                            service_type: job.service_type,
                                            description: `Monthly Recurring Charge - ${format(Date.parse(job.services[0].completed_on), "MMMM")} ${format(Date.parse(job.services[0].completed_on), "yyyy")}`,
                                            total: job.charge_per_unit,
                                            service_ids: job.services.map((service) => service.id),
                                        });
                                    } else {
                                        for (const service of job.services) {
                                            props.append({
                                                id: uuid(),
                                                date: service.completed_on,
                                                job_id: job.id,
                                                service_ids: [service.id],
                                                charge_unit: job.charge_unit,
                                                charge_per_unit: job.charge_per_unit,
                                                num_units: service.num_units_to_charge,
                                                service_type: job.service_type,
                                                description: `${job.service_type} - Charged by ${job.charge_unit}`,
                                                total: service.num_units_to_charge * job.charge_per_unit,
                                            });
                                        }
                                    }
                                }
                                onClose?.();
                            }}
                            variant={"contained"}
                        >
                            Add to Invoice
                        </Button>
                    </Stack>
                </Box>
                <Divider/>
            </Dialog>
        </>
    );
};

InvoiceAddServiceDialog.propTypes = {
    // @ts-ignore
    service: PropTypes.object,
    onClose: PropTypes.func,
    open: PropTypes.bool,
};
