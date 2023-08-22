import {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    Button,
    Card,
    colors,
    Container,
    Divider,
    Popover,
    Stack,
    Theme,
    Typography,
    useMediaQuery
} from "@mui/material";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {Seo} from "../../components/seo.tsx";
import Calendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import {TimelineContainer} from "../../sections/schedule/timeline-container.tsx";
import {DateSelectArg, EventClickArg, EventDropArg, EventResizeDoneArg} from "fullcalendar";
import {ScheduleEvent} from "../../types/schedule-event.ts";
import {useDispatch, useSelector} from "react-redux";
import {Truck01} from "@untitled-ui/icons-react";
import interactionPlugin from "@fullcalendar/interaction";
import {addDays, addMinutes, format, set, setSeconds, startOfWeek} from "date-fns"; // needed for dayClick
import ReactTooltip from 'react-tooltip';
import {usePopover} from "../../hooks/use-popover.tsx";
import {CreateContentPopover} from "../../components/create-popover.tsx";
import tippy from 'tippy.js';
import Tippy from "@tippyjs/react";
import {useMounted} from "../../hooks/use-mounted.ts";
import {servicesApi} from "../../api/services";
import {setServicesStatus, upsertManyServices} from "../../slices/services";
import {Status} from "../../utils/status.ts";
import {Service, ServiceType} from "../../types/service.ts";
import {date} from "yup";
import {TimelineToolbar, TimelineView} from "../../sections/schedule/timeline-toolbar.tsx";
import {schedulerApi} from "../../api/scheduler";
import toast from "react-hot-toast";
import {trucksApi} from "../../api/trucks";
import {setTruckStatus, upsertManyTrucks} from "../../slices/trucks";
import {Truck} from "../../types/truck.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import {ServicePreviewPreviewDialog} from "../../sections/services/service-preview-dialog.tsx";
import {useNavigate} from "react-router-dom";
import {paths} from "../../paths.ts";

interface PreviewDialogData {
    serviceId?: string;
}

interface TrucksSearchState {
    organization_id: string;
    franchise_id: string;
}

const useTrucksStore = (searchState: TrucksSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleTrucksGet = useCallback(
        async () => {
            try {
                const response = await trucksApi.getTrucks(searchState);

                if (isMounted()) {
                    dispatch(upsertManyTrucks(response.data));
                    dispatch(setTruckStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setTruckStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleTrucksGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useTrucks = (trucks: Truck[] = []) => {
    return useMemo(
        () => {
            return Object.values(trucks);
        },
        [trucks]
    );
};

const useServicesStore = () => {
    const isMounted = useMounted();
    const dispatch = useDispatch();
    const auth = useAuth();

    const handleServicesGet = useCallback(
        async () => {
            try {
                const response = await servicesApi.getServices({
                    organization_id: auth.user.organization.id,
                    franchise_id: auth.user.franchise.id,
                });

                if (isMounted()) {
                    dispatch(upsertManyServices(response.data));
                    dispatch(setServicesStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setServicesStatus(Status.ERROR));
            }
        },
        [dispatch, isMounted]
    );

    useEffect(
        () => {
            handleServicesGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

const useScheduleServices = (services: Service[] = []) => {
    return useMemo(
        () => {
            return Object.values(services).map((service) => {
                const start = setSeconds(new Date(service.timestamp), 0);
                const end = setSeconds(addMinutes(start, service.duration), 0);
                return {
                    id: service.id,
                    title: service.client.name,
                    backgroundColor: service.job.service_type === ServiceType.RECURRING ? colors.blueGrey[600] : colors.blue[600],
                    resourceId: service.truck.id,
                    start: start,
                    end: end,
                    allDay: false,
                    extendedProps: {
                        service
                    },
                };
            });
        },
        [services]
    );
};

const useCurrentService = (
    services: Service[],
    dialogData?: PreviewDialogData
): Service | undefined => {
    return useMemo(
        (): Service | undefined => {
            if (!dialogData) {
                return undefined;
            }
            return services.find((event) => event.id === dialogData!.serviceId);
        },
        [dialogData, services]
    );
};

export const SchedulePage = () => {
    const navigate = useNavigate();
    const calendarRef = useRef<Calendar | null>(null);

    const auth = useAuth();
    const [trucksSearchState, setTrucksSearchState] = useState<TrucksSearchState>({
        organization_id: auth.user.organization.id,
        franchise_id: auth.user.franchise.id,
    });

    useTrucksStore(trucksSearchState);

    const trucksStore = useSelector((state: any) => state.trucks);

    const trucks = useTrucks(trucksStore.trucks)

    // Fetch services
    useServicesStore();
    // @ts-ignore
    const servicesStore = useSelector((state) => state.services);

    const services = useScheduleServices(servicesStore.services); // useScheduleServices(generatedServices); (for testing)

    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<TimelineView>(mdUp ? 'resourceTimeGridWeek' : 'resourceTimeGrid');
    const previewDialog = useDialog<PreviewDialogData>();

    const currentService = useCurrentService(Object.values(servicesStore.services), previewDialog.data);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const handleScreenResize = useCallback(
        (): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();
                const newView = mdUp ? 'resourceTimeGridWeek' : 'resourceTimeGrid';

                calendarApi.changeView(newView);
                setView(newView);
            }
        },
        [calendarRef, mdUp]
    );

    useEffect(
        () => {
            handleScreenResize();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mdUp]
    );

    const handleViewChange = useCallback(
        (view: TimelineView): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.changeView(view);
                setView(view);
            }
        },
        []
    );

    const handleDateToday = useCallback(
        (): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.today();
                setDate(calendarApi.getDate());
            }
        },
        []
    );

    const handleDatePrev = useCallback(
        (): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.prev();
                setDate(calendarApi.getDate());
            }
        },
        []
    );

    const handleDateNext = useCallback(
        (): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.next();
                setDate(calendarApi.getDate());
            }
        },
        []
    );

    const handleAddClick = useCallback(
        async (): Promise<void> => {

            navigate(paths.jobs.create);
            // createDialog.handleOpen();

            // try {
            //     toast.loading('Creating schedule services')
            //     console.log('Beginning of Week: ', startOfWeek(addDays(new Date(), 3)));
            //
            //     const res = await schedulerApi.insertRecurringJobServicesForWeek({
            //         beginningOfWeek: startOfWeek(addDays(new Date(), 7)),
            //         operating_hours: auth.user.franchise.operating_hours,
            //         operating_days: auth.user.franchise.operating_days,
            //         organization_id: auth.user.organization.id,
            //         franchise_id: auth.user.franchise.id,
            //     })
            //
            //     console.log(res)
            //
            //     toast.dismiss()
            //     toast.success('Successfully created schedule services')
            // } catch(e) {
            //     console.log(e)
            // }

        },
        [previewDialog]
    );

    const handleEventSelect = useCallback(
        (arg: EventClickArg): void => {
            previewDialog.handleOpen({
                serviceId: arg.event.id
            });
        },
        []
    );

    // @ts-ignore
    function handleEventMouseEnter(eventInfo) {
        eventInfo.el.style.cursor = 'pointer';
    }

    // @ts-ignore
    function handleEventMouseLeave(eventInfo) {
        eventInfo.el.style.cursor = 'default';
    }


    // const handleEventResize = useCallback(
    //     async (arg: EventResizeDoneArg): Promise<void> => {
    //         const { event } = arg;
    //
    //         try {
    //             await dispatch(thunks.updateEvent({
    //                 eventId: event.id,
    //                 update: {
    //                     allDay: event.allDay,
    //                     start: event.start?.getTime(),
    //                     end: event.end?.getTime()
    //                 }
    //             }));
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     },
    //     [dispatch]
    // );

    // const handleEventDrop = useCallback(
    //     async (arg: EventDropArg): Promise<void> => {
    //         const { event } = arg;
    //
    //         try {
    //             await dispatch(thunks.updateEvent({
    //                 eventId: event.id,
    //                 update: {
    //                     allDay: event.allDay,
    //                     start: event.start?.getTime(),
    //                     end: event.end?.getTime()
    //                 }
    //             }));
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     },
    //     [dispatch]
    // );

    return (
        <>
            <Seo title="Schedule" />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Divider />
                <Container maxWidth={false}>
                    <Stack spacing={0}>
                        <TimelineToolbar
                            date={date}
                            onAddClick={handleAddClick}
                            onDateNext={handleDateNext}
                            onDatePrev={handleDatePrev}
                            onDateToday={handleDateToday}
                            onViewChange={handleViewChange}
                            view={view}
                        />
                        <Card>
                            <TimelineContainer>
                                <Calendar
                                    eventMouseEnter={handleEventMouseEnter}
                                    eventMouseLeave={handleEventMouseLeave}
                                    nowIndicator
                                    resourceOrder="title"
                                    resources={[...trucks.map((truck) => ({
                                        id: truck.id,
                                        title: truck.name,
                                        extendedProps: {
                                            driver: truck.driver.first_name + ' ' + truck.driver.last_name,
                                        },
                                    }))]}
                                    // allDayMaintainDuration
                                    // droppable
                                    // editable
                                    eventContent={(event) => (
                                        <Box>
                                            <Stack>
                                                <Typography
                                                    fontSize={'0.7em'}
                                                    sx={{
                                                        textDecoration: event.event.extendedProps.service.status === 'completed' ? 'line-through' : 'none',
                                                    }}
                                                >
                                                    {event.event.start.toLocaleTimeString('en-US', { timeStyle: 'short' })}
                                                </Typography>
                                                <Typography sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    textDecoration: event.event.extendedProps.service.status === 'completed' ? 'line-through' : 'none',
                                                }} fontSize={'0.85em'} lineHeight={1.2} fontWeight={'600'}>{event.event.title}</Typography>
                                            </Stack>
                                        </Box>
                                    )}
                                    eventClick={handleEventSelect}
                                    eventDisplay="block"
                                    headerToolbar={false}
                                    // eventDrop={handleEventDrop}
                                    eventResizableFromStart
                                    // eventResize={handleEventResize}
                                    events={services}
                                    height={'88vh'}
                                    initialDate={date}
                                    initialView={view}
                                    plugins={[
                                        resourceTimelinePlugin,
                                        resourceTimeGridPlugin,
                                        interactionPlugin,
                                    ]}
                                    ref={calendarRef}
                                    rerenderDelay={10}
                                    selectable
                                    allDaySlot={false}
                                    weekends={true}
                                    businessHours={{
                                        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                                        startTime: '06:00',
                                        endTime: '22:00',
                                    }}
                                    slotMinTime={'06:00'}
                                    slotMaxTime={'22:00'}
                                    dayHeaderContent={(arg) => {
                                        const date = arg.date;
                                        return (
                                            <Button
                                                sx={{
                                                    p:0,
                                                    m:0,
                                                    margin: 0,
                                                    padding: 0,
                                                    minWidth: 0,
                                                    minHeight: 0,
                                                }}
                                                onClick={handleClick}
                                            >
                                                <Stack>
                                                    <Typography
                                                        variant={'caption'}
                                                    >
                                                        {format(date, 'E')}
                                                    </Typography>
                                                    <Typography variant={'caption'}>{format(date, 'M/d')}</Typography>
                                                </Stack>
                                            </Button>
                                        )
                                    }}
                                    // resourceAreaWidth={'15%'}
                                    resourceAreaHeaderContent={() => (
                                        <Stack direction={'row'}>
                                            <Truck01/>
                                            <Typography variant={'h6'} sx={{ml: 1.5}}>Trucks</Typography>
                                        </Stack>
                                    )}
                                    resourceLabelContent={(arg) => {
                                        const resource = arg.resource;
                                        return (
                                            <Typography variant={'caption'} fontWeight={'600'}>{resource.title}</Typography>
                                        )
                                    }}
                                />
                                <Popover
                                    id={id}
                                    open={open}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
                                </Popover>
                            </TimelineContainer>
                        </Card>
                    </Stack>
                </Container>
            </Box>
            {currentService && <ServicePreviewPreviewDialog
                onClose={previewDialog.handleClose}
                open={previewDialog.open}
                service={currentService}
            />}
            {/*<CalendarEventDialog*/}
            {/*    action="create"*/}
            {/*    onAddComplete={createDialog.handleClose}*/}
            {/*    onClose={createDialog.handleClose}*/}
            {/*    open={createDialog.open}*/}
            {/*    range={createDialog.data?.range}*/}
            {/*/>*/}
            {/*<CalendarEventDialog*/}
            {/*    action="update"*/}
            {/*    event={updatingEvent}*/}
            {/*    onClose={updateDialog.handleClose}*/}
            {/*    onDeleteComplete={updateDialog.handleClose}*/}
            {/*    onEditComplete={updateDialog.handleClose}*/}
            {/*    open={updateDialog.open}*/}
            {/*/>*/}
        </>
    );
};
