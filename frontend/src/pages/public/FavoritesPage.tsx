import { EmptyState } from '../../components/ui/EmptyState'
import { useFavoritesStore } from '../../stores/favoritesStore'

export function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites)

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Aucun favori"
        message="Ajoutez une équipe ou un match pour personnaliser votre suivi LiveKick."
      />
    )
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Favoris</span>
        <h1>Votre suivi</h1>
      </div>
      <div className="favorite-list">
        {favorites.map((favorite) => (
          <article className="info-panel" key={`${favorite.type}-${favorite.targetId}`}>
            <h2>{favorite.type}</h2>
            <p>Identifiant {favorite.targetId}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
