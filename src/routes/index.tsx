import type { RouteObject } from 'react-router';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

export const routes: RouteObject[] = [
  ...authRoutes,
  ...dashboardRoutes,
];
