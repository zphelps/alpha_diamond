import {Suspense} from 'react';
import type {RouteObject} from 'react-router';
import {Outlet} from "react-router-dom";
import {Layout as DashboardLayout} from '../layouts/dashboard';
import ClientListPage from "../pages/clients/list.tsx";
import {ClientDetailsPage} from "../pages/clients/detail.tsx";
import JobListPage from "../pages/jobs/list.tsx";
import {JobDetailsPage} from "../pages/jobs/detail.tsx";
import {ServiceDetailsPage} from "../pages/services/detail.tsx";
import {CreateJobPage} from "../pages/jobs/create.tsx";
import {SchedulePage} from "../pages/schedule";
import {HomePage} from "../pages/home";
import {FleetPage} from "../pages/trucks/fleet.tsx";
import {InvoicesPage} from "../pages/invoices/list.tsx";
import {InvoiceDetailsPage} from "../pages/invoices/detail.tsx";
import {InvoiceEditPage} from "../pages/invoices/edit.tsx";
import {CreateInvoicePage} from "../pages/invoices/create.tsx";
import {CreateClientPage} from "../pages/clients/create.tsx";

export const dashboardRoutes: RouteObject[] = [
    {
        path: '/',
        element: (
            <DashboardLayout>
                <Suspense>
                    <Outlet/>
                </Suspense>
            </DashboardLayout>
        ),
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'clients',
                children: [
                    {
                        index: true,
                        element: <ClientListPage />
                    },
                    {
                        path: ':clientID/:tab',
                        element: <ClientDetailsPage />
                    },
                    {
                        path: ':clientID',
                        element: <ClientDetailsPage />
                    },
                    {
                        path: 'create',
                        element: <CreateClientPage />
                    }
                ]
            },
            {
                path: 'jobs',
                children: [
                    {
                        index: true,
                        element: <JobListPage />
                    },
                    {
                        path: ':jobID',
                        element: <JobDetailsPage />
                    },
                    {
                        path: 'create',
                        element: <CreateJobPage />
                    }
                ]
            },
            {
                path: 'schedule',
                children: [
                    {
                        index: true,
                        element: <SchedulePage />
                    },
                ]
            },
            {
                path: 'services',
                children: [
                    // {
                    //     index: true,
                    //     element: <JobListPage />
                    // },
                    {
                        path: ':serviceID',
                        element: <ServiceDetailsPage />
                    }
                ]
            },
            {
                path: 'fleet',
                children: [
                    {
                        index: true,
                        element: <FleetPage />
                    }
                ]
            },
            {
                path: 'invoices',
                children: [
                    {
                        index: true,
                        element: <InvoicesPage/>
                    },
                    {
                        path: ':invoiceId',
                        element: <InvoiceDetailsPage />
                    },
                    {
                        path: ':invoiceId/edit',
                        element: <InvoiceEditPage />
                    },
                    {
                        path: 'create',
                        element: <CreateInvoicePage />
                    }
                ]
            },
            // {
            //     path: 'conversations',
            //     element: <Conversations />
            // },
            // {
            //     path: 'forms',
            //     children: [
            //         {
            //             index: true,
            //             element: <Forms />
            //         },
            //     ]
            // },
            // {
            //     path: 'payments',
            //     children: [
            //         {
            //             index: true,
            //             element: <PaymentsList/>
            //         }
            //     ]
            // },
            // {
            //     path: 'files',
            //     children: [
            //         {
            //             index: true,
            //             element: <div>Files</div>
            //         }
            //     ]
            // },
            // {
            //     path: 'settings',
            //     element: <Account />
            // },
        ]
    }
];
