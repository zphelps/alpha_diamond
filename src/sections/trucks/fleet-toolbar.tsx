import type { FC } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import { Box, Card, IconButton, SvgIcon } from '@mui/material';

interface FleetToolbarProps {
  onDrawerOpen?: () => void;
}

export const FleetToolbar: FC<FleetToolbarProps> = (props) => {
  const { onDrawerOpen } = props;

  return (
    <Box
      sx={{
        left: 0,
        p: 2,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10
      }}
    >
      <Card
        sx={{
          p: 2,
          pointerEvents: 'auto'
        }}
      >
        <IconButton onClick={onDrawerOpen}>
          <SvgIcon>
            <Menu01Icon />
          </SvgIcon>
        </IconButton>
      </Card>
    </Box>
  );
};

FleetToolbar.propTypes = {
  onDrawerOpen: PropTypes.func
};
