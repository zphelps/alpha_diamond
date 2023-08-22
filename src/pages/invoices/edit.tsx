import 'react';
import {InvoiceNewEditForm} from "../../sections/invoices/invoice-new-edit-form.tsx";
import {useMounted} from "../../hooks/use-mounted.ts";
import {useDispatch, useSelector} from "react-redux";
import {useCallback, useEffect} from "react";
import {invoicesApi} from "../../api/invoices";
import {setInvoicesStatus, upsertOneInvoice} from "../../slices/invoices";
import {Status} from "../../utils/status.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {Seo} from "../../components/seo.tsx";
import {Box, Button, Container, Divider, Link, Stack, SvgIcon, Typography} from "@mui/material";
import {RouterLink} from "../../components/router-link.tsx";
import {paths} from "../../paths.ts";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import {InvoicePdfDocument} from "../../sections/invoices/invoice-pdf-document.tsx";
import {InvoicePreview} from "../../sections/invoices/invoice-preview.tsx";
import {InvoicePdfDialog} from "../../sections/invoices/invoice-pdf-dialog.tsx";

const useInvoice = (invoiceId: string) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleInvoiceGet = useCallback(async () => {
        try {
            const response = await invoicesApi.getInvoice({id: invoiceId});

            if (isMounted()) {
                dispatch(upsertOneInvoice(response));
                dispatch(setInvoicesStatus(Status.SUCCESS));
            }
        } catch (err) {
            console.error(err);
            dispatch(setInvoicesStatus(Status.ERROR));
        }
    }, [isMounted]);

    useEffect(
        () => {
            handleInvoiceGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

export const InvoiceEditPage = () => {
    const params = useParams();
    useInvoice(params.invoiceId);
    const dialog = useDialog();

    const navigate = useNavigate();

    // @ts-ignore
    const invoice = useSelector((state) => state.invoices).invoices[params.invoiceId];


    if (!invoice) {
        return null;
    }

    return (
        <>
            <Seo title="Invoice Details"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Divider sx={{mb: 4}}/>
                <Container maxWidth="lg">
                    <Stack
                        divider={<Divider/>}
                        spacing={3}
                    >
                        <Stack spacing={3}>
                            <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={4}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <div>
                                        <Typography variant="h4">
                                            {`Edit INV-${invoice.id.split("-").shift().toString().toUpperCase()}`}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {invoice.client.name}
                                        </Typography>
                                    </div>
                                </Stack>
                            </Stack>
                        </Stack>
                        <InvoiceNewEditForm currentInvoice={invoice}/>
                    </Stack>
                </Container>
            </Box>
        </>
    )
}
