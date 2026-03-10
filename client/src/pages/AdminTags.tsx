import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminTag } from '../types';

export default function AdminTags() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ tags: AdminTag[] }>('/admin/tags')
      .then(({ data }) => setTags(data.tags))
      .catch((err) => console.error('Failed to fetch tags', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { data } = await api.post('/admin/tags', { name: name.trim() });
      setTags((prev) => [...prev, { ...data, _count: { cocktails: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTagId) return;
    try {
      await api.delete(`/admin/tags/${deleteTagId}`);
      setTags((prev) => prev.filter((t) => t.id !== deleteTagId));
    } catch (err) {
      console.error('Failed to delete tag', err);
    } finally {
      setDeleteTagId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Admin — Tags</h1>

      <div className="flex gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/admin/users" className="pb-2 text-sm text-neutral-500 dark:text-neutral-400 no-underline hover:text-neutral-900 dark:hover:text-neutral-100">Users</Link>
        <span className="pb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100">Tags</span>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 max-w-xs px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
        />
        <button type="submit" disabled={creating || !name.trim()} className="btn-primary text-sm">
          {creating ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <p className="text-neutral-500 dark:text-neutral-400 mb-4 text-sm">
        {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
      </p>

      <div className="space-y-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{tag.name}</span>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {tag._count.cocktails} {tag._count.cocktails === 1 ? 'cocktail' : 'cocktails'}
              </p>
            </div>
            <button
              onClick={() => setDeleteTagId(tag.id)}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none cursor-pointer shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {deleteTagId && (
        <ConfirmModal
          message="Are you sure you wish to delete this tag?"
          description="This will remove the tag from all cocktails."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTagId(null)}
        />
      )}
    </div>
  );
}
