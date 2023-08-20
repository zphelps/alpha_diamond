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
import Skeleton from "@mui/material/Skeleton";
import {Client} from "../../types/client.ts";
import {Scrollbar} from "../scrollbar.tsx";
import {RouterLink} from "../router-link.tsx";
import {SeverityPill} from "../severity-pill.tsx";

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

export const SelectClientListTable: FC<ClientListTableProps> = (props) => {
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
      {/*<Scrollbar>*/}
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
              </TableCell>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                Service Location
              </TableCell>
              <TableCell>
                Type
              </TableCell>
              <TableCell>
                Status
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onDeselectAll?.();
                          onSelectOne?.(client.id);
                        } else {
                          onDeselectOne?.(client.id);
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
                        <Typography
                          color="inherit"
                          variant="subtitle2"
                        >
                          {client.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          ID: {client.id}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {client.service_location.name}
                  </TableCell>
                  <TableCell>
                    {client.type}
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={client.status === 'active' ? 'success' : 'error'}>
                        {client.status}
                    </SeverityPill>
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
        rowsPerPageOptions={[10, 20, 30]}
      />
    </Box>
  );
};

SelectClientListTable.propTypes = {
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
