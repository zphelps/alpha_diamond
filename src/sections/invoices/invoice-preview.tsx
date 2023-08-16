import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Box,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import {Invoice} from "../../types/invoice.ts";
import Logo from "../../assets/Logo.png";
import {ChargeUnit} from "../../types/job.ts";
import {useAuth} from "../../hooks/use-auth.ts";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: FC<InvoicePreviewProps> = (props) => {
  const { invoice, ...other } = props;

  const auth = useAuth();
  const items = invoice.items || [];
  const dueDate = invoice.due_on && format(Date.parse(invoice.due_on), 'MM/dd/yyyy');
  const issueDate = invoice.issued_on && format(Date.parse(invoice.issued_on), 'MM/dd/yyyy');
  // const subtotalAmount = numeral(invoice.subtotalAmount).format(`${invoice.currency}0,0.00`);
  const discountAmount = numeral(invoice.discount).format(`$0,0.00`);
  const totalAmount = numeral(invoice.total).format(`$0,0.00`);

  return (
    <Card
      {...other}
      sx={{ p: 6 }}
    >
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
        spacing={3}
      >
        <div>
          <Box
            sx={{
              display: 'inline-flex',
              height: 60,
              width: 24
            }}
          >
            <img src={Logo}/>
          </Box>
        </div>
        <div>
          <Typography
            align="right"
            color="success.main"
            variant="h4"
          >
            {invoice.status.toUpperCase()}
          </Typography>
          <Typography
            align="right"
            variant="subtitle2"
          >
            {`INV-${invoice.id.split("-").shift().toString().toUpperCase()}`}
          </Typography>
        </div>
      </Stack>
      <Box sx={{ mt: 4 }}>
        <Grid
          container
          justifyContent="space-between"
        >
          <Grid
            xs={12}
            md={4}
          >
            <Typography variant={'subtitle2'} sx={{mb: 1}}>
              Billed To:
            </Typography>
            <Typography variant="body2">
              {invoice.client.name}
              <br />
              {auth.user.franchise.legal_address}
              <br />
              {auth.user.franchise.primary_contact.phone_number}
                <br />
                {auth.user.franchise.primary_contact.email}
            </Typography>
          </Grid>
          <Grid
              xs={12}
              md={4}
          >
            <Typography variant={'subtitle2'} sx={{mb: 1}}>
              Payment To:
            </Typography>
            <Typography variant="body2">
              {auth.user.franchise.legal_name}
              <br />
              {auth.user.franchise.legal_address}
              <br />
              {auth.user.franchise.primary_contact.phone_number}
              <br />
              {auth.user.franchise.primary_contact.email}
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            {/*<Typography*/}
            {/*  align="right"*/}
            {/*  variant="body2"*/}
            {/*>*/}
            {/*  accounts@devias.io*/}
            {/*  <br />*/}
            {/*  (+40) 652 3456 23*/}
            {/*</Typography>*/}
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Grid
          container
          justifyContent="space-between"
        >
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Due Date
            </Typography>
            <Typography variant="body2">
              {dueDate}
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Issue Date
            </Typography>
            <Typography variant="body2">
              {issueDate}
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Invoice #
            </Typography>
            <Typography variant="body2">
              {invoice.id.split("-").shift().toString().toUpperCase()}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Card sx={{ mt: 4, borderRadius: '12px' }} variant={'outlined'}>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell>
                #
              </TableCell>
              <TableCell>
                Date
              </TableCell>
              <TableCell>
                Description
              </TableCell>
              <TableCell align={'center'}>
                Qty
              </TableCell>
              <TableCell align={'center'}>
                Unit Price
              </TableCell>
              <TableCell align="right">
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => {
              const unitAmount = numeral(item.charge_per_unit).format(`$0,0.00`);
              const totalAmount = numeral(item.total).format(`$0,0.00`);

              return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {format(Date.parse(item.date), 'MM/dd/yyyy')}
                    </TableCell>
                    <TableCell>
                      {item.description}
                    </TableCell>
                    <TableCell align={'center'}>
                      {item.num_units ?? 1}
                    </TableCell>
                    <TableCell align={'center'}>
                      {unitAmount}
                    </TableCell>
                    <TableCell align="right">
                      {totalAmount}
                    </TableCell>
                  </TableRow>
              );
            })}
            <TableRow>
              <TableCell
                  colSpan={4}
                  sx={{borderBottom: "none"}}
              />
              <TableCell sx={{borderBottom: "none"}}>
                <Typography variant="subtitle2">
                  Discount
                </Typography>
              </TableCell>
              <TableCell
                  align="right"
                  sx={{borderBottom: "none"}}
              >
                <Typography variant="subtitle2" color={"error"}>
                  - {discountAmount}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                  colSpan={4}
                  sx={{ borderBottom: 'none' }}
              />
              <TableCell sx={{ borderBottom: 'none' }}>
                <Typography variant="subtitle1">
                  Total
                </Typography>
              </TableCell>
              <TableCell
                  align="right"
                  sx={{ borderBottom: 'none' }}
              >
                <Typography variant="subtitle2">
                  {totalAmount}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {invoice.summary && <Box sx={{mt: 2}}>
        <Typography
            gutterBottom
            variant="h6"
        >
          Notes
        </Typography>
        <Typography
            color="text.secondary"
            variant="body2"
        >
          {invoice.summary}
        </Typography>
      </Box>}
    </Card>
  );
};

InvoicePreview.propTypes = {
  // @ts-ignore
  invoice: PropTypes.object.isRequired
};
