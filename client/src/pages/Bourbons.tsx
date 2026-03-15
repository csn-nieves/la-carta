import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { formatDateShort } from '../lib/utils';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';
import type { BourbonSummary } from '../types';

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={star <= Math.round(rating) ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export { StarDisplay };

export default function Bourbons() {
  const navigate = useNavigate();
  const [bourbons, setBourbons] = useState<BourbonSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ bourbons: BourbonSummary[] }>('/bourbons')
      .then(({ data }) => setBourbons(data.bourbons))
      .catch((err) => console.error('Failed to fetch bourbons', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Bourbon Saturdays</h1>
      </div>

      <button
        onClick={() => navigate('/tasks/bourbons/new')}
        className="btn-primary mb-6 w-full"
      >
        Add Bourbon
      </button>

      {loading ? (
        <Loading />
      ) : bourbons.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">No bourbons added yet</div>
      ) : (
        <div className="space-y-3">
          {bourbons.map((bourbon) => (
            <button
              key={bourbon.id}
              onClick={() => navigate(`/tasks/bourbons/${bourbon.id}`)}
              className="w-full text-left p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{bourbon.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{bourbon.locationPurchased}</p>
                </div>
                <div className="shrink-0 text-right">
                  {bourbon.averageRating !== null ? (
                    <div className="flex flex-col items-end gap-1">
                      <StarDisplay rating={bourbon.averageRating} size={14} />
                      <span className="text-xs text-neutral-400">{bourbon.ratingCount} {bourbon.ratingCount === 1 ? 'rating' : 'ratings'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">No ratings</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Added by {bourbon.createdBy.name} · {formatDateShort(bourbon.createdAt)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
