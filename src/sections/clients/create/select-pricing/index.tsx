import {FC, useEffect, useState} from "react";
import {
    Checkbox,
    Divider, FormControl,
    InputAdornment, InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {ChargeUnit} from "../../../../types/job.ts";
import {ServiceType} from "../../../../types/service.ts";
import {ArrowDropDown} from "@mui/icons-material";
import {_clientTypes} from "../../../../pages/clients/list.tsx";
import GooglePlacesAutocomplete from "../../../../components/google-places-autocomplete.tsx";

interface SelectPricingProps {
    handleMonthlyChargeChange?: (e: never) => void;
    handleOnDemandChargeChange?: (e: never) => void;
    handleHourlyChargeChange?: (e: never) => void;
}

export const SelectPricing: FC<SelectPricingProps> = (props) => {
    const {
        handleMonthlyChargeChange,
        handleOnDemandChargeChange,
        handleHourlyChargeChange,
    } = props;

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 1}}
            >
                Pricing
            </Typography>
            <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{mb: 3}}
            >
                Specify the appropriate pricing for each charge type. You can change these later.
            </Typography>
            <Table sx={{ minWidth: 700 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Charge Type
                        </TableCell>
                        <TableCell align={'right'}>
                            {`Charge  /  Unit`}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {`Monthly Charge`}
                        </TableCell>
                        <TableCell align={'right'}>
                            <OutlinedInput
                                onChange={handleMonthlyChargeChange}
                                sx={{pr: 0, mr: 0, width: 235}}
                                type={"number"}
                                startAdornment={
                                    <InputAdornment position={"start"}>
                                        <Typography variant={"body1"}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position={"end"} sx={{p:0, m:0}}>
                                        <Typography variant={"body1"} sx={{mr: 2.5}}>/ month</Typography>
                                    </InputAdornment>
                                }
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            {`On-Demand Charge`}
                        </TableCell>
                        <TableCell align={'right'}>
                            <OutlinedInput
                                onChange={handleOnDemandChargeChange}
                                sx={{pr: 0, mr: 0, width: 235}}
                                type={"number"}
                                startAdornment={
                                    <InputAdornment position={"start"}>
                                        <Typography variant={"body1"}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position={"end"} sx={{p:0, m:0}}>
                                        <Typography variant={"body1"} sx={{mr: 2.5}}>/ bin</Typography>
                                    </InputAdornment>
                                }
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            {`Hourly Charge`}
                        </TableCell>
                        <TableCell align={'right'}>
                            <OutlinedInput
                                onChange={handleHourlyChargeChange}
                                sx={{pr: 0, mr: 0, width: 235}}
                                type={"number"}
                                startAdornment={
                                    <InputAdornment position={"start"}>
                                        <Typography variant={"body1"}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position={"end"} sx={{p:0, m:0}}>
                                        <Typography variant={"body1"} sx={{mr: 2.5}}>/ hour</Typography>
                                    </InputAdornment>
                                }
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Divider sx={{my: 3}}/>
        </Stack>
    );
};
