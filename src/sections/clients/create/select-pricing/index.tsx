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
import {CreateClientFormValues} from "../../../../pages/clients/create.tsx";

interface SelectPricingProps {
    values: CreateClientFormValues;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

export const SelectPricing: FC<SelectPricingProps> = (props) => {
    const {
        values,
        setFieldValue
    } = props;

    const handleMonthlyChargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === "") {
            setFieldValue("default_monthly_charge", null);
            return;
        }
        setFieldValue("default_monthly_charge", Number(event.target.value));
    }

    const handleHourlyChargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === "") {
            setFieldValue("default_hourly_charge", null);
            return;
        }
        setFieldValue("default_hourly_charge", Number(event.target.value));
    }

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
                Specify the appropriate pricing for each type of charge. You can change these later.
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
