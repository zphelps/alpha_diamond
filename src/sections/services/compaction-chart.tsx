import type { FC } from 'react';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import { Box, Card, CardHeader, Divider, IconButton, SvgIcon, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import {Chart} from "../../components/chart.tsx";
import {Bin} from "../../types/bin.ts";

type ChartSeries = { name: string, data: number[] }[];

const labels: string[] = ['Before', 'After'];

const useChartOptions = (bins: Bin[]): ApexOptions => {
    const theme = useTheme();

    return {
        chart: {
            background: 'transparent',
            stacked: false,
            toolbar: {
                show: false
            }
        },
        colors: [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.warning.main
        ],
        dataLabels: {
            enabled: true,
            formatter: function (val, opt) {
                // opt.w.globals.seriesNames[opt.seriesIndex] + ":  " +
                return val + "%  ";
            },
        },
        fill: {
            opacity: 1,
            type: 'solid'
        },
        // labels,
        legend: {
            show: true
        },
        plotOptions: {
            pie: {
                expandOnClick: false
            },
            bar: {
                borderRadius: 8,
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
            show: false
        },
        theme: {
            mode: theme.palette.mode
        },
        tooltip: {
            fillSeriesColor: false
        },
        yaxis: {
            labels: {
                formatter: function (val, opt) {
                    return val + "%  ";
                },
            }
        },
        xaxis: {
            type: 'category',
            categories: bins.map((bin, i) => `Bin #${i + 1}`),
        },
    };
};

interface CompactionChartProps {
    bins: Bin[];
}

export const CompactionChart: FC<CompactionChartProps> = (props) => {
    const { bins } = props;
    const chartOptions = useChartOptions(bins);

    const chartSeries: ChartSeries = [{
        data: bins.map((bin) => bin.initial_fill_level),
        name: 'Before'
    }, {
        data: bins.map((bin) => bin.final_fill_level),
        name: 'After'
    }];

    return (
        <Card>
            <CardHeader
                // action={(
                //     <IconButton>
                //         <SvgIcon>
                //             <DotsHorizontalIcon />
                //         </SvgIcon>
                //     </IconButton>
                // )}
                title="Compaction Statistics"
            />
            <Divider />
            <Box sx={{ p: 2 }}>
                <Chart
                    height={400}
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                />
            </Box>
        </Card>
    );
};
