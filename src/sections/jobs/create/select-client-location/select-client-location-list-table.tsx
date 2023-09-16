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
import {Client} from "../../../../types/client.ts";
import {Scrollbar} from "../../../../components/scrollbar.tsx";
import {RouterLink} from "../../../../components/router-link.tsx";
import {SeverityPill} from "../../../../components/severity-pill.tsx";
import {ClientLocation} from "../../../../types/client-location.ts";

interface SelectClientLocationListTableProps {
  count?: number;
  items?: ClientLocation[];
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

export const SelectClientLocationListTable: FC<SelectClientLocationListTableProps> = (props) => {
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

  return (
    <Box sx={{ position: 'relative' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
              </TableCell>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                Address
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!items || items.length === 0) && [...Array(2)].map((_, rowIndex) => (
                <TableRow key={rowIndex} sx={{px: 2, mx:2}}>
                  <TableCell sx={{pl: 3.5, m:0}}>
                    <Skeleton variant={'rectangular'} width={18} height={18} sx={{borderRadius: 0.75}}  />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                  <TableCell sx={{pl: 2, m:0}}>
                    <Skeleton variant="text" width="70%" height={24} />
                  </TableCell>
                </TableRow>
            ))}
            {items.map((location) => {
              const isSelected = selected.includes(location.id);

              return (
                <TableRow
                  hover
                  key={location.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onDeselectAll?.();
                          onSelectOne?.(location.id);
                        } else {
                          onDeselectOne?.(location.id);
                        }
                      }}
                      value={isSelected}
                    />
                  </TableCell>
                  <TableCell>
                    {location.name}
                  </TableCell>
                  <TableCell>
                    {location.formatted_address}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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

SelectClientLocationListTable.propTypes = {
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
