import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import type { Cocktail } from '../types';
import CocktailCard from '../components/CocktailCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function Favorites() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await api.get<{ cocktails: Cocktail[] }>('/cocktails/favorites');
      setCocktails(data.cocktails);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="pb-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Your Favorites</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8">Cocktails you've saved</p>

      {loading ? (
        <Loading />
      ) : cocktails.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cocktails.map((cocktail) => (
            <CocktailCard key={cocktail.id} cocktail={cocktail} onFavoriteToggle={fetchFavorites} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🖤"
          message="No favorites yet. Browse cocktails and tap the heart to save them!"
        />
      )}
    </div>
  );
}
