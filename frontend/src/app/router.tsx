import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { HomePage } from '../pages/public/HomePage'
import { MatchesPage } from '../pages/public/MatchesPage'
import { MatchDetailPage } from '../pages/public/MatchDetailPage'
import { GroupsPage } from '../pages/public/GroupsPage'
import { GroupDetailPage } from '../pages/public/GroupDetailPage'
import { BracketPage } from '../pages/public/BracketPage'
import { TeamsPage } from '../pages/public/TeamsPage'
import { TeamDetailPage } from '../pages/public/TeamDetailPage'
import { FavoritesPage } from '../pages/public/FavoritesPage'
import { NotFoundPage } from '../pages/errors/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: 'matches/:id', element: <MatchDetailPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/:code', element: <GroupDetailPage /> },
      { path: 'bracket', element: <BracketPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'teams/:id', element: <TeamDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}