import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDateShort } from '../lib/utils';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminUser } from '../types';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ users: AdminUser[] }>('/admin/users')
      .then(({ data }) => setUsers(data.users))
      .catch((err) => console.error('Failed to fetch users', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setDeleteUserId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Admin — Users</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8">
        {users.length} {users.length === 1 ? 'user' : 'users'} registered
      </p>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {u.name}
                </span>
                {u.isAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{u.email}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Joined {formatDateShort(u.createdAt)} · {u._count.cocktails} cocktails · {u._count.notes} notes
              </p>
            </div>
            {u.id !== user?.id && (
              <button
                onClick={() => setDeleteUserId(u.id)}
                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none cursor-pointer shrink-0"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {deleteUserId && (
        <ConfirmModal
          message="Are you sure you wish to delete this user?"
          description="This will permanently remove the user and all their content."
          onConfirm={handleDelete}
          onCancel={() => setDeleteUserId(null)}
        />
      )}
    </div>
  );
}
