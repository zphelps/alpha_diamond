import type {FC} from "react";
import {ChangeEvent, FormEvent, useCallback, useRef, useState} from "react";
import PropTypes from "prop-types";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import {
    Box, Button, Chip,
    Divider, FormControl,
    InputAdornment, InputLabel, MenuItem,
    OutlinedInput, Paper, Select, SelectChangeEvent,
    Stack,
    SvgIcon,
    Tab,
    Tabs, TextField,
} from "@mui/material";
import {useUpdateEffect} from "../../hooks/use-update-effect.ts";
import {Trash01} from "@untitled-ui/icons-react";
import {StackProps} from "@mui/material/Stack";
import {_clientTypes} from "../../pages/clients/list.tsx";
import Checkbox from "@mui/material/Checkbox";
import {ArrowDropDown} from "@mui/icons-material";
import {_jobTypes} from "../../pages/jobs/list.tsx";
import {DatePicker} from "@mui/x-date-pickers";

interface Filters {
    query?: string;
    open?: boolean;
    completed?: boolean;
    cancelled?: boolean;
    type?: string[];
}

type TabValue = "all" | "open" | "completed" | "cancelled";

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
        label: "Open",
        value: "open"
    },
    {
        label: "Completed",
        value: "completed"
    },
    {
        label: "Cancelled",
        value: "cancelled"
    },
];

type SortValue = "updatedAt|desc" | "updatedAt|asc" | "totalOrders|desc" | "totalOrders|asc";

interface SortOption {
    label: string;
    value: SortValue;
}

const sortOptions: SortOption[] = [
    {
        label: "Last update (newest)",
        value: "updatedAt|desc"
    },
    {
        label: "Last update (oldest)",
        value: "updatedAt|asc"
    },
    {
        label: "Total orders (highest)",
        value: "totalOrders|desc"
    },
    {
        label: "Total orders (lowest)",
        value: "totalOrders|asc"
    }
];

type SortDir = "asc" | "desc";

interface JobListSearchProps {
    resultsCount: number;
    onFiltersChange?: (filters: Filters) => void;
    onSortChange?: (sort: { sortBy: string; sortDir: SortDir }) => void;
    sortBy?: string;
    sortDir?: SortDir;
}

export const JobListSearch: FC<JobListSearchProps> = (props) => {
    const {resultsCount, onFiltersChange, onSortChange, sortBy, sortDir} = props;
    const queryRef = useRef<HTMLInputElement | null>(null);
    const [currentTab, setCurrentTab] = useState<TabValue>("all");
    const [filters, setFilters] = useState<Filters>({});

    const getStatusLabel = useCallback(
        (): string => {
            if (filters.open) return "Open";
            if (filters.completed) return "Completed";
            if (filters.cancelled) return "Cancelled";
        }, [filters]);

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
                    open: undefined,
                    completed: undefined,
                    cancelled: undefined,
                };

                if (value !== "all") {
                    updatedFilters[value] = true;
                }

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

    const handleSortChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const [sortBy, sortDir] = event.target.value.split("|") as [string, SortDir];

            onSortChange?.({
                sortBy,
                sortDir
            });
        },
        [onSortChange]
    );

    const handleFilterType = useCallback(
        (event: SelectChangeEvent<string[]>) => {
            setFilters((prevState: any) => ({
                ...prevState,
                type: typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
            }));
        },
        [setFilters]
    );

    const handleRemoveStatus = useCallback(
        () => {
            setFilters((prevState: any) => ({
                ...prevState,
                open: undefined,
                completed: undefined,
                cancelled: undefined,
            }));
            setCurrentTab('all');
        },
        [setFilters]
    );

    const handleRemoveRole = useCallback(
        (inputValue: string) => {
            setFilters((prevState: any) => ({
                ...prevState,
                // @ts-ignore
                type: (prevState.type ?? []).filter((item) => {
                    console.log(item, inputValue);
                    return item !== inputValue;
                }),
            }));
        },
        [setFilters]
    );

    const handleClearFilters = useCallback(
        () => {
            setFilters({
                query: undefined,
                open: undefined,
                completed: undefined,
                cancelled: undefined,
                type: undefined,
            });
            setCurrentTab('all');
        }, [setFilters]);
    const hideToolbar = () => {
        return (filters.query !== undefined || filters.query !== '')
            && (filters.type?.length === 0 || filters.type === undefined)
            && (filters.open === undefined || !filters.open)
            && (filters.completed === undefined || !filters.completed)
            && (filters.cancelled === undefined || !filters.cancelled);
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
                <FormControl
                    sx={{
                        flexShrink: 0,
                        width: { xs: 1, md: 200 },
                    }}
                >
                    <InputLabel>Service Type</InputLabel>
                    <Select
                        multiple
                        value={filters.type ?? []}
                        onChange={handleFilterType}
                        input={<OutlinedInput label="Service Type" />}
                        renderValue={(selected) => selected.map((value) => value).join(', ')}
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
                        {_jobTypes.map((option) => (
                            <MenuItem key={option} value={option}>
                                <Checkbox disableRipple size="small" checked={(filters.type ?? []).includes(option)} />
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                {/*<TextField*/}
                {/*    label="Sort By"*/}
                {/*    name="sort"*/}
                {/*    onChange={handleSortChange}*/}
                {/*    select*/}
                {/*    SelectProps={{native: true}}*/}
                {/*    value={`${sortBy}|${sortDir}`}*/}
                {/*>*/}
                {/*    {sortOptions.map((option) => (*/}
                {/*        <option*/}
                {/*            key={option.value}*/}
                {/*            value={option.value}*/}
                {/*        >*/}
                {/*            {option.label}*/}
                {/*        </option>*/}
                {/*    ))}*/}
                {/*</TextField>*/}
            </Stack>
            {!hideToolbar() && <Stack spacing={1.5} sx={{ml: 3, mb: 3}}>
                <Box sx={{typography: "body2"}}>
                    <strong>{resultsCount}</strong>
                    <Box component="span" sx={{color: "text.secondary", ml: 0.25}}>
                        results found
                    </Box>
                </Box>

                <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
                    {(filters.open || filters.completed || filters.cancelled) && (
                        <Block label="Status:">
                            <Chip size="small" label={getStatusLabel()}
                                  onDelete={handleRemoveStatus}/>
                        </Block>
                    )}

                    {!!(filters.type ?? []).length && (
                        <Block label="Role:">
                            {(filters.type ?? []).map((item) => (
                                <Chip key={item} label={item} size="small" onDelete={() => handleRemoveRole(item)}/>
                            ))}
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

JobListSearch.propTypes = {
    onFiltersChange: PropTypes.func,
    onSortChange: PropTypes.func,
    sortBy: PropTypes.string,
    sortDir: PropTypes.oneOf<SortDir>(["asc", "desc"])
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

