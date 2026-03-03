import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import type { Cocktail } from '../types';
import { useAuth } from '../context/AuthContext';

export default function CocktailDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    api.get<Cocktail>(`/cocktails/${id}`)
      .then(({ data }) => {
        setCocktail(data);
        setFavorited(data.isFavorited ?? false);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleFavorite = async () => {
    if (!user || !cocktail) return;
    const { data } = await api.post(`/cocktails/${cocktail.id}/favorite`);
    setFavorited(data.favorited);
  };

  const handleDelete = async () => {
    if (!cocktail) return;
    await api.delete(`/cocktails/${cocktail.id}`);
    setShowDeleteModal(false);
    navigate('/');
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Loading...</div>;
  if (!cocktail) return <div className="text-center py-20 text-neutral-400">Cocktail not found</div>;

  const isOwner = user?.id === cocktail.createdById;

  return (
    <>
    <div className="max-w-2xl mx-auto pb-12">
      {cocktail.imageUrl ? (
        <div className="max-w-sm mx-auto rounded-xl overflow-hidden mb-6 aspect-square bg-neutral-100 dark:bg-neutral-800">
          <img
            src={cocktail.imageUrl}
            alt={cocktail.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="max-w-sm mx-auto rounded-xl mb-6 aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <span className="text-6xl grayscale">🥃</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 m-0">{cocktail.name}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {cocktail.glassware} · by {cocktail.createdBy.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={toggleFavorite}
              className="text-2xl bg-transparent border-none cursor-pointer p-2"
              aria-label={favorited ? 'Unfavorite' : 'Favorite'}
            >
              {favorited ? '❤️' : '🤍'}
            </button>
          )}
          {(isOwner || isAdmin) && (
            <>
              <Link
                to={`/cocktails/${cocktail.id}/edit`}
                className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg no-underline hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg border-none cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 mt-0">Ingredients</h2>
        <ul className="space-y-2 list-none p-0 m-0">
          {cocktail.ingredients.map((ing) => (
            <li key={ing.id} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <span className="text-neutral-400 dark:text-neutral-500">•</span>
              <span className="font-medium">{ing.volume}</span>
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 mt-0">Directions</h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap m-0">
          {cocktail.directions}
        </p>
      </div>
    </div>

      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you wish to delete {cocktail.name}?
            </h3>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn text-white border-none" style={{ backgroundColor: '#a28847' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#8a7339'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#a28847'} onClick={handleDelete}>Delete</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)} />
        </dialog>
      )}
    </>
  );
}
