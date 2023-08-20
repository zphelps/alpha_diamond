import {FC} from "react";
import {Button, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import {AddBusiness, AddBusinessOutlined, AdsClick, PendingActionsOutlined, Repeat} from "@mui/icons-material";

interface SelectServiceTypeProps {
    serviceType: string;
    setFieldValue: (field: string, value: any) => void;
}
export const SelectServiceType: FC<SelectServiceTypeProps> = (props) => {
    const {serviceType, setFieldValue} = props;

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 4}}
            >
                Select Service Type
            </Typography>
            <Stack direction={'row'} sx={{mb: 3}} spacing={2}>
                <Button
                    onClick={() => {
                        setFieldValue('status', 'open');
                        setFieldValue('service_type', 'Recurring')
                        setFieldValue('timestamp', null)
                        setFieldValue('days_of_week', [1]);
                        setFieldValue('services_per_week', 1);
                    }}
                    variant={'outlined'}
                    sx={{
                        width: '100%',
                        height: '120px',
                        color: serviceType === 'Recurring' ? 'primary' : 'black',
                        borderColor: serviceType === 'Recurring' ? 'primary' : 'text.secondary',
                        borderWidth: serviceType === 'Recurring' ? 4 : 1,
                    }}
                >
                    <Stack direction={'row'} alignItems={'center'}>
                        <Repeat fontSize={'large'} sx={{mr: 2}}/>
                        <Typography variant={'h6'}>
                            Recurring
                        </Typography>
                    </Stack>
                </Button>
                <Button
                    variant={'outlined'}
                    onClick={() => {
                        setFieldValue('status', 'scheduled');
                        setFieldValue('service_type', 'On-Demand');
                        setFieldValue('timestamp', new Date().toISOString())
                        setFieldValue('days_of_week', null);
                        setFieldValue('services_per_week', null);
                    }}
                    sx={{
                        width: '100%',
                        height: '120px',
                        color: serviceType === 'On-Demand' ? 'primary' : 'black',
                        borderColor: serviceType === 'On-Demand' ? 'primary' : 'text.secondary',
                        borderWidth: serviceType === 'On-Demand' ? 4 : 1,
                    }}
                >
                    <Stack direction={'row'} alignItems={'center'}>
                        <AdsClick fontSize={'large'} sx={{mr: 2}}/>
                        <Typography variant={'h6'}>
                            On-Demand
                        </Typography>
                    </Stack>
                </Button>
                <Button
                    disabled
                    onClick={() => {
                        setFieldValue('status', 'scheduled');
                        setFieldValue('service_type', 'Demo')
                        setFieldValue('days_of_week', null);
                        setFieldValue('services_per_week', null);
                    }}
                    variant={'outlined'}
                    sx={{
                        width: '100%',
                        height: '120px',
                        color: serviceType === 'Demo' ? 'primary' : 'black',
                        borderColor: serviceType === 'Demo' ? 'primary' : 'text.secondary',
                        borderWidth: serviceType === 'Demo' ? 4 : 1,
                    }}
                >
                    <Stack direction={'row'} alignItems={'center'}>
                        <AddBusinessOutlined fontSize={'large'} sx={{mr: 2}}/>
                        <Typography variant={'h6'}>
                            Demo
                        </Typography>
                    </Stack>
                </Button>
                <Button
                    disabled
                    onClick={() => {
                        setFieldValue('status', 'scheduled');
                        setFieldValue('service_type', 'Trial')
                        setFieldValue('days_of_week', null);
                        setFieldValue('services_per_week', null);
                    }}
                    variant={'outlined'}
                    sx={{
                        width: '100%',
                        height: '120px',
                        color: serviceType === 'Trial' ? 'primary' : 'black',
                        borderColor: serviceType === 'Trial' ? 'primary' : 'text.secondary',
                        borderWidth: serviceType === 'Trial' ? 4 : 1,
                    }}
                >
                    <Stack direction={'row'} alignItems={'center'}>
                        <PendingActionsOutlined fontSize={'large'} sx={{mr: 2}}/>
                        <Typography variant={'h6'}>
                            Trial
                        </Typography>
                    </Stack>
                </Button>
            </Stack>
        </Stack>
    );
}
