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
import {ArrowForward, AutoAwesome, Check, EventBusy, EventBusyOutlined, Update} from "@mui/icons-material";
import {useBeforeUnload, useLocation, useNavigate} from "react-router-dom";
import {SelectServiceType} from "../../sections/jobs/create/select-service-type";
import {Service, ServiceType} from "../../types/service.ts";
import {supabase} from "../../config.ts";
import {useFormik} from "formik";
import toast from "react-hot-toast";
import {object, string, number, date, InferType, bool} from "yup";
import {SelectClient} from "../../components/select-client";
import {SelectClientLocation} from "../../sections/jobs/create/select-client-location";
import {SelectContact} from "../../sections/jobs/create/select-contact";
import {JobDetails} from "../../sections/jobs/create/job-details";
import {Job} from "../../types/job.ts";
import {SelectDuration} from "../../sections/jobs/create/select-duration";
import {SelectRecurrence} from "../../sections/jobs/create/select-recurrence";
import {SelectTimeWindow} from "../../sections/jobs/create/select-time-window";
import {Review} from "../../sections/jobs/create/review";
import {Client} from "../../types/client.ts";
import {jobsApi} from "../../api/jobs";
import {useAuth} from "../../hooks/use-auth.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {SelectDateAndDuration} from "../../sections/jobs/create/select-date-and-duration";
import {schedulerApi, SchedulerResponse} from "../../api/scheduler";
import {TimePicker} from "@mui/x-date-pickers";
import {Timeline} from "@mui/lab";
import {Clock} from "@untitled-ui/icons-react";
import {addMinutes, format} from "date-fns";

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
    client_default_monthly_charge: number;
    client_default_on_demand_charge: number;
    default_hourly_charge: number;
    driver_notes: string;
    charge_unit: string;
    charge_per_unit: number;
    submit: null;
}

const useInitialValues = (
    job?: Job,
    organization_id?: string,
    franchise_id?: string
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
                    client_default_monthly_charge: job.client.recurring_charge,
                    client_default_on_demand_charge: job.client.on_demand_charge,
                    default_hourly_charge: 450,
                    driver_notes: job.driver_notes,
                    days_of_week: job.days_of_week,
                    services_per_week: job.services_per_week,
                    charge_unit: job.charge_unit,
                    charge_per_unit: job.charge_per_unit,
                    submit: null
                };
            }

            return {
                organization_id: organization_id,
                franchise_id: franchise_id,
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
                client_default_monthly_charge: null,
                client_default_on_demand_charge: null,
                default_hourly_charge: 450,
                any_time_window: false,
                on_site_contact_id: null,
                on_site_contact: null,
                driver_notes: null,
                status: "open",
                days_of_week: [1],
                services_per_week: 1,
                charge_unit: null,
                charge_per_unit: null,
                submit: null,
            };
        },
        [job]
    );
};

const validationSchema = object({
    summary: string().max(5000).required("Summary is required"),
});

export const CreateJobPage = () => {
    const [dayConflict, setDayConflict] = useState(null);
    const [recurringConflict, setRecurringConflict] = useState(null);
    const [alternativeTimes, setAlternativeTimes] = useState(null);

    const navigate = useNavigate();
    const auth = useAuth();
    const initialValues = useInitialValues(null, auth.user.organization.id, auth.user.franchise.id); //useInitialValues(job);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                toast.loading("Creating job...");

                // Insert New On-Demand Job
                if (values.service_type === ServiceType.ON_DEMAND) {
                    const onDemandRes = await schedulerApi.insertOnDemandJob({
                        // @ts-ignore
                        job: formik.values as Job,
                        operating_hours: auth.user.franchise.operating_hours,
                        operating_days: auth.user.franchise.operating_days,
                    });

                    if (onDemandRes.response === SchedulerResponse.SUCCESS) {
                        toast.dismiss();
                        navigate(`/jobs/${formik.values.id}`);
                        toast.success("Job created");
                    } else if (onDemandRes.response === SchedulerResponse.ERR_UNABLE_TO_SQUEEZE_AT_TIME) {
                        toast.dismiss();
                        toast.error("Unable to schedule at selected time.");
                        toast.loading("Finding closest available timeslots...");
                        const res = await schedulerApi.findClosestAvailableTimeslots({
                            // @ts-ignore
                            job: formik.values as Job,
                            operating_hours: auth.user.franchise.operating_hours,
                        });

                        console.log(res.timestamps.map((t) => format(new Date(t), 'MM/dd/yyyy HH:mm a')));

                        setAlternativeTimes(res.timestamps.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));

                        toast.dismiss();
                    } else if (onDemandRes.response === SchedulerResponse.ERR_UNABLE_TO_SQUEEZE_ON_DAY) {
                        toast.dismiss();
                        setDayConflict(true);
                    }
                } else {
                    // @ts-ignore
                    const res = await schedulerApi.insertRecurringJob({
                        // @ts-ignore
                        job: formik.values as Job,
                        operating_hours: auth.user.franchise.operating_hours,
                        operating_days: auth.user.franchise.operating_days,
                        organization_id: auth.user.organization.id,
                        franchise_id: auth.user.franchise.id,
                    });

                    console.log(res);
                    toast.dismiss();

                    if (res.success) {
                        navigate(`/jobs/${formik.values.id}`);
                        toast.success("Job created");
                    } else {
                        setRecurringConflict(true);
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

    const handleClientChange = (client: Client) => {
        if (client) {
            formik.setFieldValue('client_id', client.id);
            formik.setFieldValue('client', client);
            formik.setFieldValue('client_default_monthly_charge', client.default_monthly_charge);
            formik.setFieldValue('client_default_on_demand_charge', client.default_on_demand_charge);
        } else {
            formik.setFieldValue('client_id', null);
            formik.setFieldValue('client', null);
            formik.setFieldValue('client_default_monthly_charge', null);
            formik.setFieldValue('client_default_on_demand_charge', null);
        }
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
        console.log(dayConflict);
    }, [dayConflict]);

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
                                {alternativeTimes && activeStep === 5 && (
                                    <Stack>
                                        <Card variant={"outlined"} sx={{mb: 3, pt: 0}}>
                                            <CardContent sx={{m: 0, pt: 2.5, pb: 1}}>
                                                <Stack>
                                                    <Stack direction={'row'} alignItems={'center'} spacing={2.5}>
                                                        <EventBusyOutlined fontSize={"large"}/>
                                                        <Stack>
                                                            <Typography variant={"h6"}>
                                                                Could not schedule at selected time
                                                            </Typography>
                                                            <Typography
                                                                sx={{mt: 0.75}}
                                                                variant={"body1"}
                                                            >
                                                                Please select on of the following timeslots or select a different day.
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Divider sx={{my: 2}}/>
                                                    <Typography
                                                        fontSize={'1.05rem'}
                                                        fontWeight={600}
                                                    >
                                                        {format(new Date(formik.values.timestamp), 'EEEE, MMMM dd, yyyy')}
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{mt: 0.5, pt: 0, mb: 2, mx: 2}}>
                                                {alternativeTimes.map((t) => (
                                                    <Button
                                                        key={t}
                                                        onClick={() => {
                                                            setAlternativeTimes(null);
                                                            setDayConflict(false);
                                                            formik.setFieldValue('start_time_window', format(new Date(t), 'HH:mm'));
                                                            formik.setFieldValue('end_time_window', format(addMinutes(new Date(t), formik.values.duration), 'HH:mm'));
                                                            formik.handleSubmit();
                                                        }}
                                                        variant={"outlined"}
                                                    >
                                                        <Typography variant={"inherit"}>
                                                            {format(new Date(t), 'h:mm a')}
                                                        </Typography>
                                                    </Button>
                                                ))}
                                            </CardActions>
                                        </Card>
                                        <Divider sx={{mb: 3}}/>
                                    </Stack>
                                )}
                                {dayConflict && activeStep === 5 && (
                                    <Stack>
                                        <Card variant={"outlined"} sx={{mb: 3, pt: 0}}>
                                            <CardContent sx={{m: 0, pt: 2.5, pb: 1}}>
                                                <Stack direction={'row'} alignItems={'center'} spacing={2.5}>
                                                    <EventBusyOutlined fontSize={"large"}/>
                                                    <Stack>
                                                        <Typography variant={"h6"}>
                                                            Could not schedule on selected day
                                                        </Typography>
                                                        <Typography
                                                            sx={{mt: 0.75}}
                                                            variant={"body1"}
                                                        >
                                                            Please select a new date or let the system schedule the job as soon as possible.
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{mt: 0.5, pt: 0, mb: 2, mx: 2}}>
                                                <Button
                                                    onClick={() => {
                                                        setAlternativeTimes(null);
                                                        setDayConflict(false);
                                                        formik.setFieldValue('timestamp', null);
                                                        formik.setFieldValue('start_time_window',null);
                                                        formik.setFieldValue('end_time_window', null);
                                                        formik.handleSubmit();
                                                    }}
                                                    variant={"outlined"}
                                                >
                                                    <Typography variant={"inherit"}>
                                                        Schedule as soon as possible
                                                    </Typography>
                                                </Button>
                                            </CardActions>
                                        </Card>
                                        <Divider sx={{mb: 3}}/>
                                    </Stack>
                                )}
                                {recurringConflict && activeStep === 5 && (
                                    <Stack>
                                        <Card variant={"outlined"} sx={{mb: 3, pt: 0}}>
                                            <CardContent sx={{m: 0, pt: 2.5, pb: 1}}>
                                                <Stack direction={'row'} alignItems={'center'} spacing={2.5}>
                                                    <EventBusyOutlined fontSize={"large"}/>
                                                    <Stack>
                                                        <Typography variant={"h6"}>
                                                            Job could not be scheduled
                                                        </Typography>
                                                        <Typography
                                                            sx={{mt: 0.75}}
                                                            variant={"body1"}
                                                        >
                                                            Unfortunately, this job conflicts with existing jobs. Consider reducing the number of service restraints.
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                        <Divider sx={{mb: 3}}/>
                                    </Stack>
                                )}

                                {activeStep === 0 && (
                                    <SelectServiceType serviceType={formik.values.service_type}
                                                       setFieldValue={formik.setFieldValue}/>
                                )}
                                {activeStep === 1 && (
                                    <SelectClient handleClientChange={handleClientChange}/>
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
                                        charge_unit={formik.values.charge_unit}
                                        charge_per_unit={formik.values.charge_per_unit}
                                        service_type={formik.values.service_type}
                                        client_default_monthly_charge={formik.values.client_default_monthly_charge}
                                        client_default_on_demand_charge={formik.values.client_default_on_demand_charge}
                                        default_hourly_charge={formik.values.default_hourly_charge}
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
                                            (formik.isSubmitting) ||
                                            (activeStep === 1 && !formik.values.client_id)
                                            || (activeStep === 2 && (!formik.values.on_site_contact_id || !formik.values.location_id))
                                            || (activeStep === 3 && ((formik.values.service_type === "Recurring" && !formik.values.client_default_monthly_charge)
                                                || (formik.values.service_type === "On-Demand" && !formik.values.client_default_on_demand_charge)
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
