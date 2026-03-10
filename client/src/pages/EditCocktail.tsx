import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Cocktail, IngredientInput, Tag } from '../types';
import { GLASSWARE_OPTIONS } from '../constants';
import { extractAxiosError } from '../lib/utils';
import { useImageUpload } from '../hooks/useImageUpload';
import IngredientInputList from '../components/IngredientInput';
import ImageUpload from '../components/ImageUpload';
import Loading from '../components/Loading';

export default function EditCocktail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fileInputRef, imagePreview, setImagePreview, imageFile, handleImageChange, clearImage } = useImageUpload();
  const [name, setName] = useState('');
  const [glassware, setGlassware] = useState('');
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', volume: '' }]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [hadImage, setHadImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get<{ tags: Tag[] }>('/cocktails/tags')
      .then(({ data }) => setTags(data.tags))
      .catch((err) => console.error('Failed to fetch tags', err));
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  useEffect(() => {
    api.get<Cocktail>(`/cocktails/${id}`)
      .then(({ data }) => {
        setName(data.name);
        setGlassware(data.glassware);
        setDirections(data.directions);
        setIngredients(data.ingredients.map((i) => ({ name: i.name, volume: i.volume })));
        if (data.tags) setSelectedTagIds(data.tags.map((t) => t.id));
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          setHadImage(true);
        }
      })
      .catch(() => navigate('/'))
      .finally(() => setFetching(false));
  }, [id, navigate, setImagePreview]);

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
      formData.append('tagIds', JSON.stringify(selectedTagIds));
      if (imageFile) formData.append('image', imageFile);
      if (hadImage && !imagePreview && !imageFile) formData.append('removeImage', 'true');

      await api.put(`/cocktails/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/cocktails/${id}`);
    } catch (err: unknown) {
      setError(extractAxiosError(err, 'Failed to update cocktail'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto pb-14 md:pb-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Edit Cocktail</h1>
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

        {tags.length > 0 && (
          <div>
            <label className="form-label mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border-none cursor-pointer transition-colors ${selectedTagIds.includes(tag.id)
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <IngredientInputList ingredients={ingredients} onChange={setIngredients} />

        <div>
          <label className="form-label mb-1">Directions</label>
          <textarea
            required
            rows={5}
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            className="input-field resize-vertical"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
