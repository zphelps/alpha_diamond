import React, {FC, useEffect, useMemo, useState} from "react";
import {useAuth} from "../../hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {Box, Button, Dialog, Divider, Stack, SvgIcon, TextField, Typography} from "@mui/material";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {ClientLocation} from "../../types/client-location.ts";
import {useFormik} from "formik";
import * as Yup from 'yup';
import GooglePlacesAutocomplete from "../../components/google-places-autocomplete.tsx";
import {ArrowForward, Check} from "@mui/icons-material";

export interface AddTruckFormValues {
    id: string;
    organization_id: string;
    franchise_id: string;
    name: string;
    depot: ClientLocation;
    submit: null;
}

const useInitialValues = (
    organization_id?: string,
    franchise_id?: string
): AddTruckFormValues => {
    return useMemo(
        (): AddTruckFormValues => {
            return {
                id: uuid(),
                organization_id: organization_id,
                franchise_id: franchise_id,
                name: null,
                depot: null,
                submit: null,
            };
        },
        []
    );
};

interface AddTruckDialogProps {
    onClose?: () => void;
    open?: boolean;
}

export const AddTruckDialog: FC<AddTruckDialogProps> = (props) => {
    const {
        onClose,
        open = false,
    } = props;

    const navigate = useNavigate();
    const auth = useAuth();
    const initialValues = useInitialValues(auth.user.organization.id, auth.user.franchise.id); //useInitialValues(job);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object({
            name: Yup
                .string()
                .max(255)
                .required('Truck name is required'),
            depot: Yup
                .object({
                    id: Yup.string().required(),
                    name: Yup.string().required(),
                    formatted_address: Yup.string().required(),
                    place_id: Yup.string().required(),
                    lat: Yup.number().required(),
                    lng: Yup.number().required(),
                })
                .required('Depot is required'),
        }),
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                toast.loading("Adding truck...");

                toast.dismiss();
                toast.success("Truck added!");

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

    useEffect(() => {
        formik.validateForm();
    }, [formik.values]);

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
                        Add Truck
                    </Typography>

                    <Divider sx={{my: 2}}/>

                    <Typography
                        variant={'subtitle1'}
                    >
                        Truck Name
                    </Typography>

                    <Typography
                        variant={'body2'}
                        color={'text.secondary'}
                        sx={{mb: 1}}
                    >
                        What is the name of this truck?
                    </Typography>

                    <TextField
                        error={!!(formik.touched.name && formik.errors.name)}
                        fullWidth
                        helperText={formik.touched.name && formik.errors.name}
                        label="Name"
                        name="name"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        required
                        value={formik.values.name ?? ''}
                    />

                    <Divider sx={{my: 2}}/>

                    <Typography
                        variant={'subtitle1'}
                    >
                        Depot
                    </Typography>

                    <Typography
                        variant={'body2'}
                        color={'text.secondary'}
                        sx={{mb: 1}}
                    >
                        Where does this truck start and end its day?
                    </Typography>

                    <GooglePlacesAutocomplete handleAddressChange={(e) => {
                        if (!e) {
                            formik.setFieldValue("depot", null);
                        } else {

                            new Date().toISOString()
                            formik.setFieldValue("depot", {
                                id: uuid(),
                                name: e.structured_formatting.main_text,
                                formatted_address: e.description,
                                place_id: e.place_id,
                                lat: e.lat,
                                lng: e.lng,
                            });
                        }
                    }} />

                    <Divider sx={{mt: 2, mb: 2.5}}/>

                    <Stack direction={'row'} justifyContent={'end'} spacing={1}>
                        <Button
                            onClick={() => {
                                formik.resetForm();
                                onClose?.();
                            }}
                            variant={'outlined'}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={formik.isSubmitting || !formik.isValid}
                            onClick={() => formik.handleSubmit()}
                            variant={'contained'}
                            startIcon={(
                                <SvgIcon>
                                    {<Check/>}
                                </SvgIcon>
                            )}
                        >
                            Add
                        </Button>
                    </Stack>
                </Box>
                <Divider/>
            </Dialog>
        </>
    );
};
