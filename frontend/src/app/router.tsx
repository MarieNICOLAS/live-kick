import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { BracketPage } from '../pages/public/BracketPage'
import { PublicLayout } from '../components/layout/PublicLayout'
import { CalendarPage } from '../pages/public/CalendarPage'
import { FavoritesPage } from '../pages/public/FavoritesPage'
import { GroupDetailPage } from '../pages/public/GroupDetailPage'
import { GroupsPage } from '../pages/public/GroupsPage'
import { HomePage } from '../pages/public/HomePage'
import { LegalPage } from '../pages/public/LegalPage'
import { LivePage } from '../pages/public/LivePage'
import { MatchDetailPage } from '../pages/public/MatchDetailPage'
import { NotificationsPage } from '../pages/public/NotificationsPage'
import { PlayerDetailPage } from '../pages/public/PlayerDetailPage'
import { StatsPage } from '../pages/public/StatsPage'
import { StadiumDetailPage } from '../pages/public/StadiumDetailPage'
import { StadiumsPage } from '../pages/public/StadiumsPage'
import { TeamDetailPage } from '../pages/public/TeamDetailPage'
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
        element: <LivePage />,
      },
      {
        path: 'groups',
        element: <GroupsPage />,
      },
      {
        path: 'bracket',
        element: <BracketPage />,
      },
      {
        path: 'groups/:code',
        element: <GroupDetailPage />,
      },
      {
        path: 'stadiums',
        element: <StadiumsPage />,
      },
      {
        path: 'stadiums/:id',
        element: <StadiumDetailPage />,
      },
      {
        path: 'teams',
        element: <TeamsPage />,
      },
      {
        path: 'teams/:id',
        element: <TeamDetailPage />,
      },
      {
        path: 'players/:id',
        element: <PlayerDetailPage />,
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
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'legal/:page',
        element: <LegalPage />,
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
