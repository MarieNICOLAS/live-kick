import { Link } from 'react-router-dom'
import footerLogo from '../../assets/logos/logo-monochrome-light.png'

const footerLinks = [
  { to: '/privacy', label: 'Confidentialité' },
  { to: '/terms', label: 'Conditions' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={footerLogo} alt="" />
        <strong>LiveKick</strong>
        <p>L'intelligence du football en direct. Suivez la Coupe du Monde 2026 comme jamais.</p>
      </div>

      <nav className="footer-nav" aria-label="Navigation pied de page">
        <span>&copy; 2026 LiveKick</span>
        {footerLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
