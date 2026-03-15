import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { formatDateShort } from '../lib/utils';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';
import { StarDisplay } from './Bourbons';
import type { WineSummary } from '../types';

export default function Wines() {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ wines: WineSummary[] }>('/wines')
      .then(({ data }) => setWines(data.wines))
      .catch((err) => console.error('Failed to fetch wines', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Wine Saturdays</h1>
      </div>

      <button
        onClick={() => navigate('/tasks/wines/new')}
        className="btn-primary mb-6 w-full"
      >
        Add Wine
      </button>

      {loading ? (
        <Loading />
      ) : wines.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">No wines added yet</div>
      ) : (
        <div className="space-y-3">
          {wines.map((wine) => (
            <button
              key={wine.id}
              onClick={() => navigate(`/tasks/wines/${wine.id}`)}
              className="w-full text-left p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{wine.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{wine.locationPurchased}</p>
                </div>
                <div className="shrink-0 text-right">
                  {wine.averageRating !== null ? (
                    <div className="flex flex-col items-end gap-1">
                      <StarDisplay rating={wine.averageRating} size={14} />
                      <span className="text-xs text-neutral-400">{wine.ratingCount} {wine.ratingCount === 1 ? 'rating' : 'ratings'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">No ratings</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Added by {wine.createdBy.name} · {formatDateShort(wine.createdAt)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
