import type { FC } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    ListItem,
    Popover, SvgIcon,
    Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import {AttachMoney, Contacts, ContactsOutlined, People, PeopleOutlined, PostAdd, Schedule} from "@mui/icons-material";
import CampaignIcon from "@mui/icons-material/Campaign";
import {useDialog} from "../hooks/use-dialog";
import {useCallback} from "react";
import { useNavigate } from 'react-router-dom';
import {Truck02} from "@untitled-ui/icons-react";
import {RouterLink} from "./router-link.tsx";

interface CreateContentPopoverProps {
    anchorEl: null | Element;
    onClose?: () => void;
    open?: boolean;
}

export const CreateContentPopover: FC<CreateContentPopoverProps> = (props) => {
    const {
        anchorEl,
        onClose,
        open = false,
        ...other
    } = props;
    const navigate = useNavigate();

    const createPostDialog = useDialog();
    const createEventDialog = useDialog();
    const createGroupDialog = useDialog();

    const handleAddPostClick = useCallback(
        (): void => {
            navigate('/')
            createPostDialog.handleOpen();
            onClose?.();
        },
        [createPostDialog.handleOpen]
    );

    const handleAddEventClick = useCallback(
        (): void => {
            navigate('/calendar')
            createEventDialog.handleOpen();
            onClose?.();
        },
        [createEventDialog.handleOpen]
    );

    const handleAddGroupClick = useCallback(
        (): void => {
            navigate('/groups')
            createGroupDialog.handleOpen();
            onClose?.();
        },
        [createGroupDialog.handleOpen]
    );

    return (
        <>
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }}
                disableScrollLock
                onClose={onClose}
                open={open}
                PaperProps={{ sx: { width: anchorEl?.clientWidth, mt: 1 } }}
                {...other}
            >
                <Box sx={{ px: 1, py: 2 }}>
                    <ListItem
                        onClick={() => {
                            navigate('jobs/create')
                            onClose?.();
                        }}
                        sx={{
                            px: 1,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: '#FFEBEE',
                                mr: 1.5,
                                width: 36,
                                height: 36,
                            }}
                        >
                            <Schedule fontSize={'small'} sx={{ color: '#F44336'}}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle2'}
                        >
                            Job
                        </Typography>
                    </ListItem>
                    <ListItem
                        onClick={handleAddPostClick}
                        sx={{
                            px: 1,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: '#E3F2FD',
                                mr: 1.5,
                                width: 36,
                                height: 36,
                            }}
                        >
                            <AttachMoney fontSize={'small'} sx={{ color: '#2196F3'}}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle2'}
                        >
                            Invoice
                        </Typography>
                    </ListItem>
                    <ListItem
                        onClick={handleAddEventClick}
                        sx={{
                            px: 1,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: '#E8F5E9',
                                mr: 1.5,
                                width: 36,
                                height: 36,
                            }}
                        >
                            <SvgIcon fontSize={'small'}>
                                <Truck02 color={'#4CAF50'}/>
                            </SvgIcon>
                        </Avatar>
                        <Typography
                            variant={'subtitle2'}
                        >
                            Truck
                        </Typography>
                    </ListItem>
                    <ListItem
                        onClick={handleAddGroupClick}
                        sx={{
                            px: 1,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: '#FFF3E0',
                                mr: 1.5,
                                width: 36,
                                height: 36,
                            }}
                        >
                            <ContactsOutlined fontSize={'small'} sx={{ color: '#FF9800' }}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle2'}
                        >
                            Lead
                        </Typography>
                    </ListItem>
                    <ListItem
                        onClick={handleAddGroupClick}
                        sx={{
                            px: 1,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: '#F3E5F5',
                                mr: 1.5,
                                width: 36,
                                height: 36,
                            }}
                        >
                            <PeopleOutlined fontSize={'small'} sx={{ color: '#9C27B0' }}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle2'}
                        >
                            Client
                        </Typography>
                    </ListItem>
                </Box>
            </Popover>
        </>
    );
};

CreateContentPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool
};
