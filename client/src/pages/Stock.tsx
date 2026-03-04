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
      { name: 'House Cabernet', count: 0 },
      { name: 'House Chianti', count: 0 },
      { name: 'Sterling Cabernet', count: 0 },
      { name: 'Bonorli Super Tuscan', count: 0 },
      { name: 'Arché Montepulciano', count: 0 },
      { name: 'Amalaya Malbec', count: 0 },
      { name: 'Saddlebred Pinot Noir', count: 0 },
      { name: "Calea Nero d'Avola", count: 0 },
    ],
  },
  {
    label: 'White Wines',
    items: [
      { name: 'House Pinot Grigio', count: 0 },
      { name: 'Kato Sauv Blanc', count: 0 },
      { name: 'Sortesele Pinot Grigio', count: 0 },
      { name: 'Picco Del Sol Vermentino', count: 0 },
      { name: 'Santi Rosé', count: 0 },
      { name: 'Riesling', count: 0 },
      { name: 'Sauvignon Blanc', count: 0 },
      { name: 'Lamberti Prosecco', count: 0 },
      { name: 'Franciscan Chardonnnay', count: 0 },
      { name: 'Bramito Chardonnnay', count: 0 },
      { name: 'Zebo Moscato', count: 0 },
    ],
  },
  {
    label: 'Beers, Teas, Splits and Sodas',
    items: [
      { name: 'Brilla Rosé', count: 0 },
      { name: 'Surfside', count: 0 },
      { name: 'Peroni 0.0', count: 0 },
      { name: 'Brilla Blue', count: 0 },
      { name: 'Corona', count: 0 },
      { name: 'Coors Light', count: 0 },
      { name: 'Nine Pin Cider', count: 0 },
      { name: 'Saranac Root Beer', count: 0 },
      { name: 'Saranac Sherley Temple', count: 0 },
    ],
  },
  {
    label: '400 Speedwell',
    items: [
      { name: 'House Vodka', count: 0 },
      { name: 'Kahlua', count: 0 },
      { name: 'Orange Vodka', count: 0 },
      { name: 'Triple Sec', count: 0 },
      { name: 'Pomm Liqueur', count: 0 },
      { name: 'Milagro Tequila', count: 0 },
      { name: 'Montelobos Mezcal', count: 0 },
      { name: 'Dry Vermouth', count: 0 },
      { name: 'Carpano', count: 0 },
      { name: 'Buffalo Trace', count: 0 },
      { name: 'Créme de Cassis', count: 0 },
      { name: 'Raspberry Vodka', count: 0 },
      { name: 'Raspberry Vodka', count: 0 },
      { name: 'Italicus', count: 0 },
      { name: 'Cynar', count: 0 },
      { name: 'Cointreau', count: 0 },
      { name: 'Amaro', count: 0 },
      { name: 'Aperol', count: 0 },
      { name: 'Campari', count: 0 },
      { name: '10 Mill Vodka', count: 0 },
      { name: 'Créme de Menth', count: 0 },
      { name: 'Elderflower Liqueur', count: 0 },
      { name: 'Elderflower Liqueur', count: 0 },
      { name: 'Malibu Rum', count: 0 },
      { name: 'Goslings Dark Rum', count: 0 },
      { name: 'Amaretto', count: 0 },
      { name: 'Tuaca', count: 0 },
      { name: 'Peach Schnapps', count: 0 },
      { name: 'Mt Gay Rum', count: 0 },
    ],
  },
  {
    label: '200 Speedwell',
    items: [
      { name: 'House Vodka', count: 0 },
      { name: 'House Gin', count: 0 },
      { name: 'Bacardi', count: 0 },
      { name: 'House Tequila', count: 0 },
      { name: 'House Bourbon', count: 0 },
      { name: 'House Whiskey', count: 0 },
      { name: 'Travellers Whiskey', count: 0 },
      { name: 'Casamigos Blanco', count: 0 },
      { name: 'Titos', count: 0 },
      { name: 'Grey Goose', count: 0 },
      { name: "Grey Goose L'Orange", count: 0 },
      { name: 'Ketel One', count: 0 },
      { name: 'Ketel One Citroen', count: 0 },
      { name: 'Jack Daniels', count: 0 },
      { name: 'Dewars', count: 0 },
      { name: 'Lalo Tequila', count: 0 },
      { name: 'Hendricks', count: 0 },
      { name: 'Beefeater', count: 0 },
      { name: 'Bombay Saphire', count: 0 },
      { name: 'Tanqueray', count: 0 },
      { name: 'Seagrams 7', count: 0 },
      { name: 'Captain Morgan', count: 0 },
      { name: 'Jim Beam', count: 0 },
      { name: 'Jameson', count: 0 },
      { name: 'Canadian Club', count: 0 },
      { name: 'Southern Comfort', count: 0 },
      { name: 'Bulleit Bourbon', count: 0 },
      { name: 'Bulleit Rye', count: 0 },
      { name: 'Knob Creek Bourbon', count: 0 },
      { name: 'Knob Creek Rye', count: 0 },
      { name: 'Crown Royal', count: 0 },
      { name: 'Makers Mark', count: 0 },
    ],
  },
  {
    label: '200 Top Shelf',
    items: [
      { name: 'Disaronno', count: 0 },
      { name: 'Chambord', count: 0 },
      { name: 'D.O.M Benedictine', count: 0 },
      { name: 'Grand Marnier', count: 0 },
      { name: 'St Germain', count: 0 },
      { name: 'St Germain', count: 0 },
      { name: 'B and B', count: 0 },
      { name: 'Drambuie', count: 0 },
      { name: 'Black Sambuca', count: 0 },
      { name: 'Molinari Sambuca', count: 0 },
      { name: 'Grappa', count: 0 },
      { name: 'Frangelico', count: 0 },
      { name: 'Tia Maria', count: 0 },
      { name: 'Mephisto Absinthe', count: 0 },
      { name: 'Fernet-Branca', count: 0 },
      { name: 'Hennessy V.S.O.P', count: 0 },
      { name: 'Darvelle Freres V.S.O.P', count: 0 },
      { name: 'Proper Twelve', count: 0 },
      { name: 'Whistlepig Bourbon', count: 0 },
      { name: 'Whistlepig Whiskey', count: 0 },
      { name: 'Whistlepig Whiskey', count: 0 },
      { name: 'Angels Envy', count: 0 },
      { name: 'E.H Taylor', count: 0 },
      { name: 'E.H Taylor', count: 0 },
      { name: 'Blantons', count: 0 },
      { name: 'Great Jones Bourbon', count: 0 },
      { name: 'Weller Antique 107', count: 0 },
      { name: 'Weller Special Reserve', count: 0 },
      { name: 'Buffalo Trace', count: 0 },
      { name: 'Saratoga Rye', count: 0 },
      { name: 'Calumet Farm Bourbon', count: 0 },
      { name: 'Slaughter House Whiskey', count: 0 },
      { name: 'Widow Jane', count: 0 },
      { name: 'Redeption Rye', count: 0 },
      { name: 'Redemption Bourbon', count: 0 },
      { name: 'Woodford Reserve', count: 0 },
      { name: 'Elijah Craig', count: 0 },
      { name: 'Pappy 10', count: 0 },
      { name: 'Pappy 12', count: 0 },
      { name: 'Chivas', count: 0 },
      { name: 'Balvenie 12', count: 0 },
      { name: 'Glenlivet 12', count: 0 },
      { name: 'Glenlivet 12', count: 0 },
      { name: 'Glenfiddich 12', count: 0 },
      { name: 'Glenmorangie 12', count: 0 },
      { name: 'Oban 14', count: 0 },
      { name: 'Lagavulin 16', count: 0 },
      { name: 'Talisker 10', count: 0 },
      { name: 'Talisker 10', count: 0 },
      { name: 'Johnnie Walker Black', count: 0 },
      { name: 'Johnnie Walker Red', count: 0 },
      { name: 'Johnnie Walker Gold', count: 0 },
      { name: 'Macallan 12', count: 0 },
    ]
  },
  {
    label: '400 Top Shelf',
    items: [
      { name: 'Jose Cuervo', count: 0 },
      { name: 'Clase Azul', count: 0 },
      { name: 'Riazul Plata', count: 0 },
      { name: 'Lalo', count: 0 },
      { name: 'Ocho Plata', count: 0 },
      { name: 'Ocho Reposado', count: 0 },
      { name: 'Casamigos Blanco', count: 0 },
      { name: 'Casamigos Blanco', count: 0 },
      { name: 'Casamigos Reposado', count: 0 },
      { name: 'Casamigos Añejo', count: 0 },
      { name: 'Grey Goose', count: 0 },
      { name: 'Titos', count: 0 },
      { name: 'Ketel One', count: 0 },
      { name: 'Ketel One Citroen', count: 0 },
      { name: 'Beefeater', count: 0 },
      { name: 'Tanqueray', count: 0 },
      { name: 'Hendricks', count: 0 },
      { name: 'Bombay Saphire', count: 0 },
      { name: 'Krupnik Honey Liqueur', count: 0 },
      { name: 'Chartreuse', count: 0 },
      { name: 'Barr Hill Gin', count: 0 },
      { name: 'Barr Hill Gin', count: 0 },
      { name: 'Gray Whale Gin', count: 0 },
      { name: 'Canniption Kinship Gin', count: 0 },
    ]
  },
  {
    label: 'Miscellaneous Storage',
    items: [
      { name: 'House Vodka', count: 0 },
      { name: 'House Gin', count: 0 },
      { name: 'House Rum', count: 0 },
      { name: 'House Tequila', count: 0 },
      { name: 'House Bourbon', count: 0 },
      { name: 'House Whiskey', count: 0 },
      { name: 'Triple Sec', count: 0 },
      { name: 'Créme de Cassis', count: 0 },
      { name: 'Pomm Liqueur', count: 0 },
      { name: 'Orange Vodka', count: 0 },
      { name: 'Raspberry Vodka', count: 0 },
      { name: 'Kahlua', count: 0 },
      { name: 'Bulleit Bourbon', count: 0 },
      { name: 'Bulleit Rye', count: 0 },
      { name: 'Dry Vermouth', count: 0 },
      { name: 'Carpano', count: 0 },
      { name: 'Aperol', count: 0 },
      { name: 'Campari', count: 0 },
    ]
  },
  {
    label: 'Everything Else',
    items: [
      { name: 'Apple Juice', count: 0 },
      { name: 'Pineapple Juice', count: 0 },
      { name: 'Ginger Beer', count: 0 },
      { name: 'Grapefruit Ginger Beer', count: 0 },
      { name: 'Bloodorange Puree', count: 0 },
      { name: 'Coffee', count: 0 },
      { name: 'Decaf Coffee', count: 0 },
      { name: 'Bitters', count: 0 },
      { name: 'Olives', count: 0 },
      { name: 'Cherries', count: 0 },
    ]
  }
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
