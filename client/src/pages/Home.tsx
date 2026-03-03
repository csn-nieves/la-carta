import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import type { CocktailsResponse } from '../types';
import CocktailCard from '../components/CocktailCard';

export default function Home() {
  const [data, setData] = useState<CocktailsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'recent'>('name');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCocktails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', sort });
      if (search) params.set('search', search);
      const { data } = await api.get<CocktailsResponse>(`/cocktails?${params}`);
      setData(data);
    } catch (err) {
      console.error('Failed to fetch cocktails', err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => {
    fetchCocktails();
  }, [fetchCocktails]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Cocktail Recipes
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          Discover and save your favorite cocktail recipes
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search cocktails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm"
          />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as 'name' | 'recent'); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm"
          >
            <option value="name">A–Z</option>
            <option value="recent">Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-400">Loading...</div>
      ) : data && data.cocktails.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.cocktails.map((cocktail) => (
              <CocktailCard key={cocktail.id} cocktail={cocktail} onFavoriteToggle={fetchCocktails} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg text-sm border-none cursor-pointer ${p === page
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🍹</p>
          <p className="text-neutral-500 dark:text-neutral-400">
            {search ? 'No cocktails match your search' : 'No cocktails yet. Be the first to create one!'}
          </p>
        </div>
      )}
    </div>
  );
}
