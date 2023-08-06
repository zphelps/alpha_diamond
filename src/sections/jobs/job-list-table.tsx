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
import {getSeverityServiceTypeColor, getSeverityStatusColor} from "../../utils/severity-color.ts";

interface JobListTableProps {
    loading?: boolean;
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
    loading,
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

  return (
    <Box sx={{ position: 'relative' }}>
      {/*<Scrollbar>*/}
        <Table sx={{ minWidth: 1000 }} size={'small'}>
          <TableHead>
            <TableRow>
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
            {(!items || items.length === 0 || loading) && [...Array(15)].map((_, rowIndex) => (
                <TableRow key={rowIndex} sx={{px: 2, mx:2}}>
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
            {!loading && items && items.map((job) => {
              const isSelected = selected.includes(job.id);

              return (
                <TableRow
                  hover
                  key={job.id}
                  selected={isSelected}
                >
                  <TableCell sx={{py: 1}}>
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
                  <TableCell sx={{height: 50}}>
                    <SeverityPill color={getSeverityServiceTypeColor(job.service_type)}>
                      {job.service_type}
                    </SeverityPill>
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={getSeverityStatusColor(job.status)}>
                        {job.status}
                    </SeverityPill>
                  </TableCell>
                  <TableCell align="right" sx={{py: 0}}>
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
