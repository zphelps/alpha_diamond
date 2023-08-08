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
import {FC, useEffect, useMemo, useState} from "react";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {ArrowForward, AutoAwesome, Check, Update} from "@mui/icons-material";
import {useBeforeUnload, useLocation, useNavigate} from "react-router-dom";
import {SelectServiceType} from "../../sections/jobs/create/select-service-type";
import {Service} from "../../types/service.ts";
import {supabase} from "../../config.ts";
import {useFormik} from "formik";
import toast from "react-hot-toast";
import {object, string, number, date, InferType, bool} from "yup";
import {SelectClient} from "../../sections/jobs/create/select-client";
import {SelectClientLocation} from "../../sections/jobs/create/select-client-location";
import {SelectContact} from "../../sections/jobs/create/select-contact";
import {JobDetails} from "../../sections/jobs/create/job-details";
import {Job, PriceModel} from "../../types/job.ts";
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

const steps = ["Service Type", "Client", "Client Details", "Job Details", "Schedule", "Review"];

export interface CreateJobFormValues {
    organization_id: string;
    franchise_id: string;
    location_id: string;
    location: { id: string };
    client_id: string;
    client: { id: string };
    summary: string;
    id: string;
    start_time_window: string;
    end_time_window: string;
    any_time_window: boolean;
    duration: number;
    service_type: string;
    on_site_contact_id: string;
    on_site_contact: { id: string };
    status: string;
    timestamp: string;
    days_of_week: number[];
    services_per_week: number;
    recurring_charge: number;
    on_demand_charge: number;
    driver_notes: string;
    price?: number;
    price_model: string;
    submit: null;
}

const useInitialValues = (
    job?: Job,
    organization_id?: string,
): CreateJobFormValues => {
    return useMemo(
        (): CreateJobFormValues => {
            if (job) {
                return {
                    organization_id: job.organization_id,
                    franchise_id: job.franchise_id,
                    location_id: job.location.id,
                    location: job.location,
                    client_id: job.client.id,
                    summary: job.summary,
                    id: job.id,
                    client: job.client,
                    start_time_window: job.start_time_window,
                    end_time_window: job.end_time_window,
                    any_time_window: !job.start_time_window && !job.end_time_window,
                    duration: job.duration,
                    timestamp: job.timestamp,
                    service_type: job.service_type,
                    on_site_contact_id: job.on_site_contact.id,
                    on_site_contact: job.on_site_contact,
                    status: job.status,
                    recurring_charge: job.client.recurring_charge,
                    on_demand_charge: job.client.on_demand_charge,
                    driver_notes: job.driver_notes,
                    days_of_week: job.days_of_week,
                    services_per_week: job.services_per_week,
                    price: job.price,
                    price_model: job.price_model,
                    submit: null
                };
            }

            return {
                organization_id: organization_id,
                franchise_id: null,
                location_id: null,
                location: null,
                client_id: null,
                duration: 30,
                summary: null,
                id: uuid(),
                client: null,
                service_type: "Recurring",
                start_time_window: null,
                end_time_window: null,
                timestamp: null,
                recurring_charge: null,
                on_demand_charge: null,
                any_time_window: false,
                on_site_contact_id: null,
                on_site_contact: null,
                driver_notes: null,
                status: "open",
                days_of_week: [1],
                services_per_week: 1,
                price: null,
                price_model: PriceModel.MONTHLY,
                submit: null,
            };
        },
        [job]
    );
};

type Action = "create" | "update"

const validationSchema = object({
    summary: string().max(5000).required("Summary is required"),
});

export const CreateJobPage = () => {
    const [conflict, setConflict] = useState(null);
    const navigate = useNavigate();
    const auth = useAuth();
    const initialValues = useInitialValues(null, auth.user.organizationID); //useInitialValues(job);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                const data = {
                    id: uuid(),
                    organization_id: auth.user.organizationID,
                    // franchise_id: values.franchise_id,
                    timestamp: values.timestamp,
                    location_id: values.location_id,
                    client_id: values.client_id,
                    summary: values.summary,
                    start_time_window: values.start_time_window,
                    end_time_window: values.end_time_window,
                    duration: values.duration,
                    service_type: values.service_type,
                    on_site_contact_id: values.on_site_contact_id,
                    status: values.status,
                    driver_notes: values.driver_notes,
                    days_of_week: values.days_of_week,
                    services_per_week: values.services_per_week,
                };

                toast.loading("Creating job...");

                // Insert New On-Demand Job
                if (values.service_type !== "Recurring") {
                    // @ts-ignore
                    const onDemandRes = await schedulerApi.insertNewOnDemandJob({job: formik.values as Job});

                    if (onDemandRes.success) {
                        toast.dismiss();
                        navigate(`/jobs/${formik.values.id}`);
                        toast.success("Job created");
                    } else {
                        toast.dismiss();
                        setConflict(true);
                    }
                } else {
                    // @ts-ignore
                    const res = await schedulerApi.insertRecurringJob({job: formik.values as Job});

                    console.log(res);
                    toast.dismiss();

                    if (res.success) {
                        navigate(`/jobs/${formik.values.id}`);
                        toast.success("Job created");
                    }
                }
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

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            formik.handleSubmit();
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

    const handleSummaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("summary", event.target.value);
    };

    const handleDriverNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("driver_notes", event.target.value);
    };

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
            <Seo title="Create Job"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Typography variant="h4">
                            Create Job
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
                                    <SelectServiceType serviceType={formik.values.service_type}
                                                       setFieldValue={formik.setFieldValue}/>
                                )}
                                {activeStep === 1 && (
                                    <SelectClient setFieldValue={formik.setFieldValue}/>
                                )}
                                {activeStep === 2 && (
                                    <Stack>
                                        <SelectClientLocation client_id={formik.values.client_id}
                                                              setFieldValue={formik.setFieldValue}/>
                                        <Divider sx={{mt: 2, mb: 3.5}}/>
                                        <SelectContact client_id={formik.values.client_id}
                                                       setFieldValue={formik.setFieldValue}/>
                                        <Divider sx={{my: 2}}/>
                                    </Stack>
                                )}
                                {activeStep === 3 && (
                                    <JobDetails
                                        price={formik.values.price}
                                        recurring_charge={formik.values.recurring_charge}
                                        on_demand_charge={formik.values.on_demand_charge}
                                        price_model={formik.values.price_model}
                                        setFieldValue={formik.setFieldValue}
                                        handleSummaryChange={handleSummaryChange}
                                        handleDriverNotesChange={handleDriverNotesChange}
                                    />
                                )}
                                {activeStep === 4 && formik.values.service_type === "Recurring" && (
                                    <Stack>
                                        <SelectDuration duration={formik.values.duration}
                                                        setFieldValue={formik.setFieldValue}/>
                                        <Divider sx={{mt: 2, mb: 3.5}}/>
                                        <SelectRecurrence
                                            services_per_week={formik.values.services_per_week}
                                            days_of_week={formik.values.days_of_week}
                                            setFieldValue={formik.setFieldValue}
                                        />
                                        <Divider sx={{mt: 2, mb: 3.5}}/>
                                        <SelectTimeWindow
                                            start_time_window={formik.values.start_time_window}
                                            end_time_window={formik.values.end_time_window}
                                            any_time={formik.values.any_time_window}
                                            duration={formik.values.duration}
                                            setFieldValue={formik.setFieldValue}
                                        />
                                        <Divider sx={{mt: 2, mb: 1.5}}/>
                                    </Stack>
                                )}
                                {activeStep === 4 && formik.values.service_type !== "Recurring" && (
                                    <Stack>
                                        <SelectDateAndDuration duration={formik.values.duration}
                                                               timestamp={formik.values.timestamp}
                                                               setFieldValue={formik.setFieldValue}/>
                                        <Divider sx={{mt: 2.5, mb: 1}}/>
                                    </Stack>
                                )}
                                {activeStep === 5 && (
                                    <Review formValues={formik.values}/>
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
                                            (activeStep === 1 && !formik.values.client_id)
                                            || (activeStep === 2 && (!formik.values.on_site_contact_id || !formik.values.location_id))
                                            || (activeStep === 3 && ((formik.values.service_type === "Recurring" && !formik.values.recurring_charge)
                                                || (formik.values.service_type === "On-Demand" && !formik.values.on_demand_charge)
                                                || !formik.values.summary || !formik.values.driver_notes))
                                            || (activeStep === 4 && ((!formik.values.duration) || (formik.values.service_type === "Recurring" && !formik.values.services_per_week)
                                                || (formik.values.service_type === "Recurring" && (!formik.values.start_time_window || !formik.values.end_time_window) && !formik.values.any_time_window)))
                                        }
                                        endIcon={(
                                            <SvgIcon>
                                                {activeStep === steps.length - 1 ? <Check/> : <ArrowForward/>}
                                            </SvgIcon>
                                        )}
                                        onClick={handleNext}
                                        variant="contained"
                                    >
                                        {activeStep === steps.length - 1 ? "Create Job" : "Continue"}
                                    </Button>
                                </Box>
                                {/*: (*/}
                                {/*    <>*/}
                                {/*        <Typography*/}
                                {/*            sx={{ mt: 2, mb: 1 }}*/}
                                {/*            variant="h6"*/}
                                {/*        >*/}
                                {/*            Step {activeStep + 1}*/}
                                {/*        </Typography>*/}
                                {/*        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>*/}
                                {/*            <Button*/}
                                {/*                color="inherit"*/}
                                {/*                disabled={activeStep === 0}*/}
                                {/*                onClick={handleBack}*/}
                                {/*                sx={{ mr: 1 }}*/}
                                {/*                variant={'outlined'}*/}
                                {/*            >*/}
                                {/*                Back*/}
                                {/*            </Button>*/}
                                {/*            <Box sx={{ flex: '1 1 auto' }} />*/}
                                {/*            <Button*/}
                                {/*                endIcon={(*/}
                                {/*                    <SvgIcon>*/}
                                {/*                        {activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}*/}
                                {/*                    </SvgIcon>*/}
                                {/*                )}*/}
                                {/*                onClick={handleNext}*/}
                                {/*                variant="contained"*/}
                                {/*            >*/}
                                {/*                {activeStep === steps.length - 1 ? 'Create Job' : 'Continue'}*/}
                                {/*            </Button>*/}
                                {/*        </Box>*/}
                                {/*    </>*/}
                                {/*)}*/}
                            </CardContent>
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};
