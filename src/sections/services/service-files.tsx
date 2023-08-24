import type {FC} from "react";
import PropTypes from "prop-types";
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Button,
    capitalize,
    Stack,
    Card,
    CardActions,
    CardHeader, IconButton,
    Link, List, ListItem, ListItemButton, ListItemText,
    Typography
} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {SeverityPill} from "../../components/severity-pill.tsx";
import React, {useCallback, useState} from "react";
import {RouterLink} from "../../components/router-link.tsx";
import {ChargeUnit} from "../../types/job.ts";
import {Service} from "../../types/service.ts";
import {format} from "date-fns";
import {Download, ExpandMore, RemoveRedEye} from "@mui/icons-material";
import {ImagePreviewDialog} from "../../components/image-preview-dialog.tsx";
import {useDialog} from "../../hooks/use-dialog.tsx";
import {supabase} from "../../config.ts";
import {useAuth} from "../../hooks/use-auth.ts";
import toast from "react-hot-toast";

interface PreviewDialogData {
    src?: string;
}

interface ServiceFilesProps {
    service: Service;
}

const _images = [
    {
        label: 'Before',
        value: 'initial_fill_image',
    },
    {
        label: 'After',
        value: 'final_fill_image',
    },
    {
        label: "Front",
        value: 'front_image',
    },
    {
        label: "Back",
        value: 'back_image',
    },
    {
        label: "Left",
        value: 'left_image',
    },
    {
        label: "Right",
        value: 'right_image',
    }
];

export const ServiceFiles: FC<ServiceFilesProps> = (props) => {
    const {service} = props;
    const auth = useAuth();
    const previewDialog = useDialog<PreviewDialogData>();

    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <>
            <Card sx={{pb: 3}}>
                <CardHeader title="Files"/>
                <Accordion disableGutters sx={{px: 1}} elevation={0} expanded={expanded === "panel1"}
                           onChange={handleChange("panel1")}>
                    <AccordionSummary
                        expandIcon={<ExpandMore/>}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography variant={"subtitle2"} sx={{width: "30%", flexShrink: 0}}>
                            General
                        </Typography>
                        <Typography variant={"body2"} sx={{color: "text.secondary"}}>Service Report</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{my: 0}}>
                        <Typography>
                            Still working on this feature ;) Check back soon!
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                {service.bins.map((bin, index) => (
                    <Accordion key={bin.id} disableGutters sx={{px: 1}} elevation={0} expanded={expanded === bin.id}
                               onChange={handleChange(bin.id)}>
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography variant={"subtitle2"} sx={{width: "30%", flexShrink: 0}}>
                                {`Bin #${index + 1}`}
                            </Typography>
                            <Typography variant={"body2"} sx={{color: "text.secondary"}}>Images</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{my: 0, py: 0}}>
                            <List dense>
                                {_images.map((image) => (
                                    <ListItem
                                        key={image.value}
                                        secondaryAction={
                                            <>
                                                <IconButton
                                                    sx={{mr: 1}}
                                                    onClick={async () => {
                                                        toast.loading("Downloading...");
                                                        const {data, error} = await supabase
                                                            .storage
                                                            .from(auth.user.organization.id)
                                                            .createSignedUrl(bin[image.value], 60, {
                                                                download: true,
                                                            });
                                                        const tempLink = document.createElement('a');
                                                        tempLink.href = data.signedUrl;
                                                        tempLink.setAttribute('download', ''); // This can be set to a specific filename if desired
                                                        tempLink.click();
                                                        toast.dismiss();
                                                        toast.success("Downloaded!");
                                                    }}
                                                >
                                                    <Download/>
                                                </IconButton>
                                                <IconButton
                                                    onClick={async () => {
                                                        console.log(bin.id);

                                                        toast.loading("Loading...")
                                                        const {data, error} = await supabase
                                                            .storage
                                                            .from(auth.user.organization.id)
                                                            .createSignedUrl(bin[image.value], 60);
                                                        toast.dismiss();
                                                        previewDialog.handleOpen({
                                                            src: data.signedUrl,
                                                        });
                                                    }}
                                                >
                                                    <RemoveRedEye/>
                                                </IconButton>
                                            </>
                                        }
                                    >
                                        <ListItemText>
                                            <Typography variant={"body2"}>
                                                {image.label}
                                            </Typography>
                                        </ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Card>
            <ImagePreviewDialog
                onClose={previewDialog.handleClose}
                open={previewDialog.open}
                src={previewDialog.data?.src}
            />
        </>
    );
};
