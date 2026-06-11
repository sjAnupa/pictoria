import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminPanel from '../pages/admin/AdminPanel'
import AdminRoute from '../components/auth/AdminRoute'
import GuestRoute from '../components/auth/GuestRoute'
import OptionalAuthBootstrap from '../components/auth/OptionalAuthBootstrap'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import BookDetail from '../pages/BookDetail'
import Home from '../pages/Home'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Reader from '../pages/Reader'
import Register from '../pages/Register'
import AccountPage from '../pages/account/AccountPage'
import LibraryPage from '../pages/library/LibraryPage'
import RouteShell from './RouteShell'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RouteShell />,
    children: [
      {
        path: 'login',
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        element: <OptionalAuthBootstrap />,
        children: [
          { index: true, element: <Home /> },
          { path: 'home', element: <Navigate to="/" replace /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'books/:slug', element: <BookDetail /> },
          { path: 'read/:bookId/chapter/:chapterNumber', element: <Reader /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'welcome', element: <Landing /> },
              { path: 'account', element: <AccountPage /> },
              {
                path: 'admin',
                element: (
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
])
