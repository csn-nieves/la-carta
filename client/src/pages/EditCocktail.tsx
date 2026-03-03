import { useState, useEffect, useRef } from 'react';
import type { SubmitEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import type { Cocktail, IngredientInput } from '../types';
import IngredientInputList from '../components/IngredientInput';

export default function EditCocktail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [glassware, setGlassware] = useState('');
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', volume: '' }]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get<Cocktail>(`/cocktails/${id}`)
      .then(({ data }) => {
        setName(data.name);
        setGlassware(data.glassware);
        setDirections(data.directions);
        setIngredients(data.ingredients.map((i) => ({ name: i.name, volume: i.volume })));
        if (data.imageUrl) setImagePreview(data.imageUrl);
      })
      .catch(() => navigate('/'))
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validIngredients = ingredients.filter((i) => i.name && i.volume);
    if (validIngredients.length === 0) {
      setError('At least one ingredient is required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('glassware', glassware);
      formData.append('directions', directions);
      formData.append('ingredients', JSON.stringify(validIngredients));
      if (imageFile) formData.append('image', imageFile);

      await api.put(`/cocktails/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/cocktails/${id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error || 'Failed to update cocktail');
      } else {
        setError('Failed to update cocktail');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20 text-neutral-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Edit Cocktail</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Photo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="text-neutral-400">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm">Tap to add a photo</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Glassware</label>
          <select
            required
            value={glassware}
            onChange={(e) => setGlassware(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm"
          >
            <option value="">Select glassware</option>
            <option value="Collins Glass">Collins Glass</option>
            <option value="Coupe">Coupe</option>
            <option value="Martini Glass">Martini Glass</option>
            <option value="Nick and Norah">Nick and Norah</option>
            <option value="Rocks Glass">Rocks Glass</option>
            <option value="Snifter">Snifter</option>
            <option value="Wine Glass">Wine Glass</option>
          </select>
        </div>

        <IngredientInputList ingredients={ingredients} onChange={setIngredients} />

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Directions</label>
          <textarea
            required
            rows={5}
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm resize-vertical"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg font-medium border-none cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
