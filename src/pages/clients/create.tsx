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
import {SelectAccountContact} from "../../sections/clients/create/select-contacts";
import {clientContactsApi} from "../../api/client-contacts";
import {clientLocationsApi} from "../../api/client-locations";
import {clientsApi} from "../../api/clients";
import {ClientContact} from "../../types/client-contact.ts";
import {BinType} from "../../types/bin-type.ts";
import {ClientLocation} from "../../types/client-location.ts";
import {binTypesApi} from "../../api/bin-types";
import {haulersApi} from "../../api/haulers";

const steps = ["General", "Account Contact", "Location(s)", "Pricing"];

export interface CreateClientFormValues {
    organization_id: string;
    franchise_id: string;
    account_contact: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: number;
    }
    locations: ClientLocation[];
    id: string;
    name: string;
    type: string;
    default_monthly_charge: number;
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
                account_contact: {
                    id: uuid(),
                    first_name: null,
                    last_name: null,
                    email: null,
                    phone: null,
                },
                locations: [],
                id: uuid(),
                type: null,
                name: null,
                default_monthly_charge: null,
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

                await clientContactsApi.create({
                    id: values.account_contact.id,
                    first_name: values.account_contact.first_name,
                    last_name: values.account_contact.last_name,
                    email: values.account_contact.email,
                    phone: values.account_contact.phone,
                });

                for (const location of values.locations) {
                    await clientContactsApi.create({
                        id: location.on_site_contact.id,
                        first_name: location.on_site_contact.first_name,
                        last_name: location.on_site_contact.last_name,
                        email: location.on_site_contact.email,
                        phone: location.on_site_contact.phone,
                    });

                    await clientLocationsApi.create({
                        id: location.id,
                        name: location.name,
                        service_address: location.service_address,
                        billing_address: location.billing_address,
                        on_site_contact_id: location.on_site_contact.id,
                        billing_name: location.billing_name,
                        billing_email: location.billing_email,
                        billing_phone: location.billing_phone,
                        service_location_latitude: location.service_location_latitude,
                        service_location_longitude: location.service_location_longitude,
                    });
                    for (const bin_type of location.bin_types) {
                        await haulersApi.create({
                            id: bin_type.hauler.id,
                            name: bin_type.hauler.name,
                            email: bin_type.hauler.email,
                            phone: bin_type.hauler.phone,
                            rate: bin_type.hauler.rate,
                        })
                        await binTypesApi.create({
                            id: bin_type.id,
                            name: bin_type.name,
                            size: bin_type.size,
                            hauler_id: bin_type.hauler.id,
                            on_demand_charge: bin_type.on_demand_charge,
                            description: bin_type.description,
                            client_location_id: location.id,
                        });
                    }
                }

                await clientsApi.create({
                    id: values.id,
                    organization_id: values.organization_id,
                    franchise_id: values.franchise_id,
                    name: values.name,
                    type: values.type,
                    default_monthly_charge: values.default_monthly_charge,
                    default_hourly_charge: values.default_hourly_charge,
                    account_contact_id: values.account_contact.id,
                    status: "active",
                });

                await clientContactsApi.update({
                    id: values.account_contact.id,
                    updated_fields: {
                        client_id: values.id,
                    }
                });

                for (const location of values.locations) {
                    await clientLocationsApi.update({
                        id: location.id,
                        updated_fields: {
                            client_id: values.id,
                        }
                    });

                    await clientContactsApi.update({
                        id: location.on_site_contact.id,
                        updated_fields: {
                            client_id: values.id,
                        }
                    });

                    for (const bin_type of location.bin_types) {
                        await haulersApi.update({
                            id: bin_type.hauler.id,
                            updated_fields: {
                                client_id: values.id,
                            }
                        })
                    }
                }

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
                                        values={formik.values}
                                        setFieldValue={formik.setFieldValue}
                                    />
                                )}
                                {activeStep === 1 && (
                                    <SelectAccountContact values={formik.values} setFieldValue={formik.setFieldValue} />
                                )}
                                {activeStep === 2 && (
                                    <SelectClientLocations values={formik.values} setFieldValue={formik.setFieldValue} />
                                )}
                                {activeStep === 3 && (
                                    <SelectPricing values={formik.values} setFieldValue={formik.setFieldValue} />
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
                                            (activeStep === 0 && (!formik.values.name || !formik.values.type))
                                            || (activeStep === 1 && (!formik.values.account_contact.first_name
                                                || !formik.values.account_contact.last_name
                                                || !formik.values.account_contact.email
                                                || !formik.values.account_contact.phone))
                                            || (activeStep === 2 && formik.values.locations.length < 1)
                                            || (activeStep === 3 && (!formik.values.default_monthly_charge
                                                || !formik.values.default_hourly_charge))
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
