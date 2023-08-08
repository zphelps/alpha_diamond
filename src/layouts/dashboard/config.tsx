import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {SvgIcon} from "@mui/material";
import HomeSmileIcon from '../../icons/untitled-ui/duocolor/home-smile';
import {
  Calendar, CheckDone01, CurrencyDollar,
  Truck02,
  Users03
} from "@untitled-ui/icons-react";
import { paths } from '../../paths';
import {Business, Contacts, ContactsOutlined} from "@mui/icons-material";

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  // const auth = useAuth();

  return useMemo(
    () => {
      return [
        {
          subheader: "Main",
          items: [
            {
              title: 'Home',
              path: paths.index,
              icon: (
                <SvgIcon fontSize="small">
                  <HomeSmileIcon />
                </SvgIcon>
              )
            },
            {
              title: 'Clients',
              path: paths.clients.index,
              icon: (
                <SvgIcon fontSize="small">
                  <Users03 />
                </SvgIcon>
              )
            },
            {
              title: 'Schedule',
              path: paths.schedule,
              icon: (
                <SvgIcon fontSize="small">
                  <Calendar />
                </SvgIcon>
              )
            },
            {
              title: 'Jobs',
              path: paths.jobs.index,
              icon: (
                <SvgIcon fontSize="small">
                  <CheckDone01 />
                </SvgIcon>
              ),
            },
            {
              title: 'Invoices',
              path: paths.invoices,
              icon: (
                <SvgIcon fontSize="small">
                  <CurrencyDollar />
                </SvgIcon>
              )
            },
            {
              title: 'Trucks',
              path: paths.fleet,
              icon: (
                  <SvgIcon fontSize="small">
                    <Truck02 />
                  </SvgIcon>
              )
            },
          ]
        },
        {
          subheader: "CRM",
          items: [
            {
              title: "Leads",
              path: `/leads`,
              icon: (
                  <SvgIcon fontSize="small">
                    <ContactsOutlined />
                  </SvgIcon>
              ),
            }
          ]
        },
        {
          subheader: "Settings",
          items: [
            {
              title: "Organization",
              path: `/organization`,
              icon: (
                  <SvgIcon fontSize="small">
                    <Business />
                  </SvgIcon>
              ),
            }
          ]
        },
      ];
    },
    []
  );
};
