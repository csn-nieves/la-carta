import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import type { StockItem, StockCategory } from '../types';

const STORAGE_KEY_STATUSES = 'stock-list-statuses';
const STORAGE_KEY_CATEGORIES = 'stock-list-categories';

type ItemStatus = 'stocked' | 'out';

const SWIPE_THRESHOLD = 75;
const MAX_OFFSET = 120;

function SwipeableItem({
  item,
  status,
  onStatusChange,
}: {
  item: StockItem;
  status?: ItemStatus;
  onStatusChange: (newStatus: ItemStatus | undefined) => void;
}) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
      return;
    }

    if (!isHorizontalSwipe.current) return;

    e.preventDefault();
    const clamped = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, deltaX));
    setOffsetX(clamped);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);

    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      const direction = offsetX > 0 ? 'stocked' : 'out';
      if (status === direction) {
        // Same direction again → toggle off
        onStatusChange(undefined);
      } else {
        onStatusChange(direction as ItemStatus);
      }
    }

    setOffsetX(0);
  }, [offsetX, status, onStatusChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // handled by touch events
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isSwiping || e.pointerType === 'touch') return;
    const deltaX = e.clientX - touchStartX.current;
    const deltaY = e.clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
      return;
    }

    if (!isHorizontalSwipe.current) return;

    const clamped = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, deltaX));
    setOffsetX(clamped);
  }, [isSwiping]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !isSwiping) return;
    setIsSwiping(false);

    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      const direction = offsetX > 0 ? 'stocked' : 'out';
      if (status === direction) {
        onStatusChange(undefined);
      } else {
        onStatusChange(direction as ItemStatus);
      }
    }

    setOffsetX(0);
  }, [isSwiping, offsetX, status, onStatusChange]);

  const bgColor = offsetX > 0 ? 'bg-green-500' : offsetX < 0 ? 'bg-red-500' : '';
  const bgText = offsetX > 0 ? 'Stocked' : offsetX < 0 ? 'Out of Stock' : '';

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background layer */}
      {offsetX !== 0 && (
        <div
          className={`absolute inset-0 flex items-center ${offsetX > 0 ? 'justify-start pl-4' : 'justify-end pr-4'} ${bgColor}`}
        >
          <span className="text-white font-semibold text-sm">{bgText}</span>
        </div>
      )}

      {/* Foreground row */}
      <div
        className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 select-none touch-pan-y"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {item.name}
        </span>
        <div className="flex items-center gap-2">
          {status === 'stocked' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Stocked
            </span>
          )}
          {status === 'out' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Out of Stock
            </span>
          )}
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">
            {item.count}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StockList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Use categories from location.state if available, otherwise fall back to localStorage
  const locationCategories = (location.state?.categories ?? null) as StockCategory[] | null;
  const [categories] = useState<StockCategory[]>(() => {
    if (locationCategories && locationCategories.length > 0) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(locationCategories));
      return locationCategories;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [statuses, setStatuses] = useState<Record<string, ItemStatus | undefined>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATUSES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist statuses to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(statuses));
  }, [statuses]);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.count > 0),
    }))
    .filter((cat) => cat.items.length > 0);

  const handleStatusChange = useCallback((name: string, newStatus: ItemStatus | undefined) => {
    setStatuses((prev) => ({ ...prev, [name]: newStatus }));
  }, []);

  const allItems = filtered.flatMap((cat) => cat.items);
  const allMarked = allItems.length > 0 && allItems.every((item) => statuses[item.name] != null);

  const handleComplete = () => {
    const outOfStock = filtered
      .flatMap((cat) => cat.items)
      .filter((item) => statuses[item.name] === 'out');

    localStorage.removeItem(STORAGE_KEY_STATUSES);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem('stock-counts');

    if (outOfStock.length > 0) {
      const prefill = `${user?.name} completed the stock but some items are out:\n${outOfStock.map((item) => `• ${item.name}`).join('\n')}`;
      navigate('/notes', { state: { prefill } });
    } else {
      navigate('/tasks/stock');
    }
  };

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks/stock" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Complete List</h1>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">No items counted yet.</p>
      ) : (
        filtered.map((cat) => (
          <div key={cat.label} className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              {cat.label}
            </h2>
            <div className="flex flex-col gap-2">
              {cat.items.map((item) => (
                <SwipeableItem
                  key={item.name}
                  item={item}
                  status={statuses[item.name]}
                  onStatusChange={(s) => handleStatusChange(item.name, s)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {filtered.length > 0 && (
        <button
          onClick={handleComplete}
          disabled={!allMarked}
          className="w-full py-3 rounded-lg font-semibold bg-black text-white dark:bg-white dark:text-black disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
        >
          Complete Stock
        </button>
      )}
    </div>
  );
}
