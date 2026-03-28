import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatDate } from '../lib/utils';
import { useAutoGrowTextarea } from '../hooks/useAutoGrowTextarea';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import GiphyPicker from '../components/GiphyPicker';
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
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [giphyUrl, setGiphyUrl] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const { ref: textareaRef, onChangeGrow } = useAutoGrowTextarea(content);
  const { fileInputRef, imagePreview, imageFile, handleImageChange, clearImage } = useImageUpload();

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

  const clearGiphy = () => setGiphyUrl(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearGiphy();
    handleImageChange(e);
  };

  const handleGiphySelect = (url: string) => {
    clearImage();
    setGiphyUrl(url);
    setShowGiphyPicker(false);
  };

  const clearAllMedia = () => {
    clearImage();
    clearGiphy();
  };

  const hasMedia = !!imageFile || !!giphyUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !hasMedia) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        if (content.trim()) formData.append('content', content.trim());
        const { data } = await api.post<{ note: Note }>('/notes', formData);
        setNotes((prev) => [data.note, ...prev]);
      } else if (giphyUrl) {
        const { data } = await api.post<{ note: Note }>('/notes', {
          content: content.trim() || undefined,
          imageUrl: giphyUrl,
        });
        setNotes((prev) => [data.note, ...prev]);
      } else {
        const { data } = await api.post<{ note: Note }>('/notes', { content: content.trim() });
        setNotes((prev) => [data.note, ...prev]);
      }
      setContent('');
      clearAllMedia();
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

  const previewUrl = imagePreview || giphyUrl;

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Note Log</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6">
        Share updates with the team — 86'd items, low stock, shift notes
      </p>

      {loading ? (
        <Loading />
      ) : notes.length > 0 ? (
        <div className="flex-1 space-y-3 pb-12">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {note.imageUrl && (
                <img
                  src={note.imageUrl}
                  alt=""
                  loading="lazy"
                  className="max-w-full rounded-lg object-cover mb-2"
                  style={{ maxHeight: '200px' }}
                />
              )}
              {note.content && (
                <p className="text-neutral-900 dark:text-neutral-100 mb-2 whitespace-pre-line">{note.content}</p>
              )}
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

      <form onSubmit={handleSubmit} className="sticky bottom-16 md:bottom-0 z-10 pt-4 pb-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950">
        {previewUrl && (
          <div className="relative inline-block mb-2 ml-12">
            <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
            <button
              type="button"
              onClick={clearAllMedia}
              className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-full flex items-center justify-center text-xs font-bold border-none cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu((v) => !v)}
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all ${showAttachMenu ? 'rotate-45' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {showAttachMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 min-w-[120px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAttachMenu(false); setShowGiphyPicker(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-bold text-xs w-4 text-center">GIF</span>
                    GIF
                  </button>
                </div>
              </>
            )}
          </div>
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
            disabled={!content.trim() && !hasMedia}
            className="btn-action"
          >
            Add
          </button>
        </div>
      </form>

      {deleteNoteId && (
        <ConfirmModal
          message="Are you sure you wish to delete this note?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteNoteId(null)}
        />
      )}

      {showGiphyPicker && (
        <GiphyPicker
          onSelect={handleGiphySelect}
          onClose={() => setShowGiphyPicker(false)}
        />
      )}
    </div>
  );
}
