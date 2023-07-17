import type { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
  Box,
  Button,
  Checkbox, CircularProgress,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import {Scrollbar} from "../../components/scrollbar.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import {Job} from "../../types/job.ts";
import {useCallback} from "react";
import Skeleton from "@mui/material/Skeleton";

interface JobListTableProps {
  count?: number;
  items?: Job[];
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
}

export const JobListTable: FC<JobListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = []
  } = props;

  const selectedSome = (selected.length > 0) && (selected.length < items.length);
  const selectedAll = (items.length > 0) && (selected.length === items.length);
  const enableBulkActions = selected.length > 0;

  const getSeverityColor = useCallback((status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'completed':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'neutral.800'
              : 'neutral.50',
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 2,
            py: 0.5,
            zIndex: 10
          }}
        >
          <Checkbox
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectAll?.();
              } else {
                onDeselectAll?.();
              }
            }}
          />
          <Button
            color="inherit"
            size="small"
          >
            Delete
          </Button>
          <Button
            color="inherit"
            size="small"
          >
            Edit
          </Button>
        </Stack>
      )}
      <Scrollbar>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectAll?.();
                    } else {
                      onDeselectAll?.();
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                Summary
              </TableCell>
              <TableCell>
                Service Type
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
            {(!items || items.length === 0) && [...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex} sx={{px: 2, mx:2}}>
                  <TableCell sx={{pl: 3.5, m:0}}>
                    <Skeleton variant={'rectangular'} width={18} height={18} sx={{borderRadius: 0.75}}  />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="90%" height={24} />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="55%" height={24} />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="50%" height={24} />
                  </TableCell>
                  <TableCell align="right" sx={{pr: 3, m:0}}>
                    <Stack direction={'row'} justifyContent={'right'}>
                      <Skeleton variant="rectangular" width={30} height={30} sx={{borderRadius: 2}} />
                      <Skeleton variant="rectangular" width={30} height={30} sx={{ml: 1.5, borderRadius: 2}} />
                    </Stack>
                  </TableCell>
                </TableRow>
            ))}
            {items.map((job) => {
              const isSelected = selected.includes(job.id);

              return (
                <TableRow
                  hover
                  key={job.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onSelectOne?.(job.id);
                        } else {
                          onDeselectOne?.(job.id);
                        }
                      }}
                      value={isSelected}
                    />
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
                          href={`/jobs/${job.id}`}
                          variant="subtitle2"
                        >
                          {job.client.name}
                        </Link>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          JOB-{job.id.split("-").shift().toString().toUpperCase()}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {job.summary}
                  </TableCell>
                  <TableCell>
                    {job.service_type}
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={getSeverityColor(job.status)}>
                        {job.status}
                    </SeverityPill>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      // component={RouterLink}
                      // href={paths.dashboard.customers.edit}
                    >
                      <SvgIcon>
                        <Edit02Icon />
                      </SvgIcon>
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={`/jobs/${job.id}`}
                    >
                      <SvgIcon>
                        <ArrowRightIcon />
                      </SvgIcon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

JobListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array
};
