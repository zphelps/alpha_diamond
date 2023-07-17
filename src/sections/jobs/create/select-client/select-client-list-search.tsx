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
import {Trash01} from "@untitled-ui/icons-react";
import {StackProps} from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import {ArrowDropDown} from "@mui/icons-material";
import {useUpdateEffect} from "../../../../hooks/use-update-effect.ts";
import {_clientTypes} from "./index.tsx";

interface Filters {
    query?: string;
    active?: boolean;
    inactive?: boolean;
    type?: string[];
}
interface ClientListSearchProps {
    resultsCount: number;
    onFiltersChange?: (filters: Filters) => void;
}

export const SelectClientListSearch: FC<ClientListSearchProps> = (props) => {
    const {resultsCount, onFiltersChange} = props;
    const queryRef = useRef<HTMLInputElement | null>(null);
    const [filters, setFilters] = useState<Filters>({
        active: true,
    });

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

    const handleQueryChange = useCallback(
        (event: FormEvent<HTMLFormElement>): void => {
            event.preventDefault();
            setFilters((prevState: any) => ({
                ...prevState,
                query: queryRef.current?.value,
                active: true,
            }));
        },
        []
    );

    const handleFilterType = useCallback(
        (event: SelectChangeEvent<string[]>) => {
            setFilters((prevState: any) => ({
                ...prevState,
                type: typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value,
                active: true,
            }));
        },
        [setFilters]
    );

    const handleRemoveType = useCallback(
        (inputValue: string) => {
            setFilters((prevState: any) => ({
                ...prevState,
                // @ts-ignore
                type: (prevState.type ?? []).filter((item) => {
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
                active: true,
                type: undefined,
            });
        }, [setFilters]);
    const hideToolbar = () => {
        return (filters.query !== undefined || filters.query !== '')
            && (filters.type?.length === 0 || filters.type === undefined)
    }

    return (
        <>
            <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                spacing={2}
                sx={{mb: 2}}
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
            </Stack>
            {!hideToolbar() && <Stack spacing={1.5} sx={{ml: 3, mb: 3}}>
                <Box sx={{typography: "body2"}}>
                    <strong>{resultsCount}</strong>
                    <Box component="span" sx={{color: "text.secondary", ml: 0.25}}>
                        results found
                    </Box>
                </Box>

                <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
                    {!!(filters.type ?? []).length && (
                        <Block label="Client Type:">
                            {(filters.type ?? []).map((item) => (
                                <Chip key={item} label={item} size="small" onDelete={() => handleRemoveType(item)}/>
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

SelectClientListSearch.propTypes = {
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

