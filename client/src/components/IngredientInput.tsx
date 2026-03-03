import type { IngredientInput as IngredientType } from '../types';

const UNITS = ['oz', 'dashes', 'drops', 'spritz', 'fill'] as const;
const QTYS = [
  ...Array.from({ length: 16 }, (_, i) => ((i + 1) * 0.25).toString()),
  ...Array.from({ length: 6 }, (_, i) => (i + 5).toString()),
];

function parseVolume(volume: string): { qty: string; unit: string } {
  const match = volume.match(/^([\d.\/]*)\s*(.*)$/);
  if (!match) return { qty: '', unit: '' };
  const unit = UNITS.find((u) => u === match[2].trim().toLowerCase()) ?? '';
  return { qty: match[1], unit };
}

interface Props {
  ingredients: IngredientType[];
  onChange: (ingredients: IngredientType[]) => void;
}

export default function IngredientInputList({ ingredients, onChange }: Props) {
  const update = (index: number, field: keyof IngredientType, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateVolume = (index: number, qty: string, unit: string) => {
    const parts = [qty, unit].filter(Boolean);
    update(index, 'volume', parts.join(' '));
  };

  const add = () => onChange([...ingredients, { name: '', volume: '' }]);

  const remove = (index: number) => {
    if (ingredients.length <= 1) return;
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const inputClass = "px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Ingredients
      </label>
      {ingredients.map((ing, i) => {
        const { qty, unit } = parseVolume(ing.volume);
        return (
          <div key={i} className="flex flex-wrap gap-2 items-start">
            <input
              type="text"
              placeholder="e.g. Bourbon"
              value={ing.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              className={`w-full sm:flex-1 ${inputClass}`}
            />
            <select
              value={qty}
              onChange={(e) => updateVolume(i, e.target.value, unit)}
              className={`w-20 ${inputClass}`}
            >
              <option value="">Qty</option>
              {QTYS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <select
              value={unit}
              onChange={(e) => updateVolume(i, qty, e.target.value)}
              className={`w-24 ${inputClass}`}
            >
              <option value="">Unit</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-3 py-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer text-lg"
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="text-sm text-black dark:text-white hover:text-neutral-800 dark:hover:text-neutral-200 bg-transparent border-none cursor-pointer font-medium"
      >
        + Add Ingredient
      </button>
    </div>
  );
}
