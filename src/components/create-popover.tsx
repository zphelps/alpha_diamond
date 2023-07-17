import type { FC } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    ListItem,
    Popover,
    Typography
} from '@mui/material';
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import {PostAdd} from "@mui/icons-material";
import CampaignIcon from "@mui/icons-material/Campaign";
import {useDialog} from "../hooks/use-dialog";
import {useCallback} from "react";
import { useNavigate } from 'react-router-dom';

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
                                mr: 2,
                            }}
                        >
                            <CampaignIcon fontSize={'small'} sx={{ color: '#F44336'}}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle1'}
                        >
                            Announcement
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
                                mr: 2,
                            }}
                        >
                            <PostAdd fontSize={'small'} sx={{ color: '#2196F3'}}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle1'}
                        >
                            Post
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
                                mr: 2,
                            }}
                        >
                            <EventIcon fontSize={'small'} sx={{ color: '#4CAF50' }}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle1'}
                        >
                            Event
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
                                mr: 2,
                            }}
                        >
                            <GroupIcon fontSize={'small'} sx={{ color: '#FF9800' }}/>
                        </Avatar>
                        <Typography
                            variant={'subtitle1'}
                        >
                            Group
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
