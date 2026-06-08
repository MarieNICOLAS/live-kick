import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { ValidationDialog } from '../../components/ui/ValidationDialog'
import { FormShell } from '../../components/forms/FormShell'
import simplyLogo from '../../assets/logos/simply-logo.png'
import faviconLogo from '../../assets/logos/simply-color-logo.png'
import horizontalDarkLogo from '../../assets/logos/logo-monochrome-dark.png'
import horizontalDarkLogoAlt from '../../assets/logos/logo-monochrome-dark-2.png'
import horizontalLightLogo from '../../assets/logos/logo-monochrome-light.png'
import verticalLightLogo from '../../assets/logos/logo-vertical-lightmode.png'
import verticalDarkLogo from '../../assets/logos/logo-vertical-darkmode.png'

export function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isValidationOpen, setIsValidationOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  return (
    <section className="page-section">
      <div className="preview-heading">
        <span>Design system</span>
        <h1>LiveKick 2026</h1>
      </div>

      <section className="preview-panel">
        <h2>Logos</h2>
        <div className="logo-preview-grid">
          <figure>
            <img src={simplyLogo} alt="Logo icone LiveKick monochrome" />
            <figcaption>Icone monochrome</figcaption>
          </figure>
          <figure>
            <img src={faviconLogo} alt="Logo icone LiveKick couleur" />
            <figcaption>Icone couleur</figcaption>
          </figure>
          <figure className="logo-wide">
            <img src={horizontalDarkLogo} alt="Logo horizontal LiveKick sombre" />
            <figcaption>Horizontal dark</figcaption>
          </figure>
          <figure className="logo-wide">
            <img src={horizontalDarkLogoAlt} alt="Logo horizontal LiveKick sombre alternatif" />
            <figcaption>Horizontal dark alternatif</figcaption>
          </figure>
          <figure className="logo-wide logo-on-dark">
            <img src={horizontalLightLogo} alt="Logo horizontal LiveKick clair" />
            <figcaption>Horizontal light</figcaption>
          </figure>
          <figure>
            <img src={verticalLightLogo} alt="Logo vertical LiveKick clair" />
            <figcaption>Vertical light</figcaption>
          </figure>
          <figure className="logo-on-dark">
            <img src={verticalDarkLogo} alt="Logo vertical LiveKick sombre" />
            <figcaption>Vertical dark</figcaption>
          </figure>
        </div>
      </section>

      <section className="preview-grid" aria-label="Apercu des composants">
        <article className="preview-panel">
          <h2>Boutons</h2>
          <div className="preview-row">
            <Button>Principal</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Discret</Button>
          </div>
        </article>

        <article className="preview-panel">
          <h2>Badges</h2>
          <div className="preview-row">
            <Badge>Defaut</Badge>
            <Badge variant="live">Live</Badge>
            <Badge variant="success">Succes</Badge>
            <Badge variant="warning">Attention</Badge>
            <Badge variant="danger">Erreur</Badge>
          </div>
        </article>

        <article className="preview-panel">
          <h2>Formulaire</h2>
          <FormShell
            title="Formulaire commun"
            onSubmit={(event) => event.preventDefault()}
            actions={
              <>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
                <Button type="submit">Valider</Button>
              </>
            }
          >
            <Input label="Champ texte" name="previewText" placeholder="Saisir une valeur" />
            <Input label="Champ avec erreur" name="previewError" value="" error="Message d'erreur" readOnly />
          </FormShell>
        </article>

        <article className="preview-panel">
          <h2>Etats</h2>
          <div className="preview-stack">
            <Spinner />
            <EmptyState title="Aucun element" message="Cet espace est vide pour le moment." />
            <ErrorState title="Erreur" message="Un probleme est survenu." />
          </div>
        </article>

        <article className="preview-panel">
          <h2>Popups</h2>
          <div className="preview-row">
            <Button type="button" onClick={() => setIsModalOpen(true)}>
              Popup dynamique
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsValidationOpen(true)}>
              Validation
            </Button>
            <Button type="button" variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Supprimer
            </Button>
          </div>
        </article>
      </section>

      <Modal
        isOpen={isModalOpen}
        title="Popup dynamique"
        onClose={() => setIsModalOpen(false)}
        footer={
          <Button type="button" onClick={() => setIsModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        <p>Contenu libre et reutilisable selon le besoin.</p>
      </Modal>

      <ValidationDialog
        isOpen={isValidationOpen}
        message="Confirmer cette action ?"
        onClose={() => setIsValidationOpen(false)}
        onConfirm={() => setIsValidationOpen(false)}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Suppression"
        message="Cette action demande une confirmation."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}
