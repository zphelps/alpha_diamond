import 'react'
import {Button, SvgIcon, Typography} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {usePopover} from "../hooks/use-popover";
import { CreateContentPopover } from './create-popover';

export const CreateButton = () => {
    const popover = usePopover<HTMLButtonElement>();

    return (
        <>
            <Button
                startIcon={(
                    <SvgIcon>
                        <PlusIcon fontSize={'small'}/>
                    </SvgIcon>
                )}
                variant="contained"
                ref={popover.anchorRef}
                onClick={popover.handleOpen}
            >
                <Typography
                    fontWeight={'600'}
                    fontSize={'0.85rem'}
                >
                    Create
                </Typography>
            </Button>
            <CreateContentPopover
                anchorEl={popover.anchorRef.current}
                onClose={popover.handleClose}
                open={popover.open}
            />
        </>
    )
}
