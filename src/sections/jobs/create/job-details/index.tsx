import {ChangeEvent, FC, useCallback, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardContent, Checkbox,
    Divider,
    FormControl,
    Grid, InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, TextField,
    Typography
} from "@mui/material";
import {AddBusiness, AddBusinessOutlined, AdsClick, Repeat} from "@mui/icons-material";
import Skeleton from "@mui/material/Skeleton";
import {addMinutes, format} from "date-fns";
import {PriceModel} from "../../../../types/job.ts";

interface JobDetailsProps {
    price_model: string;
    price: number;
    recurring_charge: number;
    on_demand_charge: number;
    setFieldValue: (field: string, value: any) => void;
    handleSummaryChange: (e: never) => void;
    handleDriverNotesChange: (e: never) => void;
}

export const JobDetails: FC<JobDetailsProps> = (props) => {
    const {recurring_charge, on_demand_charge, price_model, price, setFieldValue, handleSummaryChange, handleDriverNotesChange} = props;

    const [checked, setChecked] = useState(false);

    const getPriceDescription = () => {
        if (price_model === PriceModel.MONTHLY) {
            return `Monthly Charge`;
        } else if (price_model === PriceModel.ON_DEMAND) {
            return `On-Demand Charge`;
        } else if (price_model === PriceModel.ROUTED_ON_DEMAND) {
            return `Charge Per Service Performed`;
        } else if (price_model === PriceModel.VALUE) {
            return `Charge Per Service Performed`;
        }
    }

    useEffect(() => {
        if (price_model === PriceModel.VALUE) {
            setFieldValue('price', null);
        } else if (price_model === PriceModel.MONTHLY) {
            setFieldValue('price', recurring_charge);
        } else if (price_model === PriceModel.ON_DEMAND) {
            setFieldValue('price', on_demand_charge);
        } else if (price_model === PriceModel.ROUTED_ON_DEMAND) {
            setFieldValue('price', on_demand_charge);
        }
    }, [on_demand_charge, price_model, recurring_charge])

    return (
        <Stack>
            <Typography
                variant={"h6"}
                sx={{mb: 2}}
            >
                Details
            </Typography>
            <Stack direction={'row'} spacing={2}>
                <TextField
                    required
                    fullWidth
                    multiline
                    minRows={5}
                    onChange={handleSummaryChange}
                    label={"Job Summary"}
                />
                <TextField
                    required
                    fullWidth
                    multiline
                    minRows={5}
                    onChange={handleDriverNotesChange}
                    label={"Driver Instructions"}
                />
            </Stack>
            <Divider sx={{my: 3}}/>
            <Typography
                variant={"h6"}
                sx={{mb: 2}}
            >
                Pricing
            </Typography>
            <Table sx={{ minWidth: 700 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Description
                        </TableCell>
                        <TableCell align={'right'}>
                            Price
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {getPriceDescription()}
                        </TableCell>
                        <TableCell align={'right'}>
                            {price_model !== PriceModel.VALUE && price && <OutlinedInput
                                value={price}
                                onChange={(e) => setFieldValue("price", parseInt(e.target.value))}
                                sx={{width: 175}}
                                type={"number"}
                                startAdornment={
                                    <InputAdornment position={"start"}>
                                        <Typography variant={"body1"}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position={"end"}>
                                        <Typography variant={"body2"}>/ month</Typography>
                                    </InputAdornment>
                                }
                            />}
                            {price_model === PriceModel.VALUE && <Typography
                                sx={{py: 2}}
                                variant={"body2"}
                            >
                                CLIENT HAUL RATE * PERCENT COMPACTION
                            </Typography>}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {price_model !== PriceModel.ON_DEMAND && <Stack direction={"row"} alignItems={"center"}>
                <Checkbox
                    value={checked}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setChecked(true);
                            setFieldValue("price_model", PriceModel.VALUE);
                        } else {
                            setChecked(false);
                            setFieldValue("price_model", PriceModel.MONTHLY);
                        }
                    }}
                />
                <Typography
                    variant={"body2"}
                >
                    Value-Based Pricing
                </Typography>
            </Stack>}
        </Stack>
    );
};
