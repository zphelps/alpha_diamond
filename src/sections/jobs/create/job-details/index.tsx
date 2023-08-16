import {FC, useEffect, useState} from "react";
import {
    Checkbox,
    Divider,
    InputAdornment,
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

interface JobDetailsProps {
    service_type: string;
    client_default_monthly_charge: number;
    client_default_on_demand_charge: number;
    default_hourly_charge: number;
    charge_unit: string;
    charge_per_unit: number;
    setFieldValue: (field: string, value: any) => void;
    handleSummaryChange: (e: never) => void;
    handleDriverNotesChange: (e: never) => void;
}

export const JobDetails: FC<JobDetailsProps> = (props) => {
    const {
        charge_unit,
        charge_per_unit,
        client_default_monthly_charge,
        default_hourly_charge,
        service_type,
        client_default_on_demand_charge,
        setFieldValue,
        handleSummaryChange,
        handleDriverNotesChange
    } = props;


    const _service_charge_units = [
        ChargeUnit.HOUR,
        ChargeUnit.BIN,
        ChargeUnit.MONTH,
        ChargeUnit.PERCENT_COMPACTED,
    ];

    const getChargeDescription = () => {
        if(charge_unit === ChargeUnit.HOUR) {
            return `Charge Per Hour`;
        } else if (charge_unit === ChargeUnit.BIN) {
            return `Charge Per Bin Smashed`;
        } else if (charge_unit === ChargeUnit.MONTH) {
            return `Monthly Flat Fee`;
        } else if (charge_unit === ChargeUnit.PERCENT_COMPACTED) {
            return `Value Based Pricing`;
        }
    }

    const [price, setPrice] = useState(null);

    useEffect(() => {
        if (service_type === ServiceType.RECURRING) {
            setFieldValue("charge_unit", ChargeUnit.MONTH);
            setFieldValue("charge_per_unit", client_default_monthly_charge);
        } else if (service_type === ServiceType.ON_DEMAND) {
            setFieldValue("charge_unit", ChargeUnit.BIN);
            setFieldValue("charge_per_unit", client_default_on_demand_charge);
        }
    }, [])

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
                Charges
            </Typography>
            <Table sx={{ minWidth: 700 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Description
                        </TableCell>
                        <TableCell align={'right'}>
                            {`Charge  /  Unit`}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {getChargeDescription()}
                        </TableCell>
                        <TableCell align={'right'}>
                            <OutlinedInput
                                value={charge_per_unit ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                        setFieldValue('charge_per_unit', 0);
                                    } else {
                                        setFieldValue('charge_per_unit', Number(val.startsWith('0') ? val.slice(1) : val) ?? 0);
                                    }
                                }}
                                sx={{pr: 0, mr: 0, width: 235}}
                                type={"number"}
                                startAdornment={
                                    <InputAdornment position={"start"}>
                                        <Typography variant={"body1"}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position={"end"} sx={{p:0, m:0}}>
                                        <Typography variant={"body1"} sx={{mr: 2.5}}>/</Typography>
                                        <Select
                                            value={charge_unit ?? ''}
                                            onChange={(e) => {
                                                setFieldValue("charge_unit", e.target.value);
                                                if (e.target.value === ChargeUnit.MONTH) {
                                                    setFieldValue("charge_per_unit", client_default_monthly_charge);
                                                } else if (e.target.value === ChargeUnit.HOUR) {
                                                    setFieldValue("charge_per_unit", default_hourly_charge);
                                                } else if (e.target.value === ChargeUnit.BIN) {
                                                    setFieldValue("charge_per_unit", client_default_on_demand_charge);
                                                }
                                            }}
                                            variant={"standard"}
                                            sx={{
                                                ml: 1,
                                                m: 0,
                                                p: 0,
                                                mt: 0.5,
                                                // width: 118,
                                            }}
                                            disableUnderline
                                        >
                                            {_service_charge_units.map((unit) => (
                                                <MenuItem
                                                    sx={{
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        m: 0,
                                                    }}
                                                    key={unit}
                                                    value={unit}>
                                                    {unit}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </InputAdornment>
                                }
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Stack>
    );
};



// interface JobDetailsProps {
//     price_model: string;
//     service_type: string;
//     client_default_monthly_charge: number;
//     client_default_on_demand_charge: number;
//     default_hourly_charge: number;
//     setFieldValue: (field: string, value: any) => void;
//     handleSummaryChange: (e: never) => void;
//     handleDriverNotesChange: (e: never) => void;
// }
//
// export const JobDetails: FC<JobDetailsProps> = (props) => {
//     const {client_default_monthly_charge, default_hourly_charge, service_type, client_default_on_demand_charge, price_model, setFieldValue, handleSummaryChange, handleDriverNotesChange} = props;
//
//     const getPriceDescription = () => {
//         if (price_model === PriceModel.MONTHLY_FLAT) {
//             return `Monthly Flat Fee`;
//         } else if (price_model === PriceModel.PER_SMASH_FLAT) {
//             return `Flat Fee`;
//         } else if (price_model === PriceModel.PER_SMASH_VALUE) {
//             return `Value-Based Pricing`;
//         } else if (price_model === PriceModel.HOURLY) {
//             return `Charge Per Hour`;
//         } else if (price_model === PriceModel.DEMO) {
//             return `Demo`;
//         } else if (price_model === PriceModel.TRIAL) {
//             return `Trial`;
//         }
//     }
//
//     const [price, setPrice] = useState(null);
//
//     useEffect(() => {
//         if (price_model === PriceModel.PER_SMASH_VALUE) {
//             setPrice(null);
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.PER_SMASH_FLAT) {
//             setPrice(client_default_on_demand_charge);
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", client_default_on_demand_charge);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.MONTHLY_FLAT) {
//             setPrice(client_default_monthly_charge);
//             setFieldValue("monthly_charge", client_default_monthly_charge);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.HOURLY) {
//             setPrice(default_hourly_charge);
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", default_hourly_charge);
//         } else if (price_model === PriceModel.DEMO) {
//             setPrice(0);
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.TRIAL) {
//             setPrice(0);
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         }
//     }, [client_default_on_demand_charge, price_model, client_default_monthly_charge, default_hourly_charge])
//
//     useEffect(() => {
//         if (price_model === PriceModel.PER_SMASH_VALUE) {
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.PER_SMASH_FLAT) {
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", price);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.MONTHLY_FLAT) {
//             setFieldValue("monthly_charge", price);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.HOURLY) {
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", price);
//         } else if (price_model === PriceModel.DEMO) {
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         } else if (price_model === PriceModel.TRIAL) {
//             setFieldValue("monthly_charge", null);
//             setFieldValue("on_demand_charge", null);
//             setFieldValue("hourly_charge", null);
//         }
//     }, [price])
//
//     return (
//         <Stack>
//             <Typography
//                 variant={"h6"}
//                 sx={{mb: 2}}
//             >
//                 Details
//             </Typography>
//             <Stack direction={'row'} spacing={2}>
//                 <TextField
//                     required
//                     fullWidth
//                     multiline
//                     minRows={5}
//                     onChange={handleSummaryChange}
//                     label={"Job Summary"}
//                 />
//                 <TextField
//                     required
//                     fullWidth
//                     multiline
//                     minRows={5}
//                     onChange={handleDriverNotesChange}
//                     label={"Driver Instructions"}
//                 />
//             </Stack>
//             <Divider sx={{my: 3}}/>
//             <Typography
//                 variant={"h6"}
//                 sx={{mb: 2}}
//             >
//                 Pricing
//             </Typography>
//             <Table sx={{ minWidth: 700 }}>
//                 <TableHead>
//                     <TableRow>
//                         <TableCell>
//                             Description
//                         </TableCell>
//                         <TableCell align={'right'}>
//                             Price
//                         </TableCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     <TableRow>
//                         <TableCell>
//                             {getPriceDescription()}
//                         </TableCell>
//                         <TableCell align={'right'}>
//                             {price_model !== PriceModel.PER_SMASH_VALUE && price >= 0 && <OutlinedInput
//                                 value={price ?? ''}
//                                 // onChange={(e) => setPrice(parseInt(e.target.value === "" ? "0" : e.target.value))}
//                                 onChange={(e) => {
//                                     const val = e.target.value;
//                                     if (val === "") {
//                                         setPrice(0);
//                                     } else {
//                                         setPrice(Number(val.startsWith('0') ? val.slice(1) : val) ?? 0);
//                                     }
//                                 }}
//
//                                 sx={{width: 175}}
//                                 type={"number"}
//                                 startAdornment={
//                                     <InputAdornment position={"start"}>
//                                         <Typography variant={"body1"}>$</Typography>
//                                     </InputAdornment>
//                                 }
//                                 endAdornment={
//                                     <InputAdornment position={"end"}>
//                                         <Typography variant={"body2"}>/ {price_model === PriceModel.MONTHLY_FLAT
//                                             ? 'month'
//                                             : price_model === PriceModel.HOURLY ? 'hour' : 'smash'}</Typography>
//                                     </InputAdornment>
//                                 }
//                             />}
//                             {price_model === PriceModel.PER_SMASH_VALUE && <Typography
//                                 sx={{py: 2}}
//                                 variant={"body2"}
//                             >
//                                 CLIENT HAUL RATE * BIN COMPACTION PERCENTAGE
//                             </Typography>}
//                         </TableCell>
//                     </TableRow>
//                 </TableBody>
//             </Table>
//             {service_type === ServiceType.RECURRING && <Stack direction={"row"} alignItems={"center"}>
//                 <Checkbox
//                     // value={price_model === PriceModel.PER_SMASH_FLAT}
//                     checked={price_model === PriceModel.PER_SMASH_FLAT}
//                     onChange={(e) => {
//                         if (e.target.checked) {
//                             setFieldValue("price_model", PriceModel.PER_SMASH_FLAT);
//                         } else {
//                             setFieldValue("price_model", PriceModel.MONTHLY_FLAT);
//                         }
//                     }}
//                 />
//                 <Typography
//                     variant={"body2"}
//                 >
//                     Flat fee per smash
//                 </Typography>
//             </Stack>}
//             {service_type === ServiceType.ON_DEMAND && <Stack direction={"row"} alignItems={"center"}>
//                 <Checkbox
//                     checked={price_model === PriceModel.HOURLY}
//                     onChange={(e) => {
//                         if (e.target.checked) {
//                             setFieldValue("price_model", PriceModel.HOURLY);
//                         } else {
//                             setFieldValue("price_model", PriceModel.PER_SMASH_FLAT);
//                         }
//                     }}
//                 />
//                 <Typography
//                     variant={"body2"}
//                 >
//                     Charge hourly
//                 </Typography>
//             </Stack>}
//             {(service_type === ServiceType.RECURRING || service_type === ServiceType.ON_DEMAND) && <Stack direction={"row"} alignItems={"center"}>
//                 <Checkbox
//                     // value={price_model === PriceModel.PER_SMASH_VALUE}
//                     checked={price_model === PriceModel.PER_SMASH_VALUE}
//                     onChange={(e) => {
//                         if (e.target.checked) {
//                             setFieldValue("price_model", PriceModel.PER_SMASH_VALUE);
//                         } else {
//                             setFieldValue("price_model", service_type === ServiceType.RECURRING ? PriceModel.MONTHLY_FLAT : PriceModel.PER_SMASH_FLAT);
//                         }
//                     }}
//                 />
//                 <Typography
//                     variant={"body2"}
//                 >
//                     Value based pricing
//                 </Typography>
//             </Stack>}
//         </Stack>
//     );
// };
