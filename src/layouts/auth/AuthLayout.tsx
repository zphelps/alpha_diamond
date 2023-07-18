import type {FC, ReactNode} from "react";
import PropTypes from "prop-types";
import {Box, Container, Stack, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
// import { Logo } from 'src/components/logo';
import {RouterLink} from "../../components/router-link";
import {paths} from "../../paths";
import Logo from '../../assets/Logo.png'

const TOP_NAV_HEIGHT = 64;

const LayoutRoot = styled("div")(
    ({theme}) => ({
        backgroundColor: theme.palette.background.default,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundImage: "url(\"/assets/gradient-bg.svg\")",
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "column",
        height: "100%"
    })
);

interface LayoutProps {
    children: ReactNode;
}

export const AuthLayout: FC<LayoutProps> = (props) => {
    const {children} = props;

    return (
        <LayoutRoot>
            <Box
                component="header"
                sx={{
                    left: 0,
                    position: "fixed",
                    right: 0,
                    top: 0,
                    zIndex: (theme) => theme.zIndex.appBar
                }}
            >
                <Container maxWidth="lg">
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{height: TOP_NAV_HEIGHT}}
                    >
                        <Stack
                            alignItems="center"
                            component={RouterLink}
                            direction="row"
                            display="inline-flex"
                            href={paths.index}
                            spacing={1}
                            sx={{textDecoration: "none"}}
                        >
                            <img style={{height: "50px", width: "90px"}} src={Logo}></img>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    flex: "1 1 auto"
                }}
            >
                <Container
                    maxWidth="sm"
                    sx={{
                        py: {
                            xs: "60px",
                            md: "120px"
                        }
                    }}
                >
                    {children}
                </Container>
            </Box>
        </LayoutRoot>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node
};
