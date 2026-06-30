import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { CalendarPage } from '../pages/public/CalendarPage'
import { FavoritesPage } from '../pages/public/FavoritesPage'
import { GroupsPage } from '../pages/public/GroupsPage'
import { HomePage } from '../pages/public/HomePage'
import { MatchDetailPage } from '../pages/public/MatchDetailPage'
import { SimplePage } from '../pages/public/SimplePage'
import { StatsPage } from '../pages/public/StatsPage'
import { TeamsPage } from '../pages/public/TeamsPage'
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
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'matches',
        element: <Navigate to="/calendar" replace />,
      },
      {
        path: 'matches/:id',
        element: <MatchDetailPage />,
      },
      {
        path: 'live',
        element: <CalendarPage />,
      },
      {
        path: 'groups',
        element: <GroupsPage />,
      },
      {
        path: 'teams',
        element: <TeamsPage />,
      },
      {
        path: 'teams/:id',
        element: <SimplePage eyebrow="Equipe" title="Fiche equipe" message="La fiche detaillee equipe sera connectee au service teams dans l'etape equipes + joueurs." />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
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
