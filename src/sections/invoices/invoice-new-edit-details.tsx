import sum from "lodash/sum";
import {useCallback, useEffect} from "react";
import {useFormContext, useFieldArray, FieldArrayMethodProps} from "react-hook-form";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {inputBaseClasses} from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import RHFTextField from "../../components/rhf-text-field.tsx";
import {RHFSelect} from "../../components/rhf-select.tsx";
import {InvoiceItem} from "../../types/invoice.ts";
import {Trash01} from "@untitled-ui/icons-react";
import {Add} from "@mui/icons-material";
import {TextField} from "@mui/material";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {InvoiceAddServiceDialog} from "./invoice-add-service-dialog.tsx";
import {ChargeUnit} from "../../types/job.ts";
import {format} from "date-fns";
// utils
// _mock
// types
// components

// ----------------------------------------------------------------------

interface AddServiceDialogData {
    current_invoice_id?: string;
    client_id?: string;
    existing_service_ids?: string[];
    append: (value: unknown, options?: FieldArrayMethodProps) => void;
}

export default function InvoiceNewEditDetails() {

    const addServiceDialog = useDialog<AddServiceDialogData>();

    const {control, setValue, watch, resetField} = useFormContext();

    const {fields, append, remove} = useFieldArray({
        control,
        name: "items",
    });

    const values = watch();

    const totalOnRow = values.items.map((item: InvoiceItem) => item.total);

    const subTotal = sum(totalOnRow);

    const totalAmount = subTotal - (values.discount ?? 0); // - values.shipping + values.taxes;

    console.log("values", values);

    useEffect(() => {
        setValue("totalAmount", totalAmount);
    }, [setValue, totalAmount]);

    useEffect(() => {
        addServiceDialog.data = {
            current_invoice_id: values.id,
            client_id: values.client?.id,
            existing_service_ids: values.items.reduce((acc: string[], item: InvoiceItem) => {
                return [...acc, ...item.service_ids ?? []];
            }, []),
            append: append,
        }
    }, [addServiceDialog.data, values.items])

    const handleAdd = () => {
        addServiceDialog.handleOpen({
            current_invoice_id: values.id,
            client_id: values.client?.id,
            existing_service_ids: values.items.reduce((acc: string[], item: InvoiceItem) => {
                return [...acc, ...item.service_ids ?? []];
            }, []),
            append: append,
        });
    };

    const handleRemove = (index: number) => {
        remove(index);
    };

    const handleChangeNumUnits = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
            // if (Number(event.target.value) <= 0) return;
            setValue(`items[${index}].num_units`, Number(event.target.value));
            setValue(
                `items[${index}].total`,
                values.items.map((item: InvoiceItem) => item.num_units * item.charge_per_unit)[index]
            );
        },
        [setValue, values.items]
    );

    const handleChangeChargePerUnit = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
            // if (Number(event.target.value) <= 0) return;
            setValue(`items[${index}].charge_per_unit`, Number(event.target.value));
            setValue(
                `items[${index}].total`,
                values.items.map((item: InvoiceItem) => item.num_units * item.charge_per_unit)[index]
            );
        },
        [setValue, values.items]
    );

    const handleChangeTotal = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
            setValue(
                `items[${index}].total`,
                Number(event.target.value),
            );
        },
        []
    );

    const renderTotal = (
        <Stack
            spacing={2}
            alignItems="flex-end"
            sx={{mt: 3, textAlign: "right", typography: "body2"}}
        >
            <Stack direction="row">
                <Box sx={{color: "text.secondary"}}>Subtotal</Box>
                <Box sx={{width: 160, typography: "subtitle2"}}>${subTotal || "-"}</Box>
            </Stack>

            {/*<Stack direction="row">*/}
            {/*    <Box sx={{color: "text.secondary"}}>Shipping</Box>*/}
            {/*    <Box*/}
            {/*        sx={{*/}
            {/*            width: 160,*/}
            {/*            ...(values.shipping && {color: "error.main"}),*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        {values.shipping ? `- ${(values.shipping)}` : "-"}*/}
            {/*    </Box>*/}
            {/*</Stack>*/}

            <Stack direction="row">
                <Box sx={{color: "text.secondary"}}>Discount</Box>
                <Box
                    sx={{
                        width: 160,
                        ...(values.discount && {color: "error.main"}),
                    }}
                >
                    {values.discount ? `- $${(values.discount)}` : "--"}
                </Box>
            </Stack>

            {/*<Stack direction="row">*/}
            {/*    <Box sx={{color: "text.secondary"}}>Taxes</Box>*/}
            {/*    <Box sx={{width: 160}}>{values.taxes ? (values.taxes) : "-"}</Box>*/}
            {/*</Stack>*/}

            <Stack direction="row" sx={{typography: "subtitle1"}}>
                <Box>Total</Box>
                <Box sx={{width: 160}}>${totalAmount || "-"}</Box>
            </Stack>
        </Stack>
    );

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h6" sx={{color: 'text.secondary', mb: 3}}>
                Details:
            </Typography>

            <Stack divider={<Divider flexItem sx={{borderStyle: "dashed"}}/>} spacing={2}>
                {fields.map((item, index) => (
                    <Stack key={item.id} alignItems="flex-end" spacing={1}>
                        <Stack direction={{xs: "column", md: "row"}} spacing={1.25} sx={{width: 1}}>
                            {/*<RHFTextField*/}
                            {/*    disabled*/}
                            {/*    size="small"*/}
                            {/*    name={`items[${index}].service_id`}*/}
                            {/*    label="Service"*/}
                            {/*    InputLabelProps={{shrink: true}}*/}
                            {/*    sx={{maxWidth: {md: 130}}}*/}
                            {/*/>*/}
                            {/*<TextField*/}
                            {/*    disabled*/}
                            {/*    size="small"*/}
                            {/*    value={`${values.items[index].job_id.split("-").shift().toString().toUpperCase()}`}*/}
                            {/*    label="Job #"*/}
                            {/*    // InputLabelProps={{shrink: true}}*/}
                            {/*    sx={{maxWidth: 100, minWidth: 100}}*/}
                            {/*/>*/}
                            {/*{values.items[index].service_id && <TextField*/}
                            {/*    disabled*/}
                            {/*    size="small"*/}
                            {/*    value={`${values.items[index].service_id.split("-").shift().toString().toUpperCase()}`}*/}
                            {/*    label="Service #"*/}
                            {/*    // InputLabelProps={{shrink: true}}*/}
                            {/*    sx={{maxWidth: 100, minWidth: 100}}*/}
                            {/*/>}*/}

                            <RHFTextField
                                disabled
                                size="small"
                                name={`items[${index}].service_type`}
                                label="Service Type"
                                InputLabelProps={{shrink: true}}
                                sx={{maxWidth: 110, minWidth: 110}}
                            />

                            <TextField
                                disabled
                                size="small"
                                value={format(new Date(values.items[index].date), "MM/dd/yyyy")}
                                label="Date"
                                // InputLabelProps={{shrink: true}}
                                sx={{maxWidth: 110, minWidth: 110}}
                            />

                            <RHFTextField
                                size="small"
                                name={`items[${index}].description`}
                                label="Description"
                                InputLabelProps={{shrink: true}}
                            />

                            {values.items[index].charge_unit !== ChargeUnit.MONTH && <RHFTextField
                                size="small"
                                type="number"
                                name={`items[${index}].charge_per_unit`}
                                label={values.items[index].charge_unit === ChargeUnit.PERCENT_COMPACTED
                                    ? "$ / %"
                                    : `$ / ${values.items[index].charge_unit}`}
                                placeholder="0"
                                onChange={(event) => handleChangeChargePerUnit(event, index)}
                                InputLabelProps={{
                                    shrink: true,
                                    prefix: "$"
                                }}
                                sx={{maxWidth: 80, minWidth: 80}}
                            />}

                            {values.items[index].charge_unit !== ChargeUnit.MONTH && <RHFTextField
                                size="small"
                                type="number"
                                name={`items[${index}].num_units`}
                                label={values.items[index].charge_unit === ChargeUnit.PERCENT_COMPACTED
                                    ? "% Compacted"
                                    : `# ${values.items[index].charge_unit}s`}
                                placeholder="0"
                                onChange={(event) => handleChangeNumUnits(event, index)}
                                InputLabelProps={{shrink: true}}
                                sx={{maxWidth: 80, minWidth: 80}}
                            />}

                            <RHFTextField
                                disabled={values.items[index].charge_unit !== ChargeUnit.MONTH}
                                size="small"
                                type="number"
                                name={`items[${index}].total`}
                                label="Total"
                                placeholder="0.00"
                                value={values.items[index].total === 0 ? "" : values.items[index].total.toFixed(2)}
                                onChange={(event) => handleChangeTotal(event, index)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box sx={{typography: "subtitle2", color: "text.disabled"}}>$</Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    maxWidth: {md: 120},
                                    [`& .${inputBaseClasses.input}`]: {
                                        textAlign: {md: "right"},
                                    },
                                }}
                            />
                        </Stack>

                        <Button
                            size="small"
                            color="error"
                            startIcon={<Trash01 fontSize={'small'}/>}
                            onClick={() => handleRemove(index)}
                        >
                            Remove
                        </Button>
                    </Stack>
                ))}
            </Stack>

            <Divider sx={{my: 2, borderStyle: "dashed"}}/>

            <Stack
                spacing={2}
                direction={{xs: "column", md: "row"}}
                alignItems={{xs: "flex-end", md: "center"}}
            >
                <Button
                    size="small"
                    color="primary"
                    startIcon={<Add/>}
                    onClick={handleAdd}
                    sx={{flexShrink: 0}}
                >
                    Add Job
                </Button>

                <Stack
                    spacing={2}
                    justifyContent="flex-end"
                    direction={{xs: "column", md: "row"}}
                    sx={{width: 1}}
                >
                    {/*<RHFTextField*/}
                    {/*    size="small"*/}
                    {/*    label="Shipping($)"*/}
                    {/*    name="shipping"*/}
                    {/*    type="number"*/}
                    {/*    sx={{maxWidth: {md: 120}}}*/}
                    {/*/>*/}

                    <RHFTextField
                        size="small"
                        label="Discount($)"
                        name="discount"
                        type="number"
                        sx={{maxWidth: {md: 120}}}
                    />

                    {/*<RHFTextField*/}
                    {/*    size="small"*/}
                    {/*    label="Taxes(%)"*/}
                    {/*    name="taxes"*/}
                    {/*    type="number"*/}
                    {/*    sx={{maxWidth: {md: 120}}}*/}
                    {/*/>*/}
                </Stack>
            </Stack>

            {renderTotal}

            {addServiceDialog.data && <InvoiceAddServiceDialog
                current_invoice_id={addServiceDialog.data?.current_invoice_id}
                append={addServiceDialog.data?.append}
                open={addServiceDialog.open}
                client_id={addServiceDialog.data?.client_id}
                existing_service_ids={addServiceDialog.data?.existing_service_ids}
                onClose={addServiceDialog.handleClose}
            />}
        </Box>
    );
}
