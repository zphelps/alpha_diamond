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
              path: paths.conversations,
              icon: (
                <SvgIcon fontSize="small">
                  <CurrencyDollar />
                </SvgIcon>
              )
            },
            {
              title: 'Trucks',
              path: paths.forms,
              icon: (
                  <SvgIcon fontSize="small">
                    <Truck02 />
                  </SvgIcon>
              )
            },
          ]
        },
        // {
        //   subheader: "My Clubs",
        //   items: (auth.user?.groupsMemberOf ?? []).filter(group => group.type === 'Club').map((group) => {
        //     return {
        //       title: group.name,
        //       path: `${paths.groups.index}/${group.id}`,
        //       icon: (
        //           <Avatar sx={{m:0, p:0, width: '32px', height: '32px'}} src={group.profileImageURL} />
        //       ),
        //     }
        //   }),
        // },
        // {
        //   subheader: "My Teams",
        //   items: (auth.user?.groupsMemberOf ?? []).filter(group => group.type === 'Team').map((group) => {
        //     return {
        //       title: group.name,
        //       path: `${paths.groups.index}/${group.id}`,
        //       icon: (
        //           <Avatar sx={{m:0, p:0, width: '32px', height: '32px'}} src={group.profileImageURL} />
        //       ),
        //     }
        //   }),
        // },
      ];
    },
    []
  );
};
