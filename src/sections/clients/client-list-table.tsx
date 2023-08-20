import type { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import {
  Box,
  Button,
  Checkbox,
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
} from '@mui/material';
import {Scrollbar} from "../../components/scrollbar.tsx";
import {RouterLink} from "../../components/router-link.tsx";
import {Client} from "../../types/client.ts";
import {SeverityPill} from "../../components/severity-pill.tsx";
import Skeleton from "@mui/material/Skeleton";

interface ClientListTableProps {
  count?: number;
  items?: Client[];
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

export const ClientListTable: FC<ClientListTableProps> = (props) => {
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
        <Table sx={{ minWidth: 700 }}>
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
                Location
              </TableCell>
              <TableCell>
                Type
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
            {items.map((client) => {
              const isSelected = selected.includes(client.id);

              return (
                <TableRow
                  hover
                  key={client.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox" sx={{py: 1}}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onSelectOne?.(client.id);
                        } else {
                          onDeselectOne?.(client.id);
                        }
                      }}
                      value={isSelected}
                    />
                  </TableCell>
                  <TableCell sx={{py: 0}}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <div>
                        <Link
                          color="inherit"
                          component={RouterLink}
                          href={`/clients/${client.id}`}
                          variant="subtitle2"
                        >
                          {client.name}
                        </Link>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          ID: {client.id.split('-').shift().toUpperCase()}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{py: 0}}>
                    {client.service_location.name}
                  </TableCell>
                  <TableCell sx={{py: 0}}>
                    {client.type}
                  </TableCell>
                  <TableCell sx={{py: 0}}>
                    <SeverityPill color={client.status === 'active' ? 'success' : 'error'}>
                        {client.status}
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
                      href={`/clients/${client.id}`}
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
        rowsPerPageOptions={[15, 30, 60]}
      />
    </Box>
  );
};

ClientListTable.propTypes = {
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
