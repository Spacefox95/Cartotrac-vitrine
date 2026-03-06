import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;