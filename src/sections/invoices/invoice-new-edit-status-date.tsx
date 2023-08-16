import {useFormContext, Controller} from "react-hook-form";
// @mui
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import RHFTextField from "../../components/rhf-text-field.tsx";
import {RHFSelect} from "../../components/rhf-select.tsx";
// components

// ----------------------------------------------------------------------

export default function InvoiceNewEditStatusDate() {
    const {control, watch} = useFormContext();

    const values = watch();

    return (
        <Stack
            spacing={2}
            direction={{xs: "column", sm: "row"}}
            sx={{p: 3, background: (theme) => theme.palette.neutral[50]}}
        >
            <RHFTextField
                disabled
                name="id"
                label="Invoice number"
                value={`INV-${values.id.split("-")[0].toUpperCase()}`}
            />

            <RHFSelect
                fullWidth
                name="status"
                label="Status"
                InputLabelProps={{shrink: true}}
                PaperPropsSx={{textTransform: "capitalize"}}
            >
                {["paid", "pending", "overdue", "draft"].map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </RHFSelect>

            <Controller
                name="issued_on"
                control={control}
                render={({field, fieldState: {error}}) => (
                    <DatePicker
                        disabled
                        label="Date create"
                        value={field.value}
                        onChange={(newValue) => {
                            field.onChange(newValue);
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error,
                                helperText: error?.message,
                            },
                        }}
                    />
                )}
            />

            <Controller
                name="due_on"
                control={control}
                render={({field, fieldState: {error}}) => (
                    <DatePicker
                        label="Due date"
                        value={field.value}
                        onChange={(newValue) => {
                            field.onChange(newValue);
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error,
                                helperText: error?.message,
                            },
                        }}
                    />
                )}
            />
        </Stack>
    );
}
