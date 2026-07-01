import { Link } from 'react-router-dom'
import footerLogo from '../../assets/logos/logo-monochrome-light.png'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={footerLogo} alt="LiveKick" />
        <p>L'intelligence du football en direct.</p>
      </div>

      <div className="footer-nav" aria-label="Informations pied de page">
        <Link to="/legal/mentions-legales">Mentions légales</Link>
        <Link to="/legal/confidentialite">Confidentialité</Link>
        <Link to="/legal/conditions-utilisation">CGU</Link>
        <span>&copy; 2026 LiveKick</span>
      </div>
    </footer>
  )
}
