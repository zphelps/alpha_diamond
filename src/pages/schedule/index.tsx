import {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Box, Button, Card, colors, Container, Popover, Stack, Theme, Typography, useMediaQuery} from "@mui/material";
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
import {addMinutes, format, startOfWeek} from "date-fns"; // needed for dayClick
import ReactTooltip from 'react-tooltip';
import {usePopover} from "../../hooks/use-popover.tsx";
import {CreateContentPopover} from "../../components/create-popover.tsx";
import tippy from 'tippy.js';
import Tippy from "@tippyjs/react";
import {useMounted} from "../../hooks/use-mounted.ts";
import {servicesApi} from "../../api/services";
import {setServicesStatus, upsertManyServices} from "../../slices/services";
import {Status} from "../../utils/status.ts";
import {Service} from "../../types/service.ts";
import {date} from "yup";
import {TimelineToolbar, TimelineView} from "../../sections/schedule/timeline-toolbar.tsx";
import {schedulerApi} from "../../api/scheduler";
import toast from "react-hot-toast";

interface CreateDialogData {
    range?: {
        start: number;
        end: number;
    };
}

interface UpdateDialogData {
    eventId?: string;
}



const useServicesStore = () => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleServicesGet = useCallback(
        async () => {
            try {
                const response = await servicesApi.getServices();

                console.log(response.data);

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
            console.log(services)
            return Object.values(services).map((service) => {
                console.log(service)
                const start = new Date(service.timestamp);
                const end = addMinutes(start, service.duration);
                console.log("Start: " + start.toISOString());
                console.log("After adding " + service.duration + " minutes: " + end.toISOString());
                return {
                    id: service.id,
                    title: service.client.name,
                    backgroundColor: service.job.service_type === 'Recurring' ? colors.blueGrey[600] : colors.blue[600],
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

const useCurrentEvent = (
    events: ScheduleEvent[],
    dialogData?: UpdateDialogData
): ScheduleEvent | undefined => {
    return useMemo(
        (): ScheduleEvent | undefined => {
            if (!dialogData) {
                return undefined;
            }

            return events.find((event) => event.id === dialogData!.eventId);
        },
        [dialogData, events]
    );
};

export const SchedulePage = () => {
    const dispatch = useDispatch();
    const calendarRef = useRef<Calendar | null>(null);

    // Fetch services
    useServicesStore();
    // @ts-ignore
    const servicesStore = useSelector((state) => state.services);

    const [generatedServices, setGeneratedServices] = useState<Service[]>([]);

    const services = useScheduleServices(generatedServices); //useScheduleServices(servicesStore.services);

    // const [services, setServices] = useState([
    //     { title: 'Event 1', startStr: '2023-07-11T10:30:00', endStr: '2023-07-11T11:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' },
    //     { title: 'Event 2', start: '2023-07-12T12:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' },
    //     { title: 'Event 3', start: '2023-07-13T14:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' }
    // ]);

    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<TimelineView>(mdUp ? 'resourceTimeGridWeek' : 'resourceTimeGrid');
    const createDialog = useDialog<CreateDialogData>();
    const updateDialog = useDialog<UpdateDialogData>();
    // const updatingEvent = useCurrentEvent(events, updateDialog.data);

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
            // createDialog.handleOpen();

            try {
                toast.loading('Creating schedule services')
                console.log('Beginning of Week: ', startOfWeek(new Date()));
                const res = await schedulerApi.createScheduleServices({
                    beginningOfWeek: startOfWeek(new Date()),
                })

                console.log(res)

                setGeneratedServices(res.scheduledServices);


                // setServices([
                //     { title: 'Event 1', start: '2023-07-11T10:30:00', end: '2023-07-11T11:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' },
                //     { title: 'Event 2', start: '2023-07-12T12:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' },
                //     { title: 'Event 3', start: '2023-07-13T14:00:00', resourceId: '8285d475-6114-4e62-b865-7168a6d2cc0a' }
                // ])

                // const calendarEl = calendarRef.current;
                //
                // if (calendarEl) {
                //     const calendarApi = calendarEl.getApi();
                //
                //     calendarApi.refetchEvents();
                // }

                toast.dismiss()
                toast.success('Successfully created schedule services')
            } catch(e) {
                console.log(e)
            }

        },
        [createDialog]
    );

    const handleRangeSelect = useCallback(
        (arg: DateSelectArg): void => {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.unselect();
            }

            createDialog.handleOpen({
                range: {
                    start: arg.start.getTime(),
                    end: arg.end.getTime()
                }
            });
        },
        [createDialog]
    );

    const handleEventSelect = useCallback(
        (arg: EventClickArg): void => {
            // updateDialog.handleOpen({
            //     eventId: arg.event.id
            // });
        },
        []
    );

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
            <Seo title="Dashboard: Calendar" />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
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
                                    nowIndicator
                                    resourceOrder="title"
                                    resources={[
                                        {
                                            id: '8285d475-6114-4e62-b865-7168a6d2cc0a',
                                            title: 'Truck #1',
                                            extendedProps: {
                                                driver: 'Elon Musk',
                                            },
                                        },
                                        {
                                            id: '7740f3c9-9b30-42e8-a870-498518ecc98d',
                                            title: 'Truck #2',
                                            extendedProps: {
                                                driver: 'Mark Zuckerberg',
                                            },
                                        },
                                        {
                                            id: 'c',
                                            title: 'Truck #3',
                                            extendedProps: {
                                                driver: 'Jeff Bezos',
                                            },
                                        },
                                        {
                                            id: 'd',
                                            title: 'Truck #4',
                                            extendedProps: {
                                                driver: 'Bill Gates',
                                            },
                                        },
                                    ]}
                                    // allDayMaintainDuration
                                    // dayMaxEventRows={3}
                                    droppable
                                    editable
                                    eventContent={(event) => (
                                        <Box>
                                            <Stack>
                                                <Typography
                                                    fontSize={'0.7em'}
                                                >
                                                    {event.event.start.toLocaleTimeString('en-US', { timeStyle: 'short' })}
                                                </Typography>
                                                <Typography sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }} fontSize={'0.85em'} lineHeight={1.1} fontWeight={'600'}>{event.event.title}</Typography>
                                            </Stack>
                                        </Box>
                                    )}
                                    eventClick={handleEventSelect}
                                    eventDisplay="block"
                                    headerToolbar={false}
                                    // eventDrop={handleEventDrop}
                                    eventResizableFromStart
                                    // eventResize={handleEventResize}
                                    // events={[
                                    //     // {
                                    //     //     allDay: true,
                                    //     //     color: colors.red[500],
                                    //     //     end: new Date(2023, 7, 11, 16),
                                    //     //     start: new Date(2023, 7, 11, 14),
                                    //     //     title: 'All Day Event',
                                    //     //     resourceId: 'a',
                                    //     // },
                                    //     // {
                                    //     //     allDay: false,
                                    //     //     color: colors.green[500],
                                    //     //     end: new Date(2021, 5, 30, 12, 30).to,
                                    //     //     start: new Date(2021, 5, 30, 10, 0),
                                    //     //     title: 'Meeting'
                                    //     // }
                                    //     { title: 'Event 1', start: '2023-07-11T10:30:00', end: '2023-07-11T11:00:00', resourceId: 'a' },
                                    //     { title: 'Event 2', start: '2023-07-12T12:00:00', resourceId: 'b' },
                                    //     { title: 'Event 3', start: '2023-07-13T14:00:00', resourceId: 'c' }
                                    // ]}

                                    events={services}
                                    // headerToolbar={false}
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
                                    select={handleRangeSelect}
                                    selectable
                                    allDaySlot={false}
                                    weekends={false}
                                    businessHours={{
                                        daysOfWeek: [1, 2, 3, 4, 5],
                                        startTime: '08:00',
                                        endTime: '21:00',
                                    }}
                                    slotMinTime={'08:00'}
                                    slotMaxTime={'21:00'}
                                    dayHeaderFormat={{

                                    }}
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
                                            // <Stack paddingY={'25px'} justifyContent={'center'}>
                                            <Stack justifyContent={'center'}>
                                                <Typography variant={'subtitle2'}>{resource.title}</Typography>
                                                <Typography variant={'caption'}>Driver: {resource.extendedProps.driver}</Typography>
                                            </Stack>

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
