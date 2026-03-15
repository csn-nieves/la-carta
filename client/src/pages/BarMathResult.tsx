import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

interface BillEntry {
  label: string;
  amount: number;
}

interface BarMathState {
  bills: BillEntry[];
  change: number;
  cashTotal: number;
  totalSales: number;
  foodSales: number;
}

function fmt(n: number) {
  return '$' + n.toFixed(2);
}

export default function BarMathResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BarMathState | null;

  if (!state) {
    return (
      <div className="pb-16 md:pb-6">
        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/tasks/bar-math" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Bar Math</h1>
        </div>
        <div className="text-center py-20 text-neutral-400">No data. Please go back and calculate.</div>
      </div>
    );
  }

  const { bills, change, cashTotal, totalSales, foodSales } = state;
  const hostTip = foodSales * 0.01;
  const expoTip = foodSales * 0.02;
  const busbackTip = totalSales * 0.02;

  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks/bar-math" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Bar Math</h1>
      </div>

      {/* Cash breakdown */}
      <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Cash Drawer</h2>
        <div className="space-y-1.5">
          {bills.filter((b) => b.amount > 0).map((b) => (
            <div key={b.label} className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">{b.label}</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">{fmt(b.amount)}</span>
            </div>
          ))}
          {change > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Change</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">{fmt(change)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-3 pt-3 flex justify-between font-semibold text-neutral-900 dark:text-neutral-100">
          <span>Cash Total</span>
          <span>{fmt(cashTotal)}</span>
        </div>
        {cashTotal > 600 && (() => {
          const diff = cashTotal - 600;
          return (
            <div className={`mt-2 text-sm font-semibold ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {diff > 0
                ? `Give restaurant ${fmt(diff)}`
                : `Receive ${fmt(Math.abs(diff))} from restaurant`}
            </div>
          );
        })()}
      </div>

      {/* Sales breakdown */}
      <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Sales</h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Total Sales</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">{fmt(totalSales)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Food Sales</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">{fmt(foodSales)}</span>
          </div>
        </div>
      </div>

      {/* Tip calculations */}
      <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Tip Outs</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">Host Tip</span>
              <span className="text-xs text-neutral-400 ml-2">1% of food sales</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmt(hostTip)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">Expo Tip</span>
              <span className="text-xs text-neutral-400 ml-2">2% of food sales</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmt(expoTip)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">Busback Tip</span>
              <span className="text-xs text-neutral-400 ml-2">2% of total sales</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmt(busbackTip)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/tasks')}
        className="btn-primary w-full"
      >
        Complete
      </button>
    </div>
  );
}
