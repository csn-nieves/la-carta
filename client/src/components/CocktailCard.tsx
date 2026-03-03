import { Link } from 'react-router-dom';
import type { Cocktail } from '../types';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface Props {
  cocktail: Cocktail;
  onFavoriteToggle?: () => void;
}

export default function CocktailCard({ cocktail, onFavoriteToggle }: Props) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(cocktail.isFavorited ?? false);
  const [count, setCount] = useState(cocktail.favoriteCount ?? 0);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const { data } = await api.post(`/cocktails/${cocktail.id}/favorite`);
      setFavorited(data.favorited);
      setCount((c) => (data.favorited ? c + 1 : c - 1));
      onFavoriteToggle?.();
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  return (
    <Link
      to={`/cocktails/${cocktail.id}`}
      className="block bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:-tranneutral-y-0.5 transition-all duration-200 no-underline text-inherit"
    >
      {cocktail.imageUrl ? (
        <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <img
            src={cocktail.imageUrl}
            alt={cocktail.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <span className="text-4xl grayscale">🥃</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 m-0">
            {cocktail.name}
          </h3>
          {user && (
            <button
              onClick={toggleFavorite}
              className="shrink-0 text-lg bg-transparent border-none cursor-pointer p-1"
              aria-label={favorited ? 'Unfavorite' : 'Favorite'}
            >
              {favorited ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{cocktail.glassware}</span>
          <span>·</span>
          <span>{cocktail.ingredients.length} ingredients</span>
          {count > 0 && (
            <>
              <span>·</span>
              <span>{count} ♥</span>
            </>
          )}
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 m-0">
          by {cocktail.createdBy.name}
        </p>
      </div>
    </Link>
  );
}
