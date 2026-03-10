import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_STOCK_DATA } from '../constants/stockData';
import BackButton from '../components/BackButton';
import type { StockCategory } from '../types';

const STORAGE_KEY = 'stock-counts';

export default function Stock() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<StockCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_DATA;
    } catch {
      return INITIAL_STOCK_DATA;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  function updateCount(catIdx: number, itemIdx: number, delta: number) {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci !== catIdx
          ? cat
          : {
            ...cat,
            items: cat.items.map((item, ii) =>
              ii !== itemIdx
                ? item
                : { ...item, count: Math.max(0, item.count + delta) }
            ),
          }
      )
    );
  }

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Stock</h1>
      </div>

      {categories.map((cat, catIdx) => (
        <div key={cat.label} className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            {cat.label}
          </h2>
          <div className="flex flex-col gap-2">
            {cat.items.map((item, itemIdx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
              >
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCount(catIdx, itemIdx, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-neutral-900 dark:text-neutral-100 font-medium">
                    {item.count}
                  </span>
                  <button
                    onClick={() => updateCount(catIdx, itemIdx, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate('/tasks/stock/list', { state: { categories } })}
        className="w-full py-3 mt-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity"
      >
        Complete List
      </button>
    </div>
  );
}
