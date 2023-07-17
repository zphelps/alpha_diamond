import type { ChangeEvent, FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ChevronLeftIcon from '@untitled-ui/icons-react/build/esm/ChevronLeft';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import {
  Button,
  IconButton,
  Stack,
  SvgIcon,
  TextField,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material';

export type TimelineView =
    | 'resourceTimeGridWeek'
    | 'resourceTimeGrid';

interface ViewOption {
  label: string;
  value: TimelineView;
}

const viewOptions: ViewOption[] = [
  {
    label: 'Week',
    value: 'resourceTimeGridWeek'
  },
  {
    label: 'Day',
    value: 'resourceTimeGrid'
  },
];

interface CalendarToolbarProps {
  children?: ReactNode;
  date: Date;
  onAddClick?: () => void;
  onDateNext?: () => void;
  onDatePrev?: () => void;
  onDateToday?: () => void;
  onViewChange?: (view: TimelineView) => void;
  view: TimelineView;
}

export const TimelineToolbar: FC<CalendarToolbarProps> = (props) => {
  const {
    date,
    onAddClick,
    onDateNext,
    onDatePrev,
    onDateToday,
    onViewChange,
    view,
    ...other
  } = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const handleViewChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onViewChange?.(event.target.value as TimelineView);
    },
    [onViewChange]
  );

  const dateMonth = format(date, 'MMMM');
  const dateDay = format(date, 'y');

  // On mobile allow only timeGridDay and agenda views

  const availableViewOptions = useMemo(
    () => {
      return mdUp
        ? viewOptions
        : viewOptions.filter((option) => ['timeGridDay', 'listWeek'].includes(option.value));
    },
    [mdUp]
  );

  return (
    <Stack
      alignItems="center"
      flexWrap="wrap"
      justifyContent="space-between"
      flexDirection={{
        xs: 'column',
        md: 'row'
      }}
      spacing={3}
      sx={{ px: 3 }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
      >
        <Typography variant="h4">
          {dateMonth}
        </Typography>
        <Typography
          sx={{ fontWeight: 300 }}
          variant="h4"
        >
          {dateDay}
        </Typography>
      </Stack>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
      >
        <IconButton onClick={onDatePrev}>
          <SvgIcon>
            <ChevronLeftIcon />
          </SvgIcon>
        </IconButton>
        <IconButton onClick={onDateNext}>
          <SvgIcon>
            <ChevronRightIcon />
          </SvgIcon>
        </IconButton>
        <TextField
          label="View"
          name="view"
          onChange={handleViewChange}
          select
          SelectProps={{ native: true }}
          size="small"
          sx={{
            minWidth: 120,
            order: {
              xs: -1,
              md: 0
            }
          }}
          value={view}
        >
          {availableViewOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </TextField>
        <Button
          onClick={onAddClick}
          startIcon={(
            <SvgIcon>
              <PlusIcon />
            </SvgIcon>
          )}
          sx={{
            width: {
              xs: '100%',
              md: 'auto'
            }
          }}
          variant="contained"
        >
          New Event
        </Button>
      </Stack>
    </Stack>
  );
};

TimelineToolbar.propTypes = {
  children: PropTypes.node,
  date: PropTypes.instanceOf(Date).isRequired,
  onAddClick: PropTypes.func,
  onDateNext: PropTypes.func,
  onDatePrev: PropTypes.func,
  onDateToday: PropTypes.func,
  onViewChange: PropTypes.func,
  view: PropTypes.oneOf<TimelineView>([
    'resourceTimeGridWeek',
    'resourceTimeGrid',
  ]).isRequired
};
