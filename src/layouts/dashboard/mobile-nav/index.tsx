import type { FC } from 'react';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {Divider, Drawer, Stack, Typography} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from '../../../components/scrollbar';
import { usePathname } from '../../../hooks/use-pathname';
import type { NavColor } from '../../../types/settings';
import type { Section } from '../config';
import { MobileNavSection } from './mobile-nav-section';
import Logo from "../../../assets/Logo.png";

const MOBILE_NAV_WIDTH = 280;

const useCssVars = (color: NavColor): Record<string, string> => {
  const theme = useTheme();

  return useMemo(
    (): Record<string, string> => {
      switch (color) {
        // Blend-in and discreet have no difference on mobile because
        // there's a backdrop and differences are not visible
        case 'blend-in':
        case 'discreet':
          if (theme.palette.mode === 'dark') {
            return {
              '--nav-bg': theme.palette.background.default,
              '--nav-color': theme.palette.neutral[100],
              '--nav-logo-border': theme.palette.neutral[700],
              '--nav-section-title-color': theme.palette.neutral[400],
              '--nav-item-color': theme.palette.neutral[400],
              '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-color': theme.palette.text.primary,
              '--nav-item-disabled-color': theme.palette.neutral[600],
              '--nav-item-icon-color': theme.palette.neutral[500],
              '--nav-item-icon-active-color': theme.palette.primary.main,
              '--nav-item-icon-disabled-color': theme.palette.neutral[700],
              '--nav-item-chevron-color': theme.palette.neutral[700],
              '--nav-scrollbar-color': theme.palette.neutral[400]
            };
          } else {
            return {
              '--nav-bg': theme.palette.background.default,
              '--nav-color': theme.palette.text.primary,
              '--nav-logo-border': theme.palette.neutral[100],
              '--nav-section-title-color': theme.palette.neutral[400],
              '--nav-item-color': theme.palette.text.secondary,
              '--nav-item-hover-bg': theme.palette.action.hover,
              '--nav-item-active-bg': theme.palette.primary.alpha12!, //theme.palette.action.selected,
              '--nav-item-active-color': theme.palette.primary.main, //theme.palette.text.primary,
              '--nav-item-disabled-color': theme.palette.neutral[400],
              '--nav-item-icon-color': theme.palette.neutral[400],
              '--nav-item-icon-active-color': theme.palette.primary.main,
              '--nav-item-icon-disabled-color': theme.palette.neutral[400],
              '--nav-item-chevron-color': theme.palette.neutral[400],
              '--nav-scrollbar-color': theme.palette.neutral[900]
            };
          }

        case 'evident':
          if (theme.palette.mode === 'dark') {
            return {
              '--nav-bg': theme.palette.neutral[800],
              '--nav-color': theme.palette.common.white,
              '--nav-logo-border': theme.palette.neutral[700],
              '--nav-section-title-color': theme.palette.neutral[400],
              '--nav-item-color': theme.palette.neutral[400],
              '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-color': theme.palette.common.white,
              '--nav-item-disabled-color': theme.palette.neutral[500],
              '--nav-item-icon-color': theme.palette.neutral[400],
              '--nav-item-icon-active-color': theme.palette.primary.main,
              '--nav-item-icon-disabled-color': theme.palette.neutral[500],
              '--nav-item-chevron-color': theme.palette.neutral[600],
              '--nav-scrollbar-color': theme.palette.neutral[400]
            };
          } else {
            return {
              '--nav-bg': theme.palette.neutral[800],
              '--nav-color': theme.palette.common.white,
              '--nav-logo-border': theme.palette.neutral[700],
              '--nav-section-title-color': theme.palette.neutral[400],
              '--nav-item-color': theme.palette.neutral[400],
              '--nav-item-hover-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-bg': 'rgba(255, 255, 255, 0.04)',
              '--nav-item-active-color': theme.palette.common.white,
              '--nav-item-disabled-color': theme.palette.neutral[500],
              '--nav-item-icon-color': theme.palette.neutral[400],
              '--nav-item-icon-active-color': theme.palette.primary.main,
              '--nav-item-icon-disabled-color': theme.palette.neutral[500],
              '--nav-item-chevron-color': theme.palette.neutral[600],
              '--nav-scrollbar-color': theme.palette.neutral[400]
            };
          }

        default:
          return {};
      }
    },
    [theme, color]
  );
};

interface MobileNavProps {
  color?: NavColor;
  onClose?: () => void;
  open?: boolean;
  sections?: Section[];
}

export const MobileNav: FC<MobileNavProps> = (props) => {
  const { color = 'evident', open, onClose, sections = [] } = props;
  const pathname = usePathname();
  const cssVars = useCssVars(color);

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          ...cssVars,
          backgroundColor: 'var(--nav-bg)',
          color: 'var(--nav-color)',
          width: MOBILE_NAV_WIDTH
        }
      }}
      variant="temporary"
    >
      <Scrollbar
        sx={{
          height: '100%',
          '& .simplebar-content': {
            height: '100%'
          },
          '& .simplebar-scrollbar:before': {
            background: 'var(--nav-scrollbar-color)'
          }
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <Stack
            alignItems="center"
            direction="column"
            spacing={1.5}
            sx={{ pt: 3, px: 4}}
          >
            {/*<img style={{height: '38px', width: '35px'}} src={Logo}></img>*/}
            {/*<Typography*/}
            {/*    variant="h5"*/}
            {/*    sx={{fontFamily: (theme) => theme.typography.fontFamily,*/}
            {/*      color: (theme) => theme.palette.text.secondary}}*/}
            {/*>*/}
            {/*  OneSchool*/}
            {/*</Typography>*/}
            <img style={{height: "40px", width: "100px"}} src={Logo}></img>
            <Typography
                variant="h6"
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  color: (theme) => theme.palette.text.secondary,
                  letterSpacing: "0.025em",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }}
            >
              Hamilton Heights High School
            </Typography>
          </Stack>
          <Divider sx={{ height: 2, mt: 3, mb: 2.5, background: (theme) => theme.palette.grey.A200 }} />
          <Stack
            component="nav"
            spacing={2}
            sx={{
              flexGrow: 1,
              px: 2
            }}
          >
            {sections.map((section, index) => (
              <MobileNavSection
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

MobileNav.propTypes = {
  color: PropTypes.oneOf<NavColor>(['blend-in', 'discreet', 'evident']),
  onClose: PropTypes.func,
  open: PropTypes.bool,
  sections: PropTypes.array
};
