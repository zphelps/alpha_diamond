import type { FC } from 'react';
import {Box} from "@mui/material";
import Logo from "../assets/Logo.png";
export const SplashScreen: FC = () => (
    <>
        <style>
            {`
          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(359deg);
            }
          }
        `}
        </style>
        <Box
            sx={{
                alignItems: 'center',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                justifyContent: 'center',
                left: 0,
                p: 3,
                position: 'fixed',
                top: 0,
                width: '100vw',
                zIndex: 1400
            }}
        >
            <Box
                sx={{
                    display: 'inline-flex',
                    height: 48,
                    width: 48
                }}
            >
                <img
                    style={{
                        // animation: 'rotation 1s infinite',
                        // animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        // transformOrigin: '40% 50%',
                        height: "80px",
                        width: "150px",
                        objectFit: "cover",
                    }}
                    src={Logo}
                />
                {/*<Logo />*/}
            </Box>
        </Box>
    </>
);
