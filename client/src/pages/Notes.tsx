import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import { useAutoGrowTextarea } from '../hooks/useAutoGrowTextarea';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import type { Note, NotesResponse } from '../types';

export default function Notes() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState((location.state as { prefill?: string })?.prefill ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const { ref: textareaRef, onChangeGrow } = useAutoGrowTextarea(content);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await api.get<NotesResponse>('/notes');
      setNotes(data.notes);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post<{ note: Note }>('/notes', { content: content.trim() });
      setNotes((prev) => [data.note, ...prev]);
      setContent('');
    } catch (err) {
      console.error('Failed to create note', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteNoteId) return;
    try {
      await api.delete(`/notes/${deleteNoteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== deleteNoteId));
    } catch (err) {
      console.error('Failed to delete note', err);
    } finally {
      setDeleteNoteId(null);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Note Log</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6">
        Share updates with the team — 86'd items, low stock, shift notes
      </p>

      {loading ? (
        <Loading />
      ) : notes.length > 0 ? (
        <div className="flex-1 space-y-3 mb-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <p className="text-neutral-900 dark:text-neutral-100 mb-2 whitespace-pre-line">{note.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {note.createdBy.name} · {formatDate(note.createdAt)}
                </span>
                <div className="flex items-center gap-3">
                  {note._count?.replies ? (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {note._count.replies} {note._count.replies === 1 ? 'reply' : 'replies'}
                    </span>
                  ) : null}
                  {(user?.id === note.createdBy.id || isAdmin) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteNoteId(note.id); }}
                      className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-neutral-400 dark:text-neutral-500">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-neutral-500 dark:text-neutral-400">
              No notes yet. Add one to share with the team!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-4 pb-6 border-t border-neutral-200 dark:border-neutral-700">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onChangeGrow(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Add a note..."
          rows={1}
          style={{ maxHeight: '100px' }}
          className="textarea-chat"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="btn-action"
        >
          Add
        </button>
      </form>

      {deleteNoteId && (
        <ConfirmModal
          message="Are you sure you wish to delete this note?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteNoteId(null)}
        />
      )}
    </div>
  );
}
