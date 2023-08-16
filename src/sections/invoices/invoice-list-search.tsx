import type {FC} from "react";
import {FormEvent, useCallback, useRef, useState} from "react";
import PropTypes from "prop-types";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import {
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    OutlinedInput,
    Paper,
    SelectChangeEvent,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import {useUpdateEffect} from "../../hooks/use-update-effect.ts";
import {Trash01} from "@untitled-ui/icons-react";
import {StackProps} from "@mui/material/Stack";
import {DatePicker} from "@mui/x-date-pickers";
import {InvoiceStatus} from "../../types/invoice.ts";
import {format} from "date-fns";

interface Filters {
    endDate?: Date;
    query?: string;
    startDate?: Date;
    status?: InvoiceStatus;
}

type TabValue = "all" | "paid" | "pending" | "cancelled" | "draft";

interface TabOption {
    label: string;
    value: TabValue;
}

const tabs: TabOption[] = [
    {
        label: "All",
        value: "all"
    },
    {
        label: "Paid",
        value: "paid"
    },
    {
        label: "Pending",
        value: "pending"
    },
    {
        label: "Cancelled",
        value: "cancelled"
    },
    {
        label: "Draft",
        value: "draft"
    }
];

interface InvoiceListSearchProps {
    resultsCount: number;
    onFiltersChange?: (filters: Filters) => void;
}

export const InvoiceListSearch: FC<InvoiceListSearchProps> = (props) => {
    const {resultsCount, onFiltersChange} = props;
    const queryRef = useRef<HTMLInputElement | null>(null);
    const [currentTab, setCurrentTab] = useState<TabValue>("all");
    const [filters, setFilters] = useState<Filters>({});

    const handleFiltersUpdate = useCallback(
        () => {
            onFiltersChange?.(filters);
        },
        [filters, onFiltersChange]
    );

    useUpdateEffect(
        () => {
            handleFiltersUpdate();
        },
        [filters, handleFiltersUpdate]
    );

    const handleTabsChange = useCallback(
        // @ts-ignore
        (event: any, value: TabValue): void => {
            setCurrentTab(value);
            setFilters((prevState: any) => {
                const updatedFilters: Filters = {
                    ...prevState,
                    status: value === "all" ? undefined : value,
                };

                return updatedFilters;
            });
        },
        []
    );

    const handleQueryChange = useCallback(
        (event: FormEvent<HTMLFormElement>): void => {
            event.preventDefault();
            setFilters((prevState: any) => ({
                ...prevState,
                query: queryRef.current?.value
            }));
        },
        []
    );

    const handleStartDateChange = useCallback(
        (date: Date | null): void => {
            const newFilters: Filters = {
                ...filters,
                startDate: date || undefined
            };

            // Prevent end date to be before start date
            if (newFilters.endDate && date && date > newFilters.endDate) {
                newFilters.endDate = date;
            }

            setFilters(newFilters);
        },
        [filters, onFiltersChange]
    );

    const handleEndDateChange = useCallback(
        (date: Date | null): void => {
            const newFilters: Filters = {
                ...filters,
                endDate: date || undefined
            };

            // Prevent start date to be after end date
            if (newFilters.startDate && date && date < newFilters.startDate) {
                newFilters.startDate = date;
            }

            setFilters(newFilters);
        },
        [filters, onFiltersChange]
    );

    const handleRemoveStartDate = useCallback(
        () => {
            setFilters((prevState: any) => ({
                ...prevState,
                startDate: undefined,
            }));
        },
        [setFilters]
    );

    const handleRemoveEndDate = useCallback(
        () => {
            setFilters((prevState: any) => ({
                ...prevState,
                endDate: undefined,
            }));
        },
        [setFilters]
    );

    const handleRemoveStatus = useCallback(
        () => {
            setFilters((prevState: any) => ({
                ...prevState,
                status: undefined,
            }));
            setCurrentTab('all');
        },
        [setFilters]
    );

    const handleClearFilters = useCallback(
        () => {
            setFilters({
                query: undefined,
                status: undefined,
                startDate: undefined,
                endDate: undefined,
            });
            setCurrentTab('all');
        }, [setFilters]);
    const hideToolbar = () => {
        return (filters.query !== undefined || filters.query !== '')
            && (filters.startDate === undefined || !filters.startDate)
            && (filters.endDate === undefined || !filters.endDate)
            && (filters.status === undefined || !filters.status);
    }

    return (
        <>
            <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                sx={{px: 3}}
                textColor="primary"
                value={currentTab}
                variant="scrollable"
            >
                {tabs.map((tab) => (
                    <Tab
                        sx={{fontWeight: 600}}
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                    />
                ))}
            </Tabs>
            <Divider/>
            <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                spacing={2}
                sx={{p: 2}}
            >
                <DatePicker
                    format={"dd/MM/yyyy"}
                    label="From"
                    onChange={handleStartDateChange}
                    slots={{
                        textField: TextField
                    }}
                    value={filters.startDate || null}
                />
                <DatePicker
                    format={"dd/MM/yyyy"}
                    label="To"
                    onChange={handleEndDateChange}
                    slots={{
                        textField: TextField
                    }}
                    value={filters.endDate || null}
                />
                <Box
                    component="form"
                    onChange={handleQueryChange}
                    onSubmit={handleQueryChange}
                    sx={{flexGrow: 1}}
                >
                    <OutlinedInput
                        defaultValue=""
                        fullWidth
                        inputProps={{ref: queryRef}}
                        placeholder="Search by client name"
                        startAdornment={(
                            <InputAdornment position="start">
                                <SvgIcon>
                                    <SearchMdIcon/>
                                </SvgIcon>
                            </InputAdornment>
                        )}
                    />
                </Box>
            </Stack>
            {!hideToolbar() && <Stack spacing={1.5} sx={{ml: 3, mb: 3}}>
                <Box sx={{typography: "body2"}}>
                    <strong>{resultsCount}</strong>
                    <Box component="span" sx={{color: "text.secondary", ml: 0.25}}>
                        results found
                    </Box>
                </Box>

                <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
                    {(filters.status === InvoiceStatus.PAID
                        || filters.status === InvoiceStatus.PENDING
                        || filters.status === InvoiceStatus.CANCELLED
                        || filters.status === InvoiceStatus.DRAFT) && (
                        <Block label="Status:">
                            <Chip size="small" label={filters.status}
                                  onDelete={handleRemoveStatus}/>
                        </Block>
                    )}

                    {(filters.startDate) && (
                        <Block label="Issued After:">
                            <Chip size="small" label={format(filters.startDate || new Date(), 'dd/MM/yyyy')}
                                  onDelete={handleRemoveStartDate}/>
                        </Block>
                    )}

                    {(filters.endDate) && (
                        <Block label="Issued Before:">
                            <Chip size="small" label={format(filters.endDate || new Date(), 'dd/MM/yyyy')}
                                  onDelete={handleRemoveEndDate}/>
                        </Block>
                    )}

                    <Button
                        color="error"
                        onClick={handleClearFilters}
                        startIcon={<Trash01/>}
                    >
                        Clear
                    </Button>
                </Stack>
            </Stack>}
        </>
    );
};

InvoiceListSearch.propTypes = {
    onFiltersChange: PropTypes.func,
};

type BlockProps = StackProps & {
    label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
    return (
        <Stack
            component={Paper}
            variant="outlined"
            spacing={1}
            direction="row"
            sx={{
                p: 1,
                borderRadius: 1,
                overflow: 'hidden',
                borderStyle: 'dashed',
                ...sx,
            }}
            {...other}
        >
            <Box component="span" sx={{ typography: 'subtitle2' }}>
                {label}
            </Box>

            <Stack spacing={1} direction="row" flexWrap="wrap">
                {children}
            </Stack>
        </Stack>
    );
}

