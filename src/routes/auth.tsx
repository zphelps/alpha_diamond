import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';
import { GuestGuard } from '../guards/guest-guard';
import {AuthLayout} from "../layouts/auth/AuthLayout";

// Firebase
const SupabaseLoginPage = lazy(() => import('../pages/auth/login'));
// const FirebaseRegisterPage = lazy(() => import('../pages/auth/register'));

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
        <GuestGuard>
          <AuthLayout>
            <Outlet />
          </AuthLayout>
        </GuestGuard>
    ),
    children: [
      {
        path: 'login',
        element: <SupabaseLoginPage />
      },
      // {
      //   path: 'register',
      //   element: <FirebaseRegisterPage />
      // }
    ]
  }
];
