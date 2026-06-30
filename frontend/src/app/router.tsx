import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { HomePage } from '../pages/public/HomePage'
import { MatchesPage } from '../pages/public/MatchesPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'matches',
        element: <MatchesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
