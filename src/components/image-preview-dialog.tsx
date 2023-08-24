import {FC} from "react";
import {Box, Button, Dialog, Divider, Stack, Typography} from "@mui/material";


interface ImagePreviewDialogProps {
    src: string;
    onClose?: () => void;
    open?: boolean;
}

export const ImagePreviewDialog: FC<ImagePreviewDialogProps> = (props) => {
    const {
        src,
        onClose,
        open = false,
    } = props;

    return (
        <>
            <Dialog
                fullWidth
                onClose={onClose}
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        margin: 0,
                        width: '100%',
                    },
                }}
            >
                <Box sx={{p: 3}}>
                    <Typography
                        variant="h5"
                        sx={{mb: 1.5}}
                    >
                        Image Preview
                    </Typography>

                    <img src={src} alt="preview" style={{width: '100%', borderRadius: 10}}/>

                    <Divider sx={{mb: 2, mt: 1}}/>

                    <Stack direction={'row'} justifyContent={'end'} spacing={1}>
                        <Button
                            onClick={() => {
                                onClose?.();
                            }}
                            variant={'outlined'}
                        >
                            Close
                        </Button>
                    </Stack>
                </Box>
                <Divider/>
            </Dialog>
        </>
    );
};
