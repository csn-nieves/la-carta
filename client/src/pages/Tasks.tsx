import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const navigate = useNavigate();
  return (
    <div className="pb-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Utils</h1>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/tasks/stock')} className="flex flex-col items-center gap-3 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Stock</span>
        </button>

        <button onClick={() => navigate('/tasks/bar-math')} className="flex flex-col items-center gap-3 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Bar Math</span>
        </button>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mt-8 mb-3">Reviews</h2>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/tasks/bourbons')} className="flex flex-col items-center gap-3 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Bourbon Saturdays</span>
        </button>

        <button onClick={() => navigate('/tasks/wines')} className="flex flex-col items-center gap-3 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <path d="M8 22h8" />
            <path d="M12 11v11" />
            <path d="M20 3H4l3.5 8.5a5 5 0 009 0L20 3z" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Wine Saturdays</span>
        </button>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mt-8 mb-3">Coming Soon</h2>
      <div className="grid grid-cols-2 gap-4">
        <button disabled className="relative flex flex-col items-center gap-3 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 opacity-50 cursor-not-allowed transition-colors">
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Coming soon</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Closing Guide</span>
        </button>
      </div>
    </div>
  );
}
