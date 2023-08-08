import type {ChangeEvent, FC, MouseEvent} from "react";
import {format} from "date-fns";
import numeral from "numeral";
import PropTypes from "prop-types";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {
    Avatar, Box,
    Card,
    IconButton, Link,
    Stack,
    SvgIcon,
    Table,
    TableBody,
    TableCell, TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import {Invoice, InvoiceStatus} from "../../types/invoice.ts";
import {SeverityPill, SeverityPillColor} from "../../components/severity-pill.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {Scrollbar} from "../../components/scrollbar.tsx";
import Skeleton from "@mui/material/Skeleton";
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";
import Edit02Icon from "@untitled-ui/icons-react/build/esm/Edit02";

interface InvoiceListTableProps {
    loading?: boolean;
    count?: number;
    group?: boolean;
    items?: Invoice[];
    onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    page?: number;
    rowsPerPage?: number;
}

export const InvoiceListTable: FC<InvoiceListTableProps> = (props) => {
    const {
        loading,
        count = 0,
        items = [],
        onPageChange = () => {
        },
        onRowsPerPageChange,
        page = 0,
        rowsPerPage = 0,
    } = props;

    return count === 0 && !loading ? <Typography>
        No invoices found
    </Typography> : (
        <Box sx={{position: "relative"}}>
            {/*<Scrollbar>*/}
            <Table sx={{minWidth: 1000}} size={"small"}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{pl: 3}}>
                            Issued
                        </TableCell>
                        <TableCell>
                            Name
                        </TableCell>
                        <TableCell>
                            Due
                        </TableCell>
                        <TableCell>
                            Total
                        </TableCell>
                        <TableCell>
                            Status
                        </TableCell>
                        <TableCell align="right">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(!items || items.length === 0 || loading) && [...Array(10)].map((_, rowIndex) => (
                        <TableRow key={rowIndex} sx={{px: 2, mx: 2}}>
                            <TableCell sx={{pl: 2, m: 0}}>
                                <Skeleton variant="text" width="80%" height={24}/>
                                <Skeleton variant="text" width="60%" height={24}/>
                            </TableCell>
                            <TableCell sx={{pl: 2, m: 0}}>
                                <Skeleton variant="text" width="90%" height={24}/>
                            </TableCell>
                            <TableCell sx={{pl: 2, m: 0}}>
                                <Skeleton variant="text" width="55%" height={24}/>
                            </TableCell>
                            <TableCell sx={{pl: 2, m: 0}}>
                                <Skeleton variant="text" width="50%" height={24}/>
                            </TableCell>
                            <TableCell sx={{pl: 2, m: 0}}>
                                <Skeleton variant="text" width="50%" height={24}/>
                            </TableCell>
                            <TableCell align="right" sx={{pr: 3, m: 0}}>
                                <Stack direction={"row"} justifyContent={"right"}>
                                    <Skeleton variant="rectangular" width={30} height={30} sx={{borderRadius: 2}}/>
                                    <Skeleton variant="rectangular" width={30} height={30}
                                              sx={{ml: 1.5, borderRadius: 2}}/>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!loading && items && items.map((invoice) => {
                        return (
                            <TableRow
                                hover
                                key={invoice.id}
                            >
                                <TableCell sx={{pl: 3}} width={100}>
                                    <Box
                                        sx={{
                                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                                ? 'neutral.800'
                                                : 'neutral.200',
                                            borderRadius: 2,
                                            maxWidth: 'fit-content',
                                            p: 1
                                        }}
                                    >
                                        <Typography
                                            align="center"
                                            variant="subtitle2"
                                        >
                                            {format(new Date(invoice.issued_on), "LLL").toUpperCase()}
                                        </Typography>
                                        <Typography
                                            align="center"
                                            variant="h6"
                                        >
                                            {format(new Date(invoice.issued_on), "d")}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                    >
                                        <div>
                                            <Link
                                                color="inherit"
                                                component={RouterLink}
                                                href={`/jobs/${invoice.id}`}
                                                variant="subtitle2"
                                            >
                                                {invoice.client.name}
                                            </Link>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                INV-{invoice.id.split("-").shift().toString().toUpperCase()}
                                            </Typography>
                                        </div>
                                    </Stack>
                                </TableCell>
                                <TableCell width={150}>
                                    {invoice.due_on ? format(new Date(invoice.issued_on), "dd MMM yyyy") : "N/A"}
                                </TableCell>
                                <TableCell width={150}>
                                    {invoice.amount_due ? numeral(invoice.amount_due).format("$0,0.00") : "N/A"}
                                </TableCell>
                                <TableCell sx={{height: 50}} width={100}>
                                    <SeverityPill color={getSeverityStatusColor(invoice.status)}>
                                        {invoice.status}
                                    </SeverityPill>
                                </TableCell>
                                <TableCell align="right" sx={{py: 0}} width={175}>
                                    <IconButton
                                        // component={RouterLink}
                                        // href={paths.dashboard.customers.edit}
                                    >
                                        <SvgIcon>
                                            <Edit02Icon/>
                                        </SvgIcon>
                                    </IconButton>
                                    <IconButton
                                        component={RouterLink}
                                        href={`/jobs/${invoice.id}`}
                                    >
                                        <SvgIcon>
                                            <ArrowRightIcon/>
                                        </SvgIcon>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {/*</Scrollbar>*/}
            <TablePagination
                component="div"
                count={count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[15, 30, 60]}
            />
        </Box>
    );
};

InvoiceListTable.propTypes = {
    count: PropTypes.number,
    group: PropTypes.bool,
    items: PropTypes.array,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number
};
