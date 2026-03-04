import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import { formatDate, getColorForUser } from '../lib/utils';
import { TEXTAREA_MAX_HEIGHT } from '../constants';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import type { NoteWithReplies, NoteWithRepliesResponse, Reply } from '../types';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [note, setNote] = useState<NoteWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const [drawerReplyId, setDrawerReplyId] = useState<string | null>(null);
  const [menuReplyId, setMenuReplyId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!id) return;

    const fetchThread = async () => {
      try {
        const { data } = await api.get<NoteWithRepliesResponse>(`/notes/${id}/replies`);
        setNote(data.note);
      } catch (err) {
        console.error('Failed to fetch thread', err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('join-thread', id);

    const handleReplyCreated = (reply: Reply) => {
      setNote((prev) => {
        if (!prev) return prev;
        if (prev.replies.some((r) => r.id === reply.id)) return prev;
        return { ...prev, replies: [...prev.replies, reply] };
      });
    };

    const handleReplyDeleted = ({ replyId }: { replyId: string }) => {
      setNote((prev) => {
        if (!prev) return prev;
        if (!prev.replies.some((r) => r.id === replyId)) return prev;
        return { ...prev, replies: prev.replies.filter((r) => r.id !== replyId) };
      });
    };

    socket.on('reply:created', handleReplyCreated);
    socket.on('reply:deleted', handleReplyDeleted);

    return () => {
      socket.emit('leave-thread', id);
      socket.off('reply:created', handleReplyCreated);
      socket.off('reply:deleted', handleReplyDeleted);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [note?.replies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/notes/${id}/replies`, { content: content.trim() });
      setContent('');
    } catch (err) {
      console.error('Failed to create reply', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!deleteReplyId) return;
    try {
      await api.delete(`/notes/${id}/replies/${deleteReplyId}`);
    } catch (err) {
      console.error('Failed to delete reply', err);
    } finally {
      setDeleteReplyId(null);
    }
  };

  const handleTouchStart = (replyId: string) => {
    longPressTimer.current = setTimeout(() => {
      setDrawerReplyId(replyId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/notes" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Note</h1>
      </div>

      {loading ? (
        <Loading />
      ) : note ? (
        <>
          {/* Original note */}
          <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-4">
            <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-line">{note.content}</p>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 block">
              {note.createdBy.name} · {formatDate(note.createdAt)}
            </span>
          </div>

          {note.replies.length > 0 && (
            <div className="divider text-xs text-neutral-400">
              {note.replies.length} {note.replies.length === 1 ? 'reply' : 'replies'}
            </div>
          )}

          {/* Replies */}
          <div className="flex-1 space-y-3 mb-4">
            {note.replies.map((reply) => {
              const isCurrentUser = user?.id === reply.createdBy.id;
              const canDelete = isCurrentUser || isAdmin;
              const color = getColorForUser(reply.createdBy.id);
              return (
                <div key={reply.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} group`}>
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <div className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center text-white text-xs font-semibold`}>
                        {reply.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium ${color.text}`}>
                        {reply.createdBy.name}
                      </span>
                    </div>
                  )}
                  <div className={`relative inline-flex ${!isCurrentUser ? 'ml-8' : ''}`}>
                    <div
                      className={`${isCurrentUser ? 'bg-[#B8B3E0] dark:bg-[#6E6A9C] text-neutral-900 dark:text-white rounded-2xl rounded-br-md' : 'bg-[#E0E0E0] dark:bg-[#3A3A3E] text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-md'} px-4 py-2.5 max-w-[75vw]`}
                      {...(canDelete ? {
                        onTouchStart: () => handleTouchStart(reply.id),
                        onTouchEnd: handleTouchEnd,
                        onTouchMove: handleTouchEnd,
                      } : {})}
                    >
                      {reply.content}
                    </div>
                    {canDelete && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isCurrentUser ? 'right-full mr-1' : 'left-full ml-1'} hidden md:block`}>
                        <button
                          onClick={() => setMenuReplyId(menuReplyId === reply.id ? null : reply.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full w-7 h-7 flex items-center justify-center border-none cursor-pointer text-neutral-500 dark:text-neutral-400 text-sm leading-none"
                        >
                          ···
                        </button>
                        {menuReplyId === reply.id && (
                          <div className={`absolute top-full mt-1 ${isCurrentUser ? 'right-0' : 'left-0'} bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 min-w-[100px]`}>
                            <button
                              onClick={() => {
                                setMenuReplyId(null);
                                setDeleteReplyId(reply.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg bg-transparent border-none cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <time className={`text-[11px] opacity-50 mt-1 ${!isCurrentUser ? 'ml-9' : 'mr-1'}`}>{formatDate(reply.createdAt)}</time>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-4 pb-6 border-t border-neutral-200 dark:border-neutral-700">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, TEXTAREA_MAX_HEIGHT) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Reply..."
              rows={1}
              style={{ maxHeight: '100px' }}
              className="textarea-chat"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="btn-action"
            >
              Send
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-20 text-neutral-400">Note not found</div>
      )}

      {/* Desktop dropdown backdrop */}
      {menuReplyId && (
        <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setMenuReplyId(null)} />
      )}

      {/* Mobile bottom drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${drawerReplyId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerReplyId(null)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-200 ease-out ${drawerReplyId ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-t-2xl px-4 pt-4 pb-8">
          <button
            onClick={() => {
              const replyId = drawerReplyId;
              setDrawerReplyId(null);
              if (replyId) setDeleteReplyId(replyId);
            }}
            className="w-full text-left px-4 py-3 text-red-500 text-base font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={() => setDrawerReplyId(null)}
            className="w-full text-left px-4 py-3 text-neutral-600 dark:text-neutral-300 text-base rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer mt-1"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Delete reply confirmation */}
      {deleteReplyId && (
        <ConfirmModal
          message="Delete this reply?"
          onConfirm={handleDeleteReply}
          onCancel={() => setDeleteReplyId(null)}
        />
      )}
    </div>
  );
}
