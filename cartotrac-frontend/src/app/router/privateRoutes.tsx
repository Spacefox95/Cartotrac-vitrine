import { RouteObject } from 'react-router-dom';

import AuthGuard from './guards/AuthGuard';
import AppLayout from 'shared/components/layout/AppLayout';
import DashboardPage from 'features/dashboard/pages/DashboardPage';
import ClientsListPage from 'features/clients/pages/ClientsListPage';
import QuotesListPage from 'features/quotes/pages/QuotesListPage';

const privateRoutes: RouteObject[] = [
  {
    path: '/app',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clients', element: <ClientsListPage /> },
      { path: 'quotes', element: <QuotesListPage /> },
    ],
  },
];

export default privateRoutes;