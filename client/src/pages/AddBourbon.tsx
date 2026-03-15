import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { extractAxiosError } from '../lib/utils';
import BackButton from '../components/BackButton';

export default function AddBourbon() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [locationPurchased, setLocationPurchased] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/bourbons', { name, locationPurchased });
      navigate(`/tasks/bourbons/${data.bourbon.id}`);
    } catch (err: unknown) {
      setError(extractAxiosError(err, 'Failed to add bourbon'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks/bourbons" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Add Bourbon</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="alert-error">{error}</div>}

        <div>
          <label className="form-label mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Buffalo Trace"
            className="input-field"
          />
        </div>

        <div>
          <label className="form-label mb-1">Where Purchased</label>
          <input
            type="text"
            required
            value={locationPurchased}
            onChange={(e) => setLocationPurchased(e.target.value)}
            placeholder="e.g. Total Wine, Costco..."
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Bourbon'}
        </button>
      </form>
    </div>
  );
}
