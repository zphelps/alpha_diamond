import type { FC } from 'react';
import type { ApexOptions } from 'apexcharts';
import numeral from 'numeral';
import TrendUp02Icon from '@untitled-ui/icons-react/build/esm/TrendUp02';
import TrendDown02Icon from '@untitled-ui/icons-react/build/esm/TrendDown02';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    Stack,
    SvgIcon,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {Chart} from "../../../../components/chart.tsx";
import {ClientLocation} from "../../../../types/client-location.ts";

type ChartSeries = number[];

const useChartOptions = (labels): ApexOptions => {
    const theme = useTheme();

    return {
        chart: {
            background: 'transparent'
        },
        colors: [
            '#2196F3', '#4CAF50', '#FFC107', '#9C27B0', '#3F51B5', '#2196F3',
            '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
            '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
            '#607D8B'
        ],
        dataLabels: {
            enabled: false
        },
        grid: {
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        },
        labels,
        legend: {
            show: false
        },
        plotOptions: {
            pie: {
                expandOnClick: false
            },
            radialBar: {
                dataLabels: {
                    show: false
                },
                hollow: {
                    size: '100%'
                }
            }
        },
        states: {
            active: {
                filter: {
                    type: 'none'
                }
            },
            hover: {
                filter: {
                    type: 'none'
                }
            }
        },
        stroke: {
            width: 0
        },
        theme: {
            mode: theme.palette.mode
        },
        tooltip: {
            fillSeriesColor: false
        }
    };
};

export const ClientRevenueByLocation = (props) => {
    const {locations} = props;
    const chartSeries: ChartSeries = locations.map((location: ClientLocation) => location.total_revenue);

    const labels: string[] = locations.map((location: ClientLocation) => location.name);

    const chartOptions = useChartOptions(labels);

    const totalAmount = chartSeries.reduce((acc, item) => acc += item, 0);
    const formattedTotalAmount = numeral(totalAmount).format('$0,0.00');


    return (
        <Card>
            <CardHeader
                title="Total Revenue"
                subheader="Across all locations"
            />
            <CardContent>
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    spacing={3}
                >
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            height: 200,
                            justifyContent: 'center',
                            width: 200
                        }}
                    >
                        <Chart
                            height={200}
                            options={chartOptions}
                            series={chartSeries}
                            type="donut"
                        />
                    </Box>
                    <Stack
                        spacing={4}
                        sx={{ flexGrow: 1 }}
                    >
                        <Stack spacing={1}>
                            <Typography
                                color="text.secondary"
                                variant="overline"
                            >
                                Total balance
                            </Typography>
                            <Typography variant="h4">
                                {formattedTotalAmount}
                            </Typography>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography
                                color="text.secondary"
                                variant="overline"
                            >
                                Locations
                            </Typography>
                            <Stack
                                component="ul"
                                spacing={1}
                                sx={{
                                    listStyle: 'none',
                                    m: 0,
                                    p: 0
                                }}
                            >
                                {chartSeries.map((item, index) => {
                                    const amount = numeral(item).format('$0,0.00');

                                    return (
                                        <Stack
                                            alignItems="center"
                                            component="li"
                                            direction="row"
                                            key={index}
                                            spacing={2}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: chartOptions.colors![index],
                                                    borderRadius: '4px',
                                                    height: 16,
                                                    width: 16
                                                }}
                                            />
                                            <Typography
                                                sx={{ flexGrow: 1 }}
                                                variant="subtitle2"
                                            >
                                                {labels[index]}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="subtitle2"
                                            >
                                                {amount}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};
