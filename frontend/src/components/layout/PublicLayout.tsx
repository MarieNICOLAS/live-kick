import { Outlet } from 'react-router-dom'
import { MatchReminderScheduler } from '../football/MatchReminderScheduler'
import { Footer } from './Footer'
import { Header } from './Header'

export function PublicLayout() {
  return (
    <div className="app-layout">
      <MatchReminderScheduler />
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
