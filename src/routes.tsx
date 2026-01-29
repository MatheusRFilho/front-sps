import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { AutoRedirect } from './components/AutoRedirect/AutoRedirect';

import Users from './pages/Users';
import UserEdit, { userLoader } from './pages/UserEdit';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NoAccess from './pages/NoAccess';

const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AutoRedirect />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'users/:userId',
        element: <UserEdit />,
        loader: userLoader,
      },
      {
        path: 'no-access',
        element: <NoAccess />,
      },
    ],
  },
]);

export default router;
