import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StockItem {
  name: string;
  count: number;
}

interface Category {
  label: string;
  items: StockItem[];
}

const initialData: Category[] = [
  {
    label: 'Red Wines',
    items: [
      { name: 'Cabernet', count: 0 },
      { name: 'Malbec', count: 0 },
      { name: 'Merlot', count: 0 },
      { name: 'Nebbiolo', count: 0 },
      { name: 'Pinot Noir', count: 0 },
      { name: 'Tempranillo', count: 0 },
    ],
  },
  {
    label: 'White Wines',
    items: [
      { name: 'Chardonnay', count: 0 },
      { name: 'Gewürztraminer', count: 0 },
      { name: 'Moscato', count: 0 },
      { name: 'Pinot Grigio', count: 0 },
      { name: 'Prosecco', count: 0 },
      { name: 'Riesling', count: 0 },
      { name: 'Sauvignon Blanc', count: 0 },
      { name: 'Viognier', count: 0 },
    ],
  },
  {
    label: 'Beers',
    items: [
      { name: 'Blue Moon', count: 0 },
      { name: 'Budweiser', count: 0 },
      { name: 'Corona', count: 0 },
      { name: 'Guinness', count: 0 },
      { name: 'Heineken', count: 0 },
      { name: 'IPA', count: 0 },
      { name: 'Modelo', count: 0 },
      { name: 'Peroni', count: 0 },
      { name: 'Pilsner', count: 0 },
      { name: 'Stella Artois', count: 0 },
    ],
  },
];

export default function Stock() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(initialData);

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
        <button
          onClick={() => navigate('/tasks')}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
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
