import type { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { Drawer, IconButton, Stack, SvgIcon, Typography } from '@mui/material';

interface FleetDrawerProps {
  children?: ReactNode;
  container?: HTMLDivElement | null;
  onClose?: () => void;
  open?: boolean;
}

export const FleetDrawer: FC<FleetDrawerProps> = (props) => {
  const { children, container, open, onClose } = props;

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute'
        }
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          pointerEvents: 'auto',
          position: 'absolute'
        }
      }}
      SlideProps={{ container }}
      variant="temporary"
    >
      <Stack
        alignItems="flex-center"
        direction="row"
        justifyContent="space-between"
        sx={{ p: 2 }}
      >
        <Typography variant="h5">
          Fleet
        </Typography>
        <IconButton onClick={onClose}>
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      {children}
    </Drawer>
  );
};

FleetDrawer.propTypes = {
  children: PropTypes.node,
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool
};
