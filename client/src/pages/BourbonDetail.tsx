import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, extractAxiosError, getColorForUser } from '../lib/utils';
import Loading from '../components/Loading';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';
import { StarDisplay } from './Bourbons';
import type { BourbonDetail as BourbonDetailType, BourbonRating, BourbonReviewReply } from '../types';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="bg-transparent border-none cursor-pointer p-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill={star <= value ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={star <= value ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600'}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function BourbonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [bourbon, setBourbon] = useState<BourbonDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  // Rating form
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Reply form
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Delete
  const [deleteBourbonConfirm, setDeleteBourbonConfirm] = useState(false);
  const [deleteRatingId, setDeleteRatingId] = useState<string | null>(null);
  const [deleteReplyInfo, setDeleteReplyInfo] = useState<{ ratingId: string; replyId: string } | null>(null);

  // Long-press & menu for replies (matching NoteDetail pattern)
  const [drawerReplyInfo, setDrawerReplyInfo] = useState<{ ratingId: string; replyId: string } | null>(null);
  const [menuReplyId, setMenuReplyId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchBourbon = async () => {
    try {
      const { data } = await api.get<{ bourbon: BourbonDetailType }>(`/bourbons/${id}`);
      setBourbon(data.bourbon);
    } catch (err) {
      console.error('Failed to fetch bourbon', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBourbon();
  }, [id]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      setRatingError('Please select a rating');
      return;
    }
    setRatingError('');
    setSubmittingRating(true);

    try {
      await api.post(`/bourbons/${id}/ratings`, {
        stars,
        review: review.trim() || undefined,
      });
      setStars(0);
      setReview('');
      fetchBourbon();
    } catch (err: unknown) {
      setRatingError(extractAxiosError(err, 'Failed to submit rating'));
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleSubmitReply = async (ratingId: string) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);

    try {
      await api.post(`/bourbons/${id}/ratings/${ratingId}/replies`, {
        content: replyContent.trim(),
      });
      setReplyContent('');
      setReplyingToId(null);
      fetchBourbon();
    } catch (err) {
      console.error('Failed to submit reply', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteBourbon = async () => {
    try {
      await api.delete(`/bourbons/${id}`);
      navigate('/tasks/bourbons');
    } catch (err) {
      console.error('Failed to delete bourbon', err);
    } finally {
      setDeleteBourbonConfirm(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!deleteRatingId) return;
    try {
      await api.delete(`/bourbons/${id}/ratings/${deleteRatingId}`);
      fetchBourbon();
    } catch (err) {
      console.error('Failed to delete rating', err);
    } finally {
      setDeleteRatingId(null);
    }
  };

  const handleDeleteReply = async () => {
    if (!deleteReplyInfo) return;
    try {
      await api.delete(`/bourbons/${id}/ratings/${deleteReplyInfo.ratingId}/replies/${deleteReplyInfo.replyId}`);
      fetchBourbon();
    } catch (err) {
      console.error('Failed to delete reply', err);
    } finally {
      setDeleteReplyInfo(null);
    }
  };

  const handleTouchStart = (ratingId: string, replyId: string) => {
    longPressTimer.current = setTimeout(() => {
      setDrawerReplyInfo({ ratingId, replyId });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const canDeleteBourbon = bourbon && (bourbon.createdBy.id === user?.id || isAdmin);
  const hasRated = bourbon?.userRating !== null;

  return (
    <div className="pb-16 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks/bourbons" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Bourbon</h1>
      </div>

      {loading ? (
        <Loading />
      ) : bourbon ? (
        <>
          {/* Bourbon info */}
          <div className="p-5 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{bourbon.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-neutral-600 dark:text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{bourbon.locationPurchased}</span>
            </div>
            {bourbon.averageRating !== null && (
              <div className="flex items-center gap-2 mt-3">
                <StarDisplay rating={bourbon.averageRating} size={18} />
                <span className="text-sm text-neutral-500">
                  {bourbon.averageRating.toFixed(1)} ({bourbon.ratingCount} {bourbon.ratingCount === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-neutral-400">
                Added by {bourbon.createdBy.name}
              </span>
              {canDeleteBourbon && (
                <button
                  onClick={() => setDeleteBourbonConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Rating form (only if user hasn't rated yet) */}
          {!hasRated && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Rate this bourbon</h3>
              <form onSubmit={handleSubmitRating} className="space-y-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                {ratingError && <div className="alert-error">{ratingError}</div>}
                <StarInput value={stars} onChange={setStars} />
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Leave a review (optional)..."
                  rows={3}
                  className="input-field resize-vertical"
                />
                <button type="submit" disabled={submittingRating || stars === 0} className="btn-primary">
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Reviews ({bourbon.ratings.length})
            </h3>
            {bourbon.ratings.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">No reviews yet</div>
            ) : (
              <div className="space-y-4">
                {bourbon.ratings.map((rating: BourbonRating) => {
                  const color = getColorForUser(rating.createdBy.id);
                  const canDelete = rating.createdBy.id === user?.id || isAdmin;
                  return (
                    <div key={rating.id} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${color.bg} flex items-center justify-center text-white text-xs font-semibold`}>
                            {rating.createdBy.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${color.text}`}>{rating.createdBy.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarDisplay rating={rating.stars} size={14} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <time className="text-xs text-neutral-400">{formatDate(rating.createdAt)}</time>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteRatingId(rating.id)}
                              className="text-xs text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      {rating.review && (
                        <p className="text-neutral-700 dark:text-neutral-300 mt-2 whitespace-pre-line">{rating.review}</p>
                      )}

                      {/* Replies to this review */}
                      {rating.replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {rating.replies.map((reply: BourbonReviewReply) => {
                            const isCurrentUser = user?.id === reply.createdBy.id;
                            const canDeleteReply = isCurrentUser || isAdmin;
                            const replyColor = getColorForUser(reply.createdBy.id);
                            return (
                              <div key={reply.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} group`}>
                                {!isCurrentUser && (
                                  <div className="flex items-center gap-2 mb-2 ml-1">
                                    <div className={`w-6 h-6 rounded-full ${replyColor.bg} flex items-center justify-center text-white text-xs font-semibold`}>
                                      {reply.createdBy.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-sm font-medium ${replyColor.text}`}>
                                      {reply.createdBy.name}
                                    </span>
                                  </div>
                                )}
                                <div className={`relative inline-flex ${!isCurrentUser ? 'ml-8' : ''}`}>
                                  <div
                                    className={`${isCurrentUser ? 'bg-[#B8B3E0] dark:bg-[#6E6A9C] text-neutral-900 dark:text-white rounded-2xl rounded-br-md' : 'bg-[#E0E0E0] dark:bg-[#3A3A3E] text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-md'} px-4 py-2.5 max-w-[75vw] overflow-hidden`}
                                    {...(canDeleteReply ? {
                                      onTouchStart: () => handleTouchStart(rating.id, reply.id),
                                      onTouchEnd: handleTouchEnd,
                                      onTouchMove: handleTouchEnd,
                                    } : {})}
                                  >
                                    <span>{reply.content}</span>
                                  </div>
                                  {canDeleteReply && (
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
                                              setDeleteReplyInfo({ ratingId: rating.id, replyId: reply.id });
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
                        </div>
                      )}

                      {/* Reply button / form */}
                      {replyingToId === rating.id ? (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="flex items-end gap-2">
                            <textarea
                              value={replyContent}
                              onChange={(e) => {
                                setReplyContent(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmitReply(rating.id);
                                }
                              }}
                              placeholder="Reply..."
                              rows={1}
                              style={{ maxHeight: '100px' }}
                              className="textarea-chat"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSubmitReply(rating.id)}
                              disabled={!replyContent.trim() || submittingReply}
                              className="btn-action"
                            >
                              Send
                            </button>
                          </div>
                          <button
                            onClick={() => { setReplyingToId(null); setReplyContent(''); }}
                            className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyingToId(rating.id); setReplyContent(''); }}
                          className="mt-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-neutral-400">Bourbon not found</div>
      )}

      {/* Delete confirmations */}
      {deleteBourbonConfirm && (
        <ConfirmModal
          message="Delete this bourbon?"
          description="This will also delete all ratings and reviews."
          onConfirm={handleDeleteBourbon}
          onCancel={() => setDeleteBourbonConfirm(false)}
        />
      )}
      {deleteRatingId && (
        <ConfirmModal
          message="Delete this rating?"
          onConfirm={handleDeleteRating}
          onCancel={() => setDeleteRatingId(null)}
        />
      )}
      {deleteReplyInfo && (
        <ConfirmModal
          message="Delete this reply?"
          onConfirm={handleDeleteReply}
          onCancel={() => setDeleteReplyInfo(null)}
        />
      )}

      {/* Desktop dropdown backdrop */}
      {menuReplyId && (
        <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setMenuReplyId(null)} />
      )}

      {/* Mobile bottom drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${drawerReplyInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerReplyInfo(null)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-200 ease-out ${drawerReplyInfo ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-t-2xl px-4 pt-4 pb-8">
          <button
            onClick={() => {
              const info = drawerReplyInfo;
              setDrawerReplyInfo(null);
              if (info) setDeleteReplyInfo(info);
            }}
            className="w-full text-left px-4 py-3 text-red-500 text-base font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={() => setDrawerReplyInfo(null)}
            className="w-full text-left px-4 py-3 text-neutral-600 dark:text-neutral-300 text-base rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 bg-transparent border-none cursor-pointer mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
