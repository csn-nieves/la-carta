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
  const [foodSales, setFoodSales] = useState('');
  const [error, setError] = useState('');
  const [billErrors, setBillErrors] = useState<Record<number, boolean>>({});

  const cashTotal = BILLS.reduce((sum, b) => {
    return sum + (parseFloat(bills[b.multiplier]) || 0);
  }, 0) + (parseFloat(change) || 0);

  const hasBillErrors = Object.values(billErrors).some(Boolean);
  const canCalculate = totalSales.trim() !== '' && foodSales.trim() !== '' && !hasBillErrors;

  const handleCalculate = () => {
    const invalidBills = BILLS.filter((b) => {
      const val = parseFloat(bills[b.multiplier]) || 0;
      return val > 0 && val % b.multiplier !== 0;
    });

    if (invalidBills.length > 0) {
      const names = invalidBills.map((b) => b.label).join(', ');
      setError(`Invalid amount for: ${names}. Each value must be divisible by the bill denomination.`);
      return;
    }

    setError('');
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
            {BILLS.map((bill) => {
              const hasError = billErrors[bill.multiplier];
              return (
                <div key={bill.multiplier}>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-neutral-600 dark:text-neutral-400 w-32 shrink-0">{bill.label}</label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={bills[bill.multiplier]}
                        onChange={(e) => {
                          setBills((prev) => ({ ...prev, [bill.multiplier]: e.target.value }));
                          setBillErrors((prev) => ({ ...prev, [bill.multiplier]: false }));
                        }}
                        onBlur={() => {
                          const val = parseFloat(bills[bill.multiplier]) || 0;
                          const invalid = val > 0 && val % bill.multiplier !== 0;
                          setBillErrors((prev) => ({ ...prev, [bill.multiplier]: invalid }));
                        }}
                        placeholder="0"
                        className={`input-field w-full pl-7 ${hasError ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                  {hasError && (
                    <p className="text-xs text-red-500 mt-1 ml-35">Must be divisible by ${bill.multiplier}</p>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-600 dark:text-neutral-400 w-32 shrink-0">Change</label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={change}
                  onChange={(e) => setChange(e.target.value)}
                  placeholder="0.00"
                  className="input-field w-full pl-7"
                />
              </div>
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={totalSales}
                onChange={(e) => setTotalSales(e.target.value)}
                placeholder="0.00"
                className="input-field w-full pl-7"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 block">Food Sales</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={foodSales}
                onChange={(e) => setFoodSales(e.target.value)}
                placeholder="0.00"
                className="input-field w-full pl-7"
              />
            </div>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

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
