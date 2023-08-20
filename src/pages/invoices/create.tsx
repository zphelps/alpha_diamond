import {Seo} from "../../components/seo.tsx";
import {
    Box,
    Button,
    Card, CardActions,
    CardContent,
    Container, Divider, List, ListItem, ListItemText,
    Stack,
    Step,
    StepLabel,
    Stepper,
    SvgIcon,
    Typography
} from "@mui/material";
import React, {FC, useEffect, useMemo, useState} from "react";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {ArrowForward, AutoAwesome, Check, Update} from "@mui/icons-material";
import {useBeforeUnload, useLocation, useNavigate} from "react-router-dom";
import {SelectServiceType} from "../../sections/jobs/create/select-service-type";
import {Service} from "../../types/service.ts";
import {supabase} from "../../config.ts";
import {useFormik} from "formik";
import toast from "react-hot-toast";
import {object, string, number, date, InferType, bool} from "yup";
import {SelectClient} from "../../components/select-client";
import {SelectClientLocation} from "../../sections/jobs/create/select-client-location";
import {SelectContact} from "../../sections/jobs/create/select-contact";
import {JobDetails} from "../../sections/jobs/create/job-details";
import {ChargeUnit, Job} from "../../types/job.ts";
import {SelectDuration} from "../../sections/jobs/create/select-duration";
import {SelectRecurrence} from "../../sections/jobs/create/select-recurrence";
import {SelectTimeWindow} from "../../sections/jobs/create/select-time-window";
import {Review} from "../../sections/jobs/create/review";
import {Client} from "../../types/client.ts";
import {jobsApi} from "../../api/jobs";
import {useAuth} from "../../hooks/use-auth.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {SelectDateAndDuration} from "../../sections/jobs/create/select-date-and-duration";
import {schedulerApi} from "../../api/scheduler";
import {TimePicker} from "@mui/x-date-pickers";
import {Timeline} from "@mui/lab";
import {Clock} from "@untitled-ui/icons-react";
import {InvoiceItem, InvoiceStatus} from "../../types/invoice.ts";
import {NonInvoicedClientJob, SelectNonInvoicedJobs} from "../../components/select-non-invoiced-jobs";
import {addDays, endOfMonth, format} from "date-fns";
import {CreateInvoiceRequest, invoicesApi} from "../../api/invoices";
import {paths} from "../../paths.ts";

const steps = ["Client", "Jobs"];

export interface CreateInvoiceFormValues {
    organization_id: string;
    franchise_id: string;
    client: {
        id: string;
        name: string;
    }
    due_on: string;
    selected_jobs: NonInvoicedClientJob[];
    total: number;
    submit: null;
}

const useInitialValues = (
    organization_id?: string,
): CreateInvoiceFormValues => {
    return useMemo(
        (): CreateInvoiceFormValues => {
            return {
                organization_id: organization_id,
                franchise_id: null,
                client: null,
                due_on: null,
                selected_jobs: [],
                total: null,
                submit: null,
            };
        },
        []
    );
};

// const validationSchema = object({
//     summary: string().max(5000).required("Summary is required"),
// });

export const CreateInvoicePage = () => {
    const [conflict, setConflict] = useState(null);
    const navigate = useNavigate();
    const auth = useAuth();
    const initialValues = useInitialValues(auth.user.organization.id);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        // validationSchema,
        onSubmit: async (values, helpers): Promise<void> => {
            console.log(formik.values)

            try {
                toast.loading("Creating invoice...");

                const items: InvoiceItem[] = [];

                for (const job of formik.values.selected_jobs) {
                    // const [month, job_id] = row_identifier.split("->");
                    // const job = clientServicesStore.jobs[row_identifier];
                    if (job.charge_unit === ChargeUnit.MONTH) {
                        items.push({
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
                            items.push({
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

                const id = uuid();

                const data = {
                    id,
                    organization_id: auth.user.organization.id,
                    franchise_id: auth.user.franchise.id,
                    client_id: formik.values.client.id,
                    due_on: formik.values.due_on ?? addDays(new Date(), 30),
                    items: items,
                    status: InvoiceStatus.DRAFT,
                    total: items.reduce((a, b) => a + b.total, 0),
                } as CreateInvoiceRequest;

                const response = await invoicesApi.createInvoice(data);

                toast.dismiss();
                toast.success("Invoice created!");

                navigate(paths.invoices.details(id));

            } catch (err) {
                toast.dismiss();
                console.error(err);
                toast.error("Something went wrong!");
                helpers.setStatus({success: false});
                // @ts-ignore
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });

    const [activeStep, setActiveStep] = useState(0);

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            await formik.handleSubmit();
            console.log("submit");
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };


    const handleClientChange = (client: Client) => {
        formik.setFieldValue("client", client);
    }

    const handleJobSelectionChange = (jobs: NonInvoicedClientJob[]) => {
        formik.setFieldValue("selected_jobs", jobs);
    }

    useEffect(() => {
        window.onbeforeunload = () => {
            return "Are you sure you want to leave the page?";
        };

        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    useEffect(() => {
        console.log(formik.values);
    }, [formik.values]);

    useEffect(() => {
        console.log(conflict);
    }, [conflict]);

    return (
        <>
            <Seo title="Create Invoice"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Typography variant="h4">
                            Create Invoice
                        </Typography>
                        <Card>
                            <CardContent>
                                <Stepper activeStep={activeStep}>
                                    {steps.map((label, index) => {
                                        const stepProps: { completed?: boolean } = {};
                                        const labelProps: {
                                            optional?: React.ReactNode;
                                        } = {};
                                        return (
                                            <Step key={label} {...stepProps}>
                                                <StepLabel {...labelProps}>{label}</StepLabel>
                                            </Step>
                                        );
                                    })}
                                </Stepper>
                                {activeStep === steps.length && (
                                    <>
                                        <Typography sx={{mt: 2, mb: 1}}>
                                            All steps completed - you&apos;re finished
                                        </Typography>
                                        <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
                                            <Box sx={{flex: "1 1 auto"}}/>
                                            <Button onClick={handleReset}>Reset</Button>
                                        </Box>
                                    </>
                                )}
                                <Divider sx={{my: 3.5}}/>
                                {conflict && activeStep === 5 && (
                                    <Stack>
                                        <Card variant={"outlined"} sx={{mb: 3, pt: 0}}>
                                            <CardContent sx={{m: 0, pt: 2.5, pb: 1}}>
                                                <Stack>
                                                    <Typography variant={"h6"}>
                                                        Scheduling conflict!
                                                    </Typography>
                                                    <Typography
                                                        sx={{mt: 1}}
                                                        variant={"body2"}
                                                    >
                                                        Please select a different date/time or let the system find the
                                                        soonest time that works.
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{mt: 0, pt: 0, mb: 0.5}}>
                                                <Button
                                                    onClick={() => {
                                                        formik.setFieldValue("timestamp", null);
                                                        formik.setFieldValue('start_time_window', null);
                                                        formik.setFieldValue('end_time_window', null);
                                                        formik.handleSubmit();
                                                    }}
                                                >
                                                    <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                                        <AutoAwesome fontSize={"small"}/>
                                                        <Typography variant={"inherit"}>
                                                            Schedule as soon as possible
                                                        </Typography>
                                                    </Stack>
                                                </Button>
                                            </CardActions>
                                        </Card>
                                        <Divider sx={{mb: 3}}/>
                                    </Stack>
                                )}
                                {activeStep === 0 && (
                                    <SelectClient handleClientChange={handleClientChange} />
                                )}
                                {activeStep === 1 && (
                                    <Stack>
                                        <Typography variant={"h6"} sx={{mb: 2}}>
                                            Select jobs to invoice
                                        </Typography>
                                        <Card variant={'outlined'} sx={{borderRadius: '12px'}}>
                                            <SelectNonInvoicedJobs
                                                client_id={formik.values.client.id}
                                                existing_service_ids={[]}
                                                handleJobSelectionChange={handleJobSelectionChange}
                                            />
                                        </Card>
                                    </Stack>
                                )}
                                {activeStep === 2 && (
                                    <div>Step 3</div>
                                )}
                                {activeStep === 3 && (
                                    <div>Step 4</div>
                                )}
                                <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
                                    <Button
                                        color="inherit"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        sx={{mr: 1}}
                                        variant={"outlined"}
                                    >
                                        Back
                                    </Button>
                                    <Box sx={{flex: "1 1 auto"}}/>
                                    <Button
                                        disabled={
                                            (activeStep === 0 && !formik.values.client)
                                            || (activeStep === 1 && formik.values.selected_jobs.length === 0)
                                        }
                                        endIcon={(
                                            <SvgIcon>
                                                {activeStep === steps.length - 1 ? <Check/> : <ArrowForward/>}
                                            </SvgIcon>
                                        )}
                                        onClick={handleNext}
                                        variant="contained"
                                    >
                                        {activeStep === steps.length - 1 ? "Create Invoice" : "Continue"}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};
