import {useMemo} from "react";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import FormProvider from "../../components/form-provider.tsx";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
// routes

// types
// _mock
// hooks
// components
//
import {Invoice} from "../../types/invoice.ts";
import {useRouter} from "../../hooks/use-router.ts";
import {useBoolean} from "../../hooks/use-boolean.ts";
import {yupResolver} from "@hookform/resolvers/yup";
import {paths} from "../../paths.ts";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import InvoiceNewEditStatusDate from "./invoice-new-edit-status-date.tsx";
import InvoiceNewEditDetails from "./invoice-new-edit-details.tsx";
import {useNavigate} from "react-router-dom";
import {invoicesApi, UpdateInvoiceRequest} from "../../api/invoices";
import toast from "react-hot-toast";

// ----------------------------------------------------------------------

type Props = {
    currentInvoice?: Invoice;
};

export function InvoiceNewEditForm({currentInvoice}: Props) {
    const navigate = useNavigate();

    const loadingSave = useBoolean();

    const loadingSend = useBoolean();

    const NewInvoiceSchema = Yup.object().shape({
        client: Yup.mixed<any>().nullable().required("Invoice to is required"),
        issued_on: Yup.mixed<any>().nullable().required("Issue date is required"),
        due_on: Yup.mixed<any>()
            .required("Due date is required")
            .test(
                "date-min",
                "Due date must be later than issue date",
                (value, {parent}) => {
                    console.log("value", value);
                    console.log("parent", parent.issued_on);
                    return value.getTime() > parent.issued_on.getTime();
                }
            ),
        status: Yup.string(),
        invoiceFrom: Yup.mixed(),
        totalAmount: Yup.number(),
        id: Yup.string(),
    });

    const defaultValues = useMemo(
        () => ({
            id: currentInvoice?.id || uuid(),
            issued_on: new Date(currentInvoice?.issued_on) || new Date(),
            due_on: new Date(currentInvoice?.due_on) || null,
            status: currentInvoice?.status || "draft",
            invoiceFrom: "hola",
            client: currentInvoice?.client || null,
            discount: currentInvoice?.discount || 0,
            previous_items: currentInvoice?.items || [],
            items: currentInvoice?.items || [
                {description: "", service_type: "", quantity: 1, hours: 0, unit_price: 0},
            ],
            totalAmount: currentInvoice?.total || 0,
        }),
        [currentInvoice]
    );

    const methods = useForm({
        resolver: yupResolver(NewInvoiceSchema),
        defaultValues,
    });

    const {
        reset,

        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const handleSaveAsDraft = handleSubmit(async (data: any) => {
        loadingSave.onTrue();

        try {
            toast.loading("Updating invoice...");
            const updatedInvoice = {
                id: data.id,
                discount: data.discount,
                due_on: data.due_on,
                issued_on: data.issued_on,
                status: 'draft',
                total: data.totalAmount,
                items: data.items.map((item) => ({
                    id: item.id,
                    charge_unit: item.charge_unit,
                    charge_per_unit: item.charge_per_unit,
                    date: item.date,
                    job_id: item.job_id,
                    service_ids: item.service_ids,
                    total: item.total,
                    description: item.description,
                    service_type: item.service_type,
                    num_units: item.num_units,
                })),
            }
            await invoicesApi.updateInvoice(updatedInvoice);
            reset();
            loadingSave.onFalse();
            toast.dismiss();
            toast.success("Done!");
            navigate(paths.invoices.details(data.id));
            console.info("DATA", JSON.stringify(data, null, 2));
        } catch (error) {
            toast.dismiss();
            toast.error("Error updating invoice");
            console.error(error);
            loadingSave.onFalse();
        }
    });

    const handleCreateAndSend = handleSubmit(async (data) => {
        loadingSend.onTrue();

        try {
            // await new Promise((resolve) => setTimeout(resolve, 500));
            // reset();
            // loadingSend.onFalse();
            // router.push(paths.invoice);
            // console.info("DATA", JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(error);
            loadingSend.onFalse();
        }
    });

    return (
        <FormProvider methods={methods}>
            <Card>
                {/*<InvoiceNewEditAddress />*/}

                <InvoiceNewEditStatusDate/>

                <InvoiceNewEditDetails/>
            </Card>

            <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{mt: 3}}>
                <LoadingButton
                    color="inherit"
                    size="large"
                    variant="outlined"
                    loading={loadingSave.value && isSubmitting}
                    onClick={handleSaveAsDraft}
                >
                    Save as Draft
                </LoadingButton>

                <LoadingButton
                    size="large"
                    variant="contained"
                    loading={loadingSend.value && isSubmitting}
                    onClick={handleCreateAndSend}
                >
                    {currentInvoice ? "Update" : "Create"} & Send
                </LoadingButton>
            </Stack>
        </FormProvider>
    );
}
