import { RouteObject } from 'react-router-dom';

import AdminGuard from './guards/AdminGuard';
import AuthGuard from './guards/AuthGuard';
import AppLayout from 'shared/components/layout/AppLayout';
import DashboardPage from 'features/dashboard/pages/DashboardPage';
import DashboardContentAdminPage from 'features/admin/pages/DashboardContentAdminPage';
import UsersAdminPage from 'features/admin/pages/UsersAdminPage';
import CadastrePage from 'features/cadastre/pages/CadastrePage';
import ClientDetailsPage from 'features/clients/pages/ClientDetailsPage';
import ClientsListPage from 'features/clients/pages/ClientsListPage';
import QuoteDetailsPage from 'features/quotes/pages/QuoteDetailsPage';
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
      { path: 'cadastre', element: <CadastrePage /> },
      { path: 'clients', element: <ClientsListPage /> },
      { path: 'clients/new', element: <ClientDetailsPage /> },
      { path: 'clients/:clientId', element: <ClientDetailsPage /> },
      { path: 'clients/:clientId/edit', element: <ClientDetailsPage /> },
      { path: 'quotes', element: <QuotesListPage /> },
      { path: 'quotes/new', element: <QuoteDetailsPage /> },
      { path: 'quotes/:quoteId', element: <QuoteDetailsPage /> },
      { path: 'quotes/:quoteId/edit', element: <QuoteDetailsPage /> },
      {
        path: 'admin/users',
        element: (
          <AdminGuard>
            <UsersAdminPage />
          </AdminGuard>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <AdminGuard>
            <DashboardContentAdminPage />
          </AdminGuard>
        ),
      },
    ],
  },
];

export default privateRoutes;
