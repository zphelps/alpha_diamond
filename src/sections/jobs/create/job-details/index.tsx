import {ChangeEvent, FC, useState} from "react";
import {
    Button,
    Card,
    CardContent, Checkbox,
    Divider,
    FormControl,
    Grid, InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Typography
} from "@mui/material";
import {AddBusiness, AddBusinessOutlined, AdsClick, Repeat} from "@mui/icons-material";
import Skeleton from "@mui/material/Skeleton";

interface JobDetailsProps {
    description: string;
    price: number;
    handlePriceChange: (e: never) => void;
    handleSummaryChange: (e: never) => void;
    handleDriverNotesChange: (e: never) => void;
}

export const JobDetails: FC<JobDetailsProps> = (props) => {
    const {description, price, handlePriceChange, handleSummaryChange, handleDriverNotesChange} = props;

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
                            {description}
                        </TableCell>
                        <TableCell align={'right'}>
                            <OutlinedInput
                                value={price}
                                onChange={handlePriceChange}
                                sx={{width: 175}}
                                type={'number'}
                                startAdornment={
                                    <InputAdornment position={'start'}>
                                        <Typography variant={'body1'}>$</Typography>
                                    </InputAdornment>
                                }
                                endAdornment={
                                <InputAdornment position={'end'}>
                                    <Typography variant={'body2'}>/ month</Typography>
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
