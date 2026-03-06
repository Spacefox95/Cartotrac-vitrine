import { RouteObject } from 'react-router-dom';

import PublicLayout from 'shared/components/layout/PublicLayout';
import HomePage from 'features/public/pages/HomePage';
import ContactPage from 'features/public/pages/ContactPage';
import LoginPage from 'features/auth/pages/LoginPage';

const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
];

export default publicRoutes;