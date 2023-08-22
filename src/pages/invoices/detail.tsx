import {useCallback, useEffect, useState} from "react";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import {
    Avatar, Backdrop,
    Box,
    Button, CircularProgress,
    Container,
    Divider,
    Link, ListItemIcon, ListItemText, Menu, MenuItem, MenuList,
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
import {useAuth} from "../../hooks/use-auth.ts";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {
    Delete,
    DeleteForeverOutlined, DeleteOutlined,
    Edit,
    Email,
    ManageAccounts,
    Preview,
    RemoveRedEye,
    Verified
} from "@mui/icons-material";

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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const actionsMenuOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigate = useNavigate();

    // @ts-ignore
    const invoice = useSelector((state) => state.invoices).invoices[params.invoiceId];

    const [loading, setLoading] = useState(false);

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
                                    {/*<Button*/}
                                    {/*    color="inherit"*/}
                                    {/*    onClick={() => navigate(paths.invoices.edit(invoice.id))}*/}
                                    {/*>*/}
                                    {/*    Edit*/}
                                    {/*</Button>*/}
                                    {/*<Button*/}
                                    {/*    color="inherit"*/}
                                    {/*    onClick={dialog.handleOpen}*/}
                                    {/*>*/}
                                    {/*    Preview*/}
                                    {/*</Button>*/}
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={handleClick}
                                        endIcon={(
                                            <SvgIcon>
                                                <ChevronDownIcon/>
                                            </SvgIcon>
                                        )}
                                    >
                                        Actions
                                    </Button>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={actionsMenuOpen}
                                        onClose={handleClose}
                                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                                    >
                                        <MenuList sx={{px: 1, py: 0}}>
                                            <MenuItem
                                                onClick={() => navigate(paths.invoices.edit(invoice.id))}
                                            >
                                                <ListItemIcon>
                                                    <Edit fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2">
                                                            Edit
                                                        </Typography>
                                                    }
                                                />
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    dialog.handleOpen();
                                                    handleClose();
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <RemoveRedEye fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2">
                                                            Preview
                                                        </Typography>
                                                    }
                                                />
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {}}
                                            >
                                                <ListItemIcon>
                                                    <Email fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2">
                                                            Email
                                                        </Typography>
                                                    }
                                                />
                                            </MenuItem>
                                            <Divider />
                                            <MenuItem
                                                onClick={async () => {
                                                    handleClose();
                                                    setLoading(true)
                                                    await invoicesApi.deleteInvoice({id: invoice.id});
                                                    setLoading(false)
                                                    navigate(paths.invoices.index);
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Delete color={'error'} fontSize="small"/>
                                                </ListItemIcon>
                                                <ListItemText
                                                    sx={{color: 'error.main', fontWeight: 'bold'}}
                                                    primary={
                                                        <Typography variant="subtitle2" color="error.main">
                                                            Delete
                                                        </Typography>
                                                    }
                                                />
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    {/*<PDFDownloadLink*/}
                                    {/*    document={<InvoicePdfDocument invoice={invoice} franchise={auth.user.franchise}/>}*/}
                                    {/*    fileName="invoice"*/}
                                    {/*    style={{textDecoration: "none"}}*/}
                                    {/*>*/}
                                    {/*    */}
                                    {/*</PDFDownloadLink>*/}
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
            {loading && (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}
        </>
    );
};
