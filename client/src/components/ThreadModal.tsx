import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type { NoteWithReplies, NoteWithRepliesResponse, Reply } from '../types';

interface ThreadModalProps {
  noteId: string;
  onClose: () => void;
  onReplyCountChange: (noteId: string, count: number) => void;
}

export default function ThreadModal({ noteId, onClose, onReplyCountChange }: ThreadModalProps) {
  const { user } = useAuth();
  const [note, setNote] = useState<NoteWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch thread + socket subscription
  useEffect(() => {
    const fetchThread = async () => {
      try {
        const { data } = await api.get<NoteWithRepliesResponse>(`/notes/${noteId}/replies`);
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
    socket.emit('join-thread', noteId);

    const handleReplyCreated = (reply: Reply) => {
      setNote((prev) => {
        if (!prev) return prev;
        if (prev.replies.some((r) => r.id === reply.id)) return prev;
        const updated = { ...prev, replies: [...prev.replies, reply] };
        onReplyCountChange(noteId, updated.replies.length);
        return updated;
      });
    };

    const handleReplyDeleted = ({ replyId }: { replyId: string }) => {
      setNote((prev) => {
        if (!prev) return prev;
        if (!prev.replies.some((r) => r.id === replyId)) return prev;
        const updated = { ...prev, replies: prev.replies.filter((r) => r.id !== replyId) };
        onReplyCountChange(noteId, updated.replies.length);
        return updated;
      });
    };

    socket.on('reply:created', handleReplyCreated);
    socket.on('reply:deleted', handleReplyDeleted);

    return () => {
      socket.emit('leave-thread', noteId);
      socket.off('reply:created', handleReplyCreated);
      socket.off('reply:deleted', handleReplyDeleted);
    };
  }, [noteId, onReplyCountChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [note?.replies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/notes/${noteId}/replies`, { content: content.trim() });
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
      await api.delete(`/notes/${noteId}/replies/${deleteReplyId}`);
    } catch (err) {
      console.error('Failed to delete reply', err);
    } finally {
      setDeleteReplyId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <dialog className="modal modal-open">
        <div className="modal-box max-w-lg flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Thread</h3>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-neutral-400">Loading...</div>
          ) : note ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-1 pb-4">
                {/* Original note */}
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-neutral-900 dark:text-neutral-100">{note.content}</p>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
                    {note.createdBy.name} · {formatDate(note.createdAt)}
                  </span>
                </div>

                {note.replies.length > 0 && (
                  <div className="divider text-xs text-neutral-400">
                    {note.replies.length} {note.replies.length === 1 ? 'reply' : 'replies'}
                  </div>
                )}

                {/* Replies */}
                {note.replies.map((reply) => {
                  const isCurrentUser = user?.id === reply.createdBy.id;
                  return (
                    <div key={reply.id} className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}>
                      <div className="chat-header">
                        {reply.createdBy.name}
                        <time className="text-xs opacity-50 ml-1">{formatDate(reply.createdAt)}</time>
                      </div>
                      <div className="chat-bubble">{reply.content}</div>
                      {isCurrentUser && (
                        <div className="chat-footer">
                          <button
                            onClick={() => setDeleteReplyId(reply.id)}
                            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Reply..."
                  rows={1}
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 resize-none overflow-hidden text-sm"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-sm"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-10 text-neutral-400">Note not found</div>
          )}
        </div>
        <div className="modal-backdrop" onClick={onClose} />
      </dialog>

      {/* Delete reply confirmation */}
      {deleteReplyId && (
        <dialog className="modal modal-open" style={{ zIndex: 1000 }}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete this reply?</h3>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteReplyId(null)}>Cancel</button>
              <button
                className="btn text-white border-none"
                style={{ backgroundColor: '#a28847' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8a7339')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a28847')}
                onClick={handleDeleteReply}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteReplyId(null)} />
        </dialog>
      )}
    </>
  );
}
