import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'

export function NotFoundPage() {
  return (
    <section className="page-section">
      <ErrorState
        title="Page introuvable"
        message="La page demandee n'existe pas ou a ete deplacee."
        action={
          <Button as={Link} to="/">
            Retour a l'accueil
          </Button>
        }
      />
    </section>
  )
}
