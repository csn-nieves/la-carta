import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const BILLS = [
  { label: 'Hundreds ($100)', multiplier: 100 },
  { label: 'Fifties ($50)', multiplier: 50 },
  { label: 'Twenties ($20)', multiplier: 20 },
  { label: 'Tens ($10)', multiplier: 10 },
  { label: 'Fives ($5)', multiplier: 5 },
  { label: 'Singles ($1)', multiplier: 1 },
];

export default function BarMath() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Record<number, string>>({
    100: '', 50: '', 20: '', 10: '', 5: '', 1: '',
  });
  const [change, setChange] = useState('10');
  const [totalSales, setTotalSales] = useState('');
  const [foodSales, setLiquorSales] = useState('');

  const cashTotal = BILLS.reduce((sum, b) => {
    return sum + (parseFloat(bills[b.multiplier]) || 0);
  }, 0) + (parseFloat(change) || 0);

  const canCalculate = totalSales.trim() !== '' && foodSales.trim() !== '';

  const handleCalculate = () => {
    navigate('/tasks/bar-math/result', {
      state: {
        bills: BILLS.map((b) => ({
          label: b.label,
          amount: parseFloat(bills[b.multiplier]) || 0,
        })),
        change: parseFloat(change) || 0,
        cashTotal,
        totalSales: parseFloat(totalSales) || 0,
        foodSales: parseFloat(foodSales) || 0,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/tasks" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Bar Math</h1>
      </div>

      <div className="space-y-6">
        {/* Cash drawer */}
        <div>
          <h2 className="form-label mb-3">Cash Drawer</h2>
          <div className="space-y-3">
            {BILLS.map((bill) => (
              <div key={bill.multiplier} className="flex items-center gap-3">
                <label className="text-sm text-neutral-600 dark:text-neutral-400 w-32 shrink-0">{bill.label}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={bills[bill.multiplier]}
                  onChange={(e) => setBills((prev) => ({ ...prev, [bill.multiplier]: e.target.value }))}
                  placeholder="0"
                  className="input-field flex-1"
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-600 dark:text-neutral-400 w-32 shrink-0">Change</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={change}
                onChange={(e) => setChange(e.target.value)}
                placeholder="0.00"
                className="input-field flex-1"
              />
            </div>
          </div>
          <div className="mt-3 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Cash Total: <span className="text-lg font-bold">${cashTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Sales */}
        <div className="space-y-3">
          <h2 className="form-label mb-1">Sales</h2>
          <div>
            <label className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 block">Total Sales</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 block">Food Sales</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={foodSales}
              onChange={(e) => setLiquorSales(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className="btn-primary w-full"
        >
          Calculate
        </button>
      </div>
    </div>
  );
}
