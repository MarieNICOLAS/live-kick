import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'

export function NotFoundPage() {
  return (
    <section className="page-section">
      <ErrorState
        title="Page introuvable"
        message="La page demandée n'existe pas ou a été déplacée."
        action={
          <Button as={Link} to="/">
            Retour à l'accueil
          </Button>
        }
      />
    </section>
  )
}
