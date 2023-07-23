import type {FC} from "react";
import {useMemo} from "react";
import PropTypes from "prop-types";
import {Button, Divider, Drawer, Stack, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {Scrollbar} from "../../../components/scrollbar";
import {usePathname} from "../../../hooks/use-pathname";
import type {NavColor} from "../../../types/settings";
import type {Section} from "../config";
import {SideNavSection} from "./side-nav-section";
import {CreateButton} from "../../../components/create-button";
import Logo from "../../../assets/Logo.png";

const SIDE_NAV_WIDTH = 210;

const useCssVars = (color: NavColor): Record<string, string> => {
    const theme = useTheme();

    return useMemo(
        (): Record<string, string> => {
            switch (color) {
                case "blend-in":
                    if (theme.palette.mode === "dark") {
                        return {
                            "--nav-bg": theme.palette.background.default,
                            "--nav-color": theme.palette.neutral[100],
                            "--nav-border-color": theme.palette.neutral[700],
                            "--nav-logo-border": theme.palette.neutral[700],
                            "--nav-section-title-color": theme.palette.neutral[400],
                            "--nav-item-color": theme.palette.neutral[400],
                            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-color": theme.palette.text.primary,
                            "--nav-item-disabled-color": theme.palette.neutral[600],
                            "--nav-item-icon-color": theme.palette.neutral[500],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[700],
                            "--nav-item-chevron-color": theme.palette.neutral[700],
                            "--nav-scrollbar-color": theme.palette.neutral[400]
                        };
                    } else {
                        return {
                            "--nav-bg": theme.palette.background.default,
                            "--nav-color": theme.palette.text.primary,
                            "--nav-border-color": theme.palette.neutral[100],
                            "--nav-logo-border": theme.palette.neutral[100],
                            "--nav-section-title-color": theme.palette.neutral[400],
                            "--nav-item-color": theme.palette.text.secondary,
                            "--nav-item-hover-bg": theme.palette.action.hover,
                            "--nav-item-active-bg": theme.palette.primary.alpha12!, //theme.palette.action.selected,
                            "--nav-item-active-color": theme.palette.primary.main, //theme.palette.text.primary,
                            "--nav-item-disabled-color": theme.palette.neutral[400],
                            "--nav-item-icon-color": theme.palette.neutral[400],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[400],
                            "--nav-item-chevron-color": theme.palette.neutral[400],
                            "--nav-scrollbar-color": theme.palette.neutral[900]
                        };
                    }

                case "discreet":
                    if (theme.palette.mode === "dark") {
                        return {
                            "--nav-bg": theme.palette.neutral[900],
                            "--nav-color": theme.palette.neutral[100],
                            "--nav-border-color": theme.palette.neutral[700],
                            "--nav-logo-border": theme.palette.neutral[700],
                            "--nav-section-title-color": theme.palette.neutral[400],
                            "--nav-item-color": theme.palette.neutral[400],
                            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-color": theme.palette.text.primary,
                            "--nav-item-disabled-color": theme.palette.neutral[600],
                            "--nav-item-icon-color": theme.palette.neutral[500],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[700],
                            "--nav-item-chevron-color": theme.palette.neutral[700],
                            "--nav-scrollbar-color": theme.palette.neutral[400]
                        };
                    } else {
                        return {
                            "--nav-bg": theme.palette.neutral[50],
                            "--nav-color": theme.palette.text.primary,
                            "--nav-border-color": theme.palette.divider,
                            "--nav-logo-border": theme.palette.neutral[200],
                            "--nav-section-title-color": theme.palette.neutral[500],
                            "--nav-item-color": theme.palette.neutral[500],
                            "--nav-item-hover-bg": theme.palette.action.hover,
                            "--nav-item-active-bg": theme.palette.action.selected,
                            "--nav-item-active-color": theme.palette.text.primary,
                            "--nav-item-disabled-color": theme.palette.neutral[400],
                            "--nav-item-icon-color": theme.palette.neutral[400],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[400],
                            "--nav-item-chevron-color": theme.palette.neutral[400],
                            "--nav-scrollbar-color": theme.palette.neutral[900]
                        };
                    }

                case "evident":
                    if (theme.palette.mode === "dark") {
                        return {
                            "--nav-bg": theme.palette.neutral[800],
                            "--nav-color": theme.palette.common.white,
                            "--nav-border-color": "transparent",
                            "--nav-logo-border": theme.palette.neutral[700],
                            "--nav-section-title-color": theme.palette.neutral[400],
                            "--nav-item-color": theme.palette.neutral[400],
                            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-color": theme.palette.common.white,
                            "--nav-item-disabled-color": theme.palette.neutral[500],
                            "--nav-item-icon-color": theme.palette.neutral[400],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[500],
                            "--nav-item-chevron-color": theme.palette.neutral[600],
                            "--nav-scrollbar-color": theme.palette.neutral[400]
                        };
                    } else {
                        return {
                            "--nav-bg": theme.palette.neutral[800],
                            "--nav-color": theme.palette.common.white,
                            "--nav-border-color": "transparent",
                            "--nav-logo-border": theme.palette.neutral[700],
                            "--nav-section-title-color": theme.palette.neutral[400],
                            "--nav-item-color": theme.palette.neutral[400],
                            "--nav-item-hover-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-bg": "rgba(255, 255, 255, 0.04)",
                            "--nav-item-active-color": theme.palette.common.white,
                            "--nav-item-disabled-color": theme.palette.neutral[500],
                            "--nav-item-icon-color": theme.palette.neutral[400],
                            "--nav-item-icon-active-color": theme.palette.primary.main,
                            "--nav-item-icon-disabled-color": theme.palette.neutral[500],
                            "--nav-item-chevron-color": theme.palette.neutral[600],
                            "--nav-scrollbar-color": theme.palette.neutral[400]
                        };
                    }

                default:
                    return {};
            }
        },
        [theme, color]
    );
};

interface SideNavProps {
    color?: NavColor;
    sections?: Section[];
}

export const SideNav: FC<SideNavProps> = (props) => {
    const {color = "evident", sections = []} = props;
    const pathname = usePathname();
    const cssVars = useCssVars(color);

    return (
        <Drawer
            anchor="left"
            open
            PaperProps={{
                sx: {
                    ...cssVars,
                    backgroundColor: "var(--nav-bg)",
                    borderRightColor: "var(--nav-border-color)",
                    borderRightStyle: "solid",
                    borderRightWidth: 1,
                    borderColor: "#eeeeee",
                    color: "var(--nav-color)",
                    width: SIDE_NAV_WIDTH
                }
            }}
            variant="permanent"
        >
            <Scrollbar
                sx={{
                    height: "100%",
                    "& .simplebar-content": {
                        height: "100%"
                    },
                    "& .simplebar-scrollbar:before": {
                        background: "var(--nav-scrollbar-color)"
                    }
                }}
            >
                <Stack sx={{height: "100%"}}>
                    <Stack
                        alignItems="center"
                        direction="column"
                        spacing={1.5}
                        sx={{pt: 3, px: 4}}
                    >
                        {/*<img style={{height: "80px", width: "150px"}} src={Logo}></img>*/}
                        <Stack direction={'row'}>
                            <Typography
                                variant={'h5'}
                                fontWeight={'900'}
                                color={'primary.main'}
                            >
                                Alpha
                            </Typography>
                            <Typography
                                variant={'h5'}
                                fontWeight={'900'}
                                color={'text.secondary'}
                            >
                                Diamond
                            </Typography>
                        </Stack>

                    </Stack>
                    <Divider sx={{height: 2, mt: 2, mb: 2, background: (theme) => theme.palette.grey.A100}}/>
                    <Stack
                        component="nav"
                        spacing={2}
                        sx={{
                            flexGrow: 1,
                            px: 2
                        }}
                    >
                        <CreateButton/>
                        <Divider sx={{height: 2, mt: 2, mb: 2.5, background: (theme) => theme.palette.grey.A100}}/>
                        {sections.map((section, index) => (
                            <SideNavSection
                                items={section.items}
                                key={index}
                                pathname={pathname}
                                subheader={section.subheader}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Scrollbar>
        </Drawer>
    );
};

SideNav.propTypes = {
    color: PropTypes.oneOf<NavColor>(["blend-in", "discreet", "evident"]),
    sections: PropTypes.array
};
