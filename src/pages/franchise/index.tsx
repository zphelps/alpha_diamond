import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { subDays, subHours, subMinutes, subMonths } from 'date-fns';
import { Box, Container, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import {Seo} from "../../components/seo.tsx";
import {FranchiseGeneralSettings} from "../../sections/franchise/franchise-general-settings.tsx";
import {FranchiseTeamSettings} from "../../sections/franchise/franchise-team-settings.tsx";

const now = new Date();

const tabs = [
  { label: 'General', value: 'general' },
  { label: 'Team', value: 'team' },
  { label: 'Notifications', value: 'notifications' },
];

export const FranchiseSettings = () => {
  const [currentTab, setCurrentTab] = useState<string>('general');

  const handleTabsChange = useCallback(
    (event: ChangeEvent<{}>, value: string): void => {
      setCurrentTab(value);
    },
    []
  );

  return (
    <>
      <Seo title="Franchise Settings" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">
              Your Franchise
            </Typography>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                  />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>
          {currentTab === 'general' && (
            <FranchiseGeneralSettings
              avatar={''}
              email={''}
              name={''}
            />
          )}
          {currentTab === 'team' && (
            <FranchiseTeamSettings
              members={[
                {
                  avatar: '/assets/avatars/avatar-cao-yu.png',
                  email: 'japple@zachphelps.com',
                  name: 'Johnny Appleseed',
                  role: 'Owner'
                },
                {
                  avatar: '/assets/avatars/avatar-siegbert-gottfried.png',
                  email: 'michael.scarn@goldenface.biz',
                  name: 'Michael Scarn',
                  role: 'Driver'
                }
              ]}
            />
          )}
          {/*{currentTab === 'notifications' && <AccountNotificationsSettings />}*/}
          {/*{currentTab === 'security' && (*/}
          {/*  <AccountSecuritySettings*/}
          {/*    loginEvents={[*/}
          {/*      {*/}
          {/*        id: '1bd6d44321cb78fd915462fa',*/}
          {/*        createdAt: subDays(subHours(subMinutes(now, 5), 7), 1).getTime(),*/}
          {/*        ip: '95.130.17.84',*/}
          {/*        type: 'Credential login',*/}
          {/*        userAgent: 'Chrome, Mac OS 10.15.7'*/}
          {/*      },*/}
          {/*      {*/}
          {/*        id: 'bde169c2fe9adea5d4598ea9',*/}
          {/*        createdAt: subDays(subHours(subMinutes(now, 25), 9), 1).getTime(),*/}
          {/*        ip: '95.130.17.84',*/}
          {/*        type: 'Credential login',*/}
          {/*        userAgent: 'Chrome, Mac OS 10.15.7'*/}
          {/*      }*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*)}*/}
        </Container>
      </Box>
    </>
  );
};
