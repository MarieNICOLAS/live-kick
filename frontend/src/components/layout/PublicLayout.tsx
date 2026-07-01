import { ArrowLeft } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MatchReminderScheduler } from '../football/MatchReminderScheduler'
import { Footer } from './Footer'
import { Header } from './Header'

export function PublicLayout() {
  return (
    <div className="app-layout">
      <MatchReminderScheduler />
      <Header />
      <main className="app-main">
        <BackNavigation />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function BackNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname === '/') {
    return null
  }

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <div className="back-navigation">
      <button type="button" onClick={goBack} aria-label="Revenir à la page précédente">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Retour</span>
      </button>
    </div>
  )
}
