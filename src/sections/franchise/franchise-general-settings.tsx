import type { FC } from 'react';
import PropTypes from 'prop-types';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider, FormLabel, InputAdornment, MenuItem, OutlinedInput, Select,
  Stack,
  SvgIcon,
  Switch,
  TextField,
  Typography,
  Unstable_Grid2 as Grid
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import {ArrowDropDown} from "@mui/icons-material";
import {usTimezones} from "../../utils/timezones.ts";
import {startOfDay} from "date-fns";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";

interface FranchiseGeneralSettingsProps {
  avatar: string;
  email: string;
  name: string;
}

export const FranchiseGeneralSettings: FC<FranchiseGeneralSettingsProps> = (props) => {
  const { avatar, email, name } = props;

  return (
    <Stack
      spacing={4}
      {...props}
    >
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">
                General
              </Typography>
            </Grid>
            <Grid
              xs={12}
              md={8}
            >
              <Stack spacing={3}>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Box
                    sx={{
                      borderColor: 'neutral.300',
                      borderRadius: '50%',
                      borderStyle: 'dashed',
                      borderWidth: 1,
                      p: '4px'
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '50%',
                        height: '100%',
                        width: '100%',
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          alignItems: 'center',
                          backgroundColor: (theme) => alpha(theme.palette.neutral[700], 0.5),
                          borderRadius: '50%',
                          color: 'common.white',
                          cursor: 'pointer',
                          display: 'flex',
                          height: '100%',
                          justifyContent: 'center',
                          left: 0,
                          opacity: 0,
                          position: 'absolute',
                          top: 0,
                          width: '100%',
                          zIndex: 1,
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1}
                        >
                          <SvgIcon color="inherit">
                            <Camera01Icon />
                          </SvgIcon>
                          <Typography
                            color="inherit"
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            Select
                          </Typography>
                        </Stack>
                      </Box>
                      <Avatar
                        src={avatar}
                        sx={{
                          height: 100,
                          width: 100
                        }}
                      >
                        <SvgIcon>
                          <User01Icon />
                        </SvgIcon>
                      </Avatar>
                    </Box>
                  </Box>
                  <Button
                    color="inherit"
                    size="small"
                  >
                    Change
                  </Button>
                </Stack>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <TextField
                    defaultValue={name}
                    label="Franchise Name"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    color="inherit"
                    size="small"
                  >
                    Save
                  </Button>
                </Stack>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <TextField
                    defaultValue={email}
                    disabled
                    label="Email Address"
                    required
                    sx={{
                      flexGrow: 1,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderStyle: 'dashed'
                      }
                    }}
                  />
                  <Button
                    color="inherit"
                    size="small"
                  >
                    Edit
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">
                Operations
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={12}
              md={8}
            >
              <Stack
                divider={<Divider />}
                spacing={3}
              >
                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Timezone
                  </Typography>
                  <Box flex={3}>
                    <Select
                        fullWidth
                        placeholder={'Select a timezone'}
                        // value={duration}
                        // onChange={(e) => setFieldValue('duration', e.target.value)}
                        input={<OutlinedInput label={'Timezone'} sx={{height: '55px'}}/>}
                        label={'Timezone'}
                        endAdornment={(
                            <InputAdornment position="end">
                              <ArrowDropDown fontSize="small" />
                            </InputAdornment>
                        )}
                        MenuProps={{
                          PaperProps: {
                            sx: { maxHeight: 240 },
                          },
                        }}
                    >
                      {usTimezones.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {`${option.label}`}
                          </MenuItem>
                      ))}
                    </Select>
                  </Box>

                </Stack>

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Operating Hours
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TimePicker
                        sx={{width: '100%'}}
                        label="Start"
                        slots={{
                          textField: TextField,
                        }}
                        value={new Date()}
                    />

                    <TimePicker
                        sx={{width: '100%'}}
                        label="End"
                        slots={{
                          textField: TextField,
                        }}
                        value={new Date()}
                    />
                  </Stack>
                </Stack>

                <Stack
                    alignItems="flex-start"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">
                      Include weekends?
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                      Services can be scheduled on weekends.
                    </Typography>
                  </Stack>
                  <Switch />
                </Stack>

              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid
              container
              spacing={3}
          >
            <Grid
                xs={12}
                md={4}
            >
              <Typography variant="h6">
                Legal
              </Typography>
            </Grid>
            <Grid
                xs={12}
                sm={12}
                md={8}
            >
              <Stack
                  divider={<Divider />}
                  spacing={3}
              >

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Name
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TextField
                        defaultValue={name}
                        label="Legal Name"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        color="inherit"
                        size="small"
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    DBA
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TextField
                        defaultValue={name}
                        label="Legal Address"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        color="inherit"
                        size="small"
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Address
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TextField
                        defaultValue={name}
                        label="Address"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        color="inherit"
                        size="small"
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Tax ID
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TextField
                        defaultValue={name}
                        label="#"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        color="inherit"
                        size="small"
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={'row'}>
                  <Typography flex={1} variant={'subtitle1'}>
                    Notes
                  </Typography>
                  <Stack flex={3} direction={'row'} spacing={2}>
                    <TextField
                        multiline
                        rows={3}
                        defaultValue={name}
                        label="Notes"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        color="inherit"
                        size="small"
                    >
                      Save
                    </Button>
                  </Stack>
                </Stack>

              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">
                Delete Account
              </Typography>
            </Grid>
            <Grid
              xs={12}
              md={8}
            >
              <Stack
                alignItems="flex-start"
                spacing={3}
              >
                <Typography variant="subtitle1">
                  Delete your account and all of your source data. This is irreversible.
                </Typography>
                <Button
                  color="error"
                  variant="outlined"
                >
                  Delete account
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
};

FranchiseGeneralSettings.propTypes = {
  avatar: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};
