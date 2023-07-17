import 'react'
import {Button, SvgIcon} from "@mui/material";
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
                        <PlusIcon/>
                    </SvgIcon>
                )}
                variant="contained"
                // sx={{
                //     backgroundColor: (theme) => theme.palette.primary.alpha30,
                //     color: (theme) => theme.palette.primary.darkest,
                // }}
                ref={popover.anchorRef}
                onClick={popover.handleOpen}
            >
                Create
            </Button>
            <CreateContentPopover
                anchorEl={popover.anchorRef.current}
                onClose={popover.handleClose}
                open={popover.open}
            />
        </>
    )
}
