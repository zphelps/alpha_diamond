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
    Tabs,
} from "@mui/material";
import {useUpdateEffect} from "../../hooks/use-update-effect.ts";
import {Trash01} from "@untitled-ui/icons-react";
import {StackProps} from "@mui/material/Stack";
import {_clientTypes} from "../../pages/clients/list.tsx";
import Checkbox from "@mui/material/Checkbox";
import {ArrowDropDown} from "@mui/icons-material";

interface Filters {
    query?: string;
    active?: boolean;
    inactive?: boolean;
    type?: string[];
}

type TabValue = "all" | "active" | "inactive";

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
        label: "Active",
        value: "active"
    },
    {
        label: "Inactive",
        value: "inactive"
    },
];

interface ClientListSearchProps {
    resultsCount: number;
    onFiltersChange?: (filters: Filters) => void;
}

export const ClientListSearch: FC<ClientListSearchProps> = (props) => {
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
                    active: undefined,
                    inactive: undefined,
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

    const handleRemoveQuery = useCallback(
        () => {
            setFilters((prevState: any) => ({
                ...prevState,
                query: undefined
            }));
            queryRef.current.value = "";
            queryRef.current?.focus();
        }, []);

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
                active: undefined,
                inactive: undefined,
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
                active: undefined,
                inactive: undefined,
                type: undefined,
            });
            queryRef.current.value = "";
            queryRef.current?.focus();
            setCurrentTab('all');
        }, [setFilters]);
    const hideToolbar = () => {
        return (filters.query === undefined || filters.query === '')
            && (filters.type?.length === 0 || filters.type === undefined)
            && (filters.active === undefined || !filters.active)
            && (filters.inactive === undefined || !filters.inactive);
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
                sx={{p: 3}}
            >
                <FormControl
                    sx={{
                        flexShrink: 0,
                        width: { xs: 1, md: 200 },
                    }}
                >
                    <InputLabel>Client Type</InputLabel>
                    <Select
                        multiple
                        value={filters.type ?? []}
                        onChange={handleFilterType}
                        input={<OutlinedInput label="Role" />}
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
                        {_clientTypes.map((option) => (
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
                        placeholder="Search clients"
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
                    {(filters.active || filters.inactive) && (
                        <Block label="Status:">
                            <Chip size="small" label={filters.active ? "Active" : "Inactive"}
                                  onDelete={handleRemoveStatus}/>
                        </Block>
                    )}

                    {(filters.query && filters.query.length > 0) && (
                        <Block label="Search:">
                            <Chip size="small" label={filters.query}
                                  onDelete={handleRemoveQuery}/>
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

ClientListSearch.propTypes = {
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

