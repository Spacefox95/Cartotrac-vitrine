import { RouteObject } from 'react-router-dom';

import PublicLayout from 'shared/components/layout/PublicLayout';
import HomePage from 'features/public/pages/HomePage';
import ContactPage from 'features/public/pages/ContactPage';
import LoginPage from 'features/auth/pages/LoginPage';
import AboutPage from 'features/public/pages/AboutPage';
import ServicesPage from 'features/public/pages/ServicesPage';
import QuoteRequestPage from 'features/public/pages/QuoteRequestPage';
import LegalNoticePage from 'features/public/pages/LegalNoticePage';
import PrivacyPolicyPage from 'features/public/pages/PrivacyPolicyPage';
import CookiesPage from 'features/public/pages/CookiesPage';

const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'a-propos', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'demande-devis', element: <QuoteRequestPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'mentions-legales', element: <LegalNoticePage /> },
      { path: 'confidentialite', element: <PrivacyPolicyPage /> },
      { path: 'cookies', element: <CookiesPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
];

export default publicRoutes;
