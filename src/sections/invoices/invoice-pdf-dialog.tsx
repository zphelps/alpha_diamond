import type { FC } from 'react';
import PropTypes from 'prop-types';
import { PDFViewer } from '@react-pdf/renderer';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import { Box, Button, Dialog, SvgIcon } from '@mui/material';
import { InvoicePdfDocument } from './invoice-pdf-document';
import {Invoice} from "../../types/invoice.ts";
import {useAuth} from "../../hooks/use-auth.ts";

interface InvoicePdfDialogProps {
  invoice?: Invoice;
  onClose?: () => void;
  open?: boolean;
}

export const InvoicePdfDialog: FC<InvoicePdfDialogProps> = (props) => {
  const { invoice, onClose, open = false, ...other } = props;
  const auth = useAuth();

  if (!invoice) {
    return null;
  }

  return (
    <Dialog
      fullScreen
      open={open}
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 2
          }}
        >
          <Button
            color="inherit"
            startIcon={(
              <SvgIcon>
                <ArrowLeftIcon />
              </SvgIcon>
            )}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <PDFViewer
            height="100%"
            style={{ border: 'none' }}
            width="100%"
          >
            <InvoicePdfDocument invoice={invoice} franchise={auth.user.franchise} />
          </PDFViewer>
        </Box>
      </Box>
    </Dialog>
  );
};

InvoicePdfDialog.propTypes = {
  // @ts-ignore
  invoice: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool
};
