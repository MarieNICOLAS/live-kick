import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { HomePage } from '../pages/public/HomePage'
import { MatchesPage } from '../pages/public/MatchesPage'
import { GroupsPage } from '../pages/public/GroupsPage'
import { BracketPage } from '../pages/public/BracketPage'
import { TeamsPage } from '../pages/public/TeamsPage'
import { FavoritesPage } from '../pages/public/FavoritesPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'bracket', element: <BracketPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}