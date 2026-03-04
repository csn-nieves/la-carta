import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { IngredientInput } from '../types';
import { GLASSWARE_OPTIONS } from '../constants';
import { extractAxiosError } from '../lib/utils';
import { useImageUpload } from '../hooks/useImageUpload';
import IngredientInputList from '../components/IngredientInput';
import ImageUpload from '../components/ImageUpload';

export default function CreateCocktail() {
  const navigate = useNavigate();
  const { fileInputRef, imagePreview, imageFile, handleImageChange, clearImage } = useImageUpload();
  const [name, setName] = useState('');
  const [glassware, setGlassware] = useState('');
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', volume: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      const { data } = await api.post('/cocktails', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/cocktails/${data.id}`);
    } catch (err: unknown) {
      setError(extractAxiosError(err, 'Failed to create cocktail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Create Cocktail</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="alert-error">{error}</div>
        )}

        <ImageUpload
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          onImageChange={handleImageChange}
          onClear={clearImage}
        />

        <div>
          <label className="form-label mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Old Fashioned"
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label mb-1">Glassware</label>
          <select
            required
            value={glassware}
            onChange={(e) => setGlassware(e.target.value)}
            className="input-field"
          >
            <option value="">Select glassware</option>
            {GLASSWARE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <IngredientInputList ingredients={ingredients} onChange={setIngredients} />

        <div>
          <label className="form-label mb-1">Directions</label>
          <textarea
            required
            rows={5}
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            placeholder="Describe how to make the cocktail..."
            className="input-field resize-vertical"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Creating...' : 'Create Cocktail'}
        </button>
      </form>
    </div>
  );
}
