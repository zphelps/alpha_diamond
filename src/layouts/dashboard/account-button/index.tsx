import type { FC } from 'react';
import { Avatar, Box, ButtonBase } from '@mui/material';
import { AccountPopover } from './account-popover';
import {usePopover} from "../../../hooks/use-popover";
import {useAuth} from "../../../hooks/use-auth";

export const AccountButton: FC = () => {
  const user = useAuth();
  const popover = usePopover<HTMLButtonElement>();

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{
          alignItems: 'center',
          display: 'flex',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'divider',
          height: 40,
          width: 40,
          borderRadius: '50%'
        }}
      >
        <Avatar
          sx={{
            height: 32,
            width: 32
          }}
          src={user.user?.imageURL}
        >
          {/*<SvgIcon>*/}
          {/*  <User01Icon />*/}
          {/*</SvgIcon>*/}
        </Avatar>
      </Box>
      <AccountPopover
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
      />
    </>
  );
};
