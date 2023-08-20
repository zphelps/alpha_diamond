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
import {SelectClient} from "../../components/select-client";
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
import {schedulerApi} from "../../api/scheduler";
import {TimePicker} from "@mui/x-date-pickers";
import {Timeline} from "@mui/lab";
import {Clock} from "@untitled-ui/icons-react";
import {SelectClientNameAndType} from "../../sections/clients/create/select-name-and-type";
import {_clientTypes} from "./list.tsx";
import {SelectClientLocations} from "../../sections/clients/create/select-locations";
import {SelectPricing} from "../../sections/clients/create/select-pricing";
import {SelectClientContacts} from "../../sections/clients/create/select-contacts";
import {clientUsersApi} from "../../api/client-users";
import {clientLocationsApi} from "../../api/client-locations";
import {clientsApi} from "../../api/clients";

const steps = ["Name", "Locations", "Pricing", "Contacts"];

export interface CreateClientFormValues {
    organization_id: string;
    franchise_id: string;
    service_location: {
        id: string;
        name: string;
        formatted_address: string;
        place_id: string;
        lat: number;
        lng: number;
    }
    billing_location: {
        id: string;
        name: string;
        formatted_address: string;
        place_id: string;
        lat: number;
        lng: number;
    }
    service_contact: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    }
    billing_contact: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    }
    id: string;
    name: string;
    type: string;
    default_monthly_charge: number;
    default_on_demand_charge: number;
    default_hourly_charge: number;
    submit: null;
}

const useInitialValues = (
    organization_id?: string,
    franchise_id?: string
): CreateClientFormValues => {
    return useMemo(
        (): CreateClientFormValues => {
            return {
                organization_id: organization_id,
                franchise_id: franchise_id,
                service_location: null,
                billing_location: null,
                service_contact: {
                    id: uuid(),
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                },
                billing_contact: {
                    id: uuid(),
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                },
                id: uuid(),
                type: null,
                name: null,
                default_monthly_charge: null,
                default_on_demand_charge: null,
                default_hourly_charge: null,
                submit: null,
            };
        },
        []
    );
};

export const CreateClientPage = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const initialValues = useInitialValues(auth.user.organization.id, auth.user.franchise.id); //useInitialValues(job);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                toast.loading("Adding client...");

                await clientUsersApi.createClientUser({
                    id: values.service_contact.id,
                    // client_id: values.id,
                    first_name: values.service_contact.first_name,
                    last_name: values.service_contact.last_name,
                    email: values.service_contact.email,
                    phone: values.service_contact.phone,
                });

                await clientUsersApi.createClientUser({
                    id: values.billing_contact.id,
                    // client_id: values.id,
                    first_name: values.billing_contact.first_name,
                    last_name: values.billing_contact.last_name,
                    email: values.billing_contact.email,
                    phone: values.billing_contact.phone,
                });

                await clientLocationsApi.createClientLocation({
                    id: values.service_location.id,
                    lat: values.service_location.lat,
                    lng: values.service_location.lng,
                    name: values.service_location.name,
                    formatted_address: values.service_location.formatted_address,
                    place_id: values.service_location.place_id,
                });

                await clientLocationsApi.createClientLocation({
                    id: values.billing_location.id,
                    lat: values.billing_location.lat,
                    lng: values.billing_location.lng,
                    name: values.billing_location.name,
                    formatted_address: values.billing_location.formatted_address,
                    place_id: values.billing_location.place_id,
                });

                await clientsApi.createClient({
                    id: values.id,
                    organization_id: values.organization_id,
                    franchise_id: values.franchise_id,
                    name: values.name,
                    type: values.type,
                    default_monthly_charge: values.default_monthly_charge,
                    default_on_demand_charge: values.default_on_demand_charge,
                    default_hourly_charge: values.default_hourly_charge,
                    service_contact_id: values.service_contact.id,
                    billing_contact_id: values.billing_contact.id,
                    service_location_id: values.service_location.id,
                    billing_location_id: values.billing_location.id,
                    country: "United States",
                    status: "active",
                });

                await clientUsersApi.updateClientUser({
                    id: values.service_contact.id,
                    updated_fields: {
                        client_id: values.id,
                    }
                });

                await clientUsersApi.updateClientUser({
                    id: values.billing_contact.id,
                    updated_fields: {
                        client_id: values.id,
                    }
                });

                await clientLocationsApi.updateClientLocation({
                    id: values.service_location.id,
                    updated_fields: {
                        client_id: values.id,
                    }
                });

                await clientLocationsApi.updateClientLocation({
                    id: values.billing_location.id,
                    updated_fields: {
                        client_id: values.id,
                    }
                });

                toast.dismiss();
                toast.success("Client added!");

                navigate(`/clients/${values.id}`)

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

    const handleClientNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("name", event.target.value);
    };

    const handleClientTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("type", event.target.value);
    };

    const handleServiceLocationChange = (newValue) => {
        if (!newValue) {
            formik.setFieldValue("service_location", null);
        } else {
            formik.setFieldValue("service_location", {
                id: uuid(),
                name: newValue.structured_formatting.main_text,
                formatted_address: newValue.description,
                place_id: newValue.place_id,
                lat: newValue.lat,
                lng: newValue.lng,
            });
        }
    }

    const handleBillingLocationChange = (newValue) => {
        if (!newValue) {
            formik.setFieldValue("billing_location", null);
        } else {
            formik.setFieldValue("billing_location", {
                id: uuid(),
                name: newValue.structured_formatting.main_text,
                formatted_address: newValue.description,
                place_id: newValue.place_id,
                lat: newValue.lat,
                lng: newValue.lng,
            });
        }
    }

    const handleChangeMonthlyCharge = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("default_monthly_charge", Number(event.target.value));
    }

    const handleChangeOnDemandCharge = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("default_on_demand_charge", Number(event.target.value));
    }

    const handleChangeHourlyCharge = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("default_hourly_charge", Number(event.target.value));
    }

    const handleServiceContactFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("service_contact.first_name", event.target.value);
    }

    const handleServiceContactLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("service_contact.last_name", event.target.value);
    }

    const handleServiceContactEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("service_contact.email", event.target.value);
    }

    const handleServiceContactPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("service_contact.phone", event.target.value);
    }

    const handleBillingContactFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("billing_contact.first_name", event.target.value);
    }

    const handleBillingContactLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("billing_contact.last_name", event.target.value);
    }

    const handleBillingContactEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("billing_contact.email", event.target.value);
    }

    const handleBillingContactPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("billing_contact.phone", event.target.value);
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

    return (
        <>
            <Seo title="Add Client"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={4}>
                        <Typography variant="h4">
                            New Client
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
                                {activeStep === 0 && (
                                    <SelectClientNameAndType
                                        handleClientNameChange={handleClientNameChange}
                                        handleClientTypeChange={handleClientTypeChange}
                                    />
                                )}
                                {activeStep === 1 && (
                                    <SelectClientLocations
                                        handleServiceLocationChange={handleServiceLocationChange}
                                        handleBillingLocationChange={handleBillingLocationChange}
                                    />
                                )}
                                {activeStep === 2 && (
                                    <SelectPricing
                                        handleMonthlyChargeChange={handleChangeMonthlyCharge}
                                        handleHourlyChargeChange={handleChangeHourlyCharge}
                                        handleOnDemandChargeChange={handleChangeOnDemandCharge}
                                    />
                                )}
                                {activeStep === 3 && (
                                    <SelectClientContacts
                                        handleServiceContactFirstNameChange={handleServiceContactFirstNameChange}
                                        handleServiceContactLastNameChange={handleServiceContactLastNameChange}
                                        handleServiceContactEmailChange={handleServiceContactEmailChange}
                                        handleServiceContactPhoneChange={handleServiceContactPhoneChange}
                                        handleBillingContactFirstNameChange={handleBillingContactFirstNameChange}
                                        handleBillingContactLastNameChange={handleBillingContactLastNameChange}
                                        handleBillingContactEmailChange={handleBillingContactEmailChange}
                                        handleBillingContactPhoneChange={handleBillingContactPhoneChange}
                                    />
                                )}
                                {/*{activeStep === 2 && (*/}
                                {/*    <Stack>*/}
                                {/*        <SelectClientLocation client_id={formik.values.client_id}*/}
                                {/*                              setFieldValue={formik.setFieldValue}/>*/}
                                {/*        <Divider sx={{mt: 2, mb: 3.5}}/>*/}
                                {/*        <SelectContact client_id={formik.values.client_id}*/}
                                {/*                       setFieldValue={formik.setFieldValue}/>*/}
                                {/*        <Divider sx={{my: 2}}/>*/}
                                {/*    </Stack>*/}
                                {/*)}*/}
                                {/*{activeStep === 3 && (*/}
                                {/*    <JobDetails*/}
                                {/*        charge_unit={formik.values.charge_unit}*/}
                                {/*        charge_per_unit={formik.values.charge_per_unit}*/}
                                {/*        service_type={formik.values.service_type}*/}
                                {/*        client_default_monthly_charge={formik.values.client_default_monthly_charge}*/}
                                {/*        client_default_on_demand_charge={formik.values.client_default_on_demand_charge}*/}
                                {/*        default_hourly_charge={formik.values.default_hourly_charge}*/}
                                {/*        setFieldValue={formik.setFieldValue}*/}
                                {/*        handleSummaryChange={handleSummaryChange}*/}
                                {/*        handleDriverNotesChange={handleDriverNotesChange}*/}
                                {/*    />*/}
                                {/*)}*/}
                                {/*{activeStep === 4 && formik.values.service_type === "Recurring" && (*/}
                                {/*    <Stack>*/}
                                {/*        <SelectDuration duration={formik.values.duration}*/}
                                {/*                        setFieldValue={formik.setFieldValue}/>*/}
                                {/*        <Divider sx={{mt: 2, mb: 3.5}}/>*/}
                                {/*        <SelectRecurrence*/}
                                {/*            services_per_week={formik.values.services_per_week}*/}
                                {/*            days_of_week={formik.values.days_of_week}*/}
                                {/*            setFieldValue={formik.setFieldValue}*/}
                                {/*        />*/}
                                {/*        <Divider sx={{mt: 2, mb: 3.5}}/>*/}
                                {/*        <SelectTimeWindow*/}
                                {/*            start_time_window={formik.values.start_time_window}*/}
                                {/*            end_time_window={formik.values.end_time_window}*/}
                                {/*            any_time={formik.values.any_time_window}*/}
                                {/*            duration={formik.values.duration}*/}
                                {/*            setFieldValue={formik.setFieldValue}*/}
                                {/*        />*/}
                                {/*        <Divider sx={{mt: 2, mb: 1.5}}/>*/}
                                {/*    </Stack>*/}
                                {/*)}*/}
                                {/*{activeStep === 4 && formik.values.service_type !== "Recurring" && (*/}
                                {/*    <Stack>*/}
                                {/*        <SelectDateAndDuration duration={formik.values.duration}*/}
                                {/*                               timestamp={formik.values.timestamp}*/}
                                {/*                               setFieldValue={formik.setFieldValue}/>*/}
                                {/*        <Divider sx={{mt: 2.5, mb: 1}}/>*/}
                                {/*    </Stack>*/}
                                {/*)}*/}
                                {/*{activeStep === 5 && (*/}
                                {/*    <Review formValues={formik.values}/>*/}
                                {/*)}*/}
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
                                            (activeStep === 0 && (!formik.values.name || !formik.values.type))
                                            || (activeStep === 1 && (!formik.values.service_location || !formik.values.billing_location))
                                            || (activeStep === 2 && (!formik.values.default_monthly_charge || !formik.values.default_on_demand_charge || !formik.values.default_hourly_charge))
                                            || (activeStep === 3 && (formik.values.service_contact.first_name.length < 1
                                                || formik.values.service_contact.last_name.length < 1
                                                || formik.values.service_contact.email.length < 1
                                                || formik.values.service_contact.phone.length < 1
                                                || formik.values.billing_contact.first_name.length < 1
                                                || formik.values.billing_contact.last_name.length < 1
                                                || formik.values.billing_contact.email.length < 1
                                                || formik.values.billing_contact.phone.length < 1))
                                           }
                                        endIcon={(
                                            <SvgIcon>
                                                {activeStep === steps.length - 1 ? <Check/> : <ArrowForward/>}
                                            </SvgIcon>
                                        )}
                                        onClick={handleNext}
                                        variant="contained"
                                    >
                                        {activeStep === steps.length - 1 ? "Add Client" : "Continue"}
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
