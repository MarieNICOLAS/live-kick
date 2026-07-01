import { Star } from 'lucide-react'
import { useFavoritesStore } from '../../stores/favoritesStore'
import type { FavoriteType } from '../../types/local'

type FavoriteButtonProps = {
  type: FavoriteType
  targetId: number | string
  label: string
}

export function FavoriteButton({ type, targetId, label }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(type, targetId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  return (
    <button
      className={isFavorite ? 'favorite-button favorite-button--active' : 'favorite-button'}
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(type, targetId)
      }}
      aria-pressed={isFavorite}
      aria-label={label}
    >
      <Star size={18} aria-hidden="true" />
    </button>
  )
}
