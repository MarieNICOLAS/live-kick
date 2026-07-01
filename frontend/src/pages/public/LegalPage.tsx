import { Link, Navigate, useParams } from 'react-router-dom'
import { FileText, Lock, Scale } from 'lucide-react'

type LegalPageKey = 'mentions-legales' | 'confidentialite' | 'conditions-utilisation'

type LegalSection = {
  title: string
  content: string[]
}

type LegalPageContent = {
  eyebrow: string
  title: string
  description: string
  Icon: typeof FileText
  sections: LegalSection[]
}

const legalPages: Record<LegalPageKey, LegalPageContent> = {
  'mentions-legales': {
    eyebrow: 'Informations légales',
    title: 'Mentions légales',
    description: 'Informations relatives au projet LiveKick, à son périmètre MVP et à son usage de démonstration.',
    Icon: Scale,
    sections: [
      {
        title: 'Éditeur du projet',
        content: [
          "LiveKick est une application web réalisée dans un cadre de projet pédagogique autour du suivi de la Coupe du Monde 2026.",
          "Les informations d'éditeur, d'hébergement et de contact peuvent être complétées avec les coordonnées définitives de l'équipe projet avant une mise en ligne publique.",
        ],
      },
      {
        title: 'Objet du service',
        content: [
          "LiveKick permet de consulter des matchs, scores, classements, stades, favoris locaux et prédictions générées à partir des données disponibles dans l'application.",
          "Les données affichées servent au suivi sportif et à la démonstration fonctionnelle du MVP. Elles ne constituent pas une source officielle de résultats.",
        ],
      },
      {
        title: 'Responsabilité',
        content: [
          "L'équipe projet s'efforce de présenter des informations cohérentes, lisibles et sécurisées.",
          "En cas d'indisponibilité d'un service externe ou interne, l'application peut afficher des données de secours clairement limitées au périmètre de démonstration.",
        ],
      },
    ],
  },
  confidentialite: {
    eyebrow: 'Données personnelles',
    title: 'Politique de confidentialité simplifiée',
    description: "LiveKick limite les données côté utilisateur et privilégie le stockage local pour les préférences du MVP.",
    Icon: Lock,
    sections: [
      {
        title: 'Compte utilisateur',
        content: [
          "Dans le périmètre MVP, LiveKick ne prévoit pas de compte utilisateur, pas d'authentification obligatoire et pas de profil personnel exploitable par l'application publique.",
          "Aucune page de gestion de données personnelles liée à un compte n'est donc nécessaire dans cette version.",
        ],
      },
      {
        title: 'Stockage local',
        content: [
          "Les favoris, préférences d'affichage, thème, notifications locales et rappels de match peuvent être enregistrés dans le navigateur avec localStorage.",
          "Ces informations restent sur l'appareil de l'utilisateur et peuvent être supprimées depuis les fonctionnalités de l'application ou en effaçant les données du navigateur.",
        ],
      },
      {
        title: 'Cookies et mesure d’audience',
        content: [
          "Le MVP ne met pas en place de cookies de suivi, de publicité ou d'outil de mesure d'audience.",
          "Si un outil d'analyse ou des cookies étaient ajoutés plus tard, une politique cookies dédiée et un mécanisme de consentement seraient nécessaires.",
        ],
      },
      {
        title: 'Données techniques',
        content: [
          "Le frontend consomme uniquement l'API backend LiveKick et ne contacte jamais directement la base de données, l'API football externe ou le service IA.",
          "Les erreurs affichées à l'utilisateur restent génériques afin de ne pas exposer de secret, stack trace ou détail technique sensible.",
        ],
      },
    ],
  },
  'conditions-utilisation': {
    eyebrow: 'Cadre d’utilisation',
    title: 'Conditions générales d’utilisation',
    description: "Règles simples d'utilisation du service LiveKick dans son périmètre MVP.",
    Icon: FileText,
    sections: [
      {
        title: 'Accès au service',
        content: [
          "LiveKick est accessible comme interface de consultation des matchs, équipes, stades, classements, favoris locaux et prédictions.",
          "Certaines fonctionnalités peuvent dépendre de la disponibilité du backend ou des données importées dans le projet.",
        ],
      },
      {
        title: 'Usage autorisé',
        content: [
          "L'utilisateur consulte les informations sportives à titre informatif.",
          "Les prédictions IA sont des estimations issues de règles et de données disponibles ; elles ne doivent pas être interprétées comme une certitude sportive.",
        ],
      },
      {
        title: 'Favoris et préférences',
        content: [
          "Les favoris et préférences sont propres au navigateur utilisé.",
          "Ils ne sont pas synchronisés entre appareils dans le périmètre MVP et peuvent disparaître si l'utilisateur supprime les données locales de son navigateur.",
        ],
      },
      {
        title: 'Évolutions du MVP',
        content: [
          "Ces conditions peuvent évoluer si LiveKick ajoute un compte utilisateur, une authentification, une mesure d'audience ou une mise en production publique.",
          "Toute évolution impliquant davantage de données personnelles devra être accompagnée d'une mise à jour des informations légales.",
        ],
      },
    ],
  },
}

export function LegalPage() {
  const { page } = useParams()

  if (!isLegalPageKey(page)) {
    return <Navigate to="/legal/mentions-legales" replace />
  }

  const content = legalPages[page]
  const Icon = content.Icon

  return (
    <section className="page-section">
      <div className="page-heading">
        <span>
          <Icon size={16} aria-hidden="true" />
          {content.eyebrow}
        </span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>

      <nav className="legal-tabs" aria-label="Pages légales">
        {Object.entries(legalPages).map(([key, item]) => (
          <Link className={key === page ? 'active' : undefined} to={`/legal/${key}`} key={key}>
            {item.title}
          </Link>
        ))}
      </nav>

      <article className="legal-panel">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </section>
  )
}

function isLegalPageKey(value: string | undefined): value is LegalPageKey {
  return value === 'mentions-legales' || value === 'confidentialite' || value === 'conditions-utilisation'
}
