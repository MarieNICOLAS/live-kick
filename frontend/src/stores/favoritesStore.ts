import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FavoriteType, LocalFavorite } from '../types/local'

type FavoritesState = {
  favorites: LocalFavorite[]
  isFavorite: (type: FavoriteType, targetId: string | number) => boolean
  addFavorite: (type: FavoriteType, targetId: string | number) => void
  removeFavorite: (type: FavoriteType, targetId: string | number) => void
  toggleFavorite: (type: FavoriteType, targetId: string | number) => void
  clearFavorites: () => void
}

function matchesFavorite(favorite: LocalFavorite, type: FavoriteType, targetId: string | number) {
  return favorite.type === type && favorite.targetId === String(targetId)
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isFavorite: (type, targetId) =>
        get().favorites.some((favorite) => matchesFavorite(favorite, type, targetId)),
      addFavorite: (type, targetId) =>
        set((state) => {
          if (state.favorites.some((favorite) => matchesFavorite(favorite, type, targetId))) {
            return state
          }
          return {
            favorites: [
              ...state.favorites,
              {
                type,
                targetId: String(targetId),
                addedAt: new Date().toISOString(),
              },
            ],
          }
        }),
      removeFavorite: (type, targetId) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (favorite) => !matchesFavorite(favorite, type, targetId),
          ),
        })),
      toggleFavorite: (type, targetId) => {
        if (get().isFavorite(type, targetId)) {
          get().removeFavorite(type, targetId)
        } else {
          get().addFavorite(type, targetId)
        }
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'livekick-favorites',
      partialize: ({ favorites }) => ({ favorites }),
    },
  ),
)
