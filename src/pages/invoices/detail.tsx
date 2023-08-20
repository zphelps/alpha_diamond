import {useCallback, useEffect, useState} from "react";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import {
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    Link,
    Stack,
    SvgIcon,
    Typography
} from "@mui/material";
import {Invoice} from "../../types/invoice.ts";
import {useMounted} from "../../hooks/use-mounted.ts";
import {invoicesApi} from "../../api/invoices";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {Seo} from "../../components/seo.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {paths} from "../../paths.ts";
import ReactPDF from "@react-pdf/renderer";
import PDFDownloadLink = ReactPDF.PDFDownloadLink;
import {InvoicePdfDocument} from "../../sections/invoices/invoice-pdf-document.tsx";
import {InvoicePreview} from "../../sections/invoices/invoice-preview.tsx";
import {InvoicePdfDialog} from "../../sections/invoices/invoice-pdf-dialog.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setJobsStatus, upsertOneJob} from "../../slices/jobs";
import {Status} from "../../utils/status.ts";
import {setInvoicesStatus, upsertOneInvoice} from "../../slices/invoices";

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

export const InvoiceDetailsPage = () => {
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
                        spacing={4}
                    >
                        <Stack spacing={4}>
                            {/*<div>*/}
                            {/*    <Link*/}
                            {/*        color="text.primary"*/}
                            {/*        component={RouterLink}*/}
                            {/*        href={paths.invoices.index}*/}
                            {/*        sx={{*/}
                            {/*            alignItems: "center",*/}
                            {/*            display: "inline-flex"*/}
                            {/*        }}*/}
                            {/*        underline="hover"*/}
                            {/*    >*/}
                            {/*        <SvgIcon sx={{mr: 1}}>*/}
                            {/*            <ArrowLeftIcon/>*/}
                            {/*        </SvgIcon>*/}
                            {/*        <Typography variant="subtitle2">*/}
                            {/*            Invoices*/}
                            {/*        </Typography>*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
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
                                    {/*<Avatar*/}
                                    {/*  sx={{*/}
                                    {/*    height: 42,*/}
                                    {/*    width: 42*/}
                                    {/*  }}*/}
                                    {/*>*/}
                                    {/*  {getInitials(invoice.customer.name)}*/}
                                    {/*</Avatar>*/}
                                    <div>
                                        <Typography variant="h4">
                                            {`INV-${invoice.id.split("-").shift().toString().toUpperCase()}`}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {invoice.client.name}
                                        </Typography>
                                    </div>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Button
                                        color="inherit"
                                        onClick={() => navigate(paths.invoices.edit(invoice.id))}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        color="inherit"
                                        onClick={dialog.handleOpen}
                                    >
                                        Preview
                                    </Button>
                                    <PDFDownloadLink
                                        document={<InvoicePdfDocument invoice={invoice}/>}
                                        fileName="invoice"
                                        style={{textDecoration: "none"}}
                                    >
                                        <Button
                                            color="primary"
                                            variant="contained"
                                        >
                                            Download
                                        </Button>
                                    </PDFDownloadLink>
                                </Stack>
                            </Stack>
                        </Stack>
                        <InvoicePreview invoice={invoice}/>
                    </Stack>
                </Container>
            </Box>
            <InvoicePdfDialog
                invoice={invoice}
                onClose={dialog.handleClose}
                open={dialog.open}
            />
        </>
    );
};
