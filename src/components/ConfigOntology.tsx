import React, { useState } from 'react';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  Package,
  Layers,
  CheckCircle2,
  Hammer,
  Sparkles,
  Scissors,
  Apple,
  Utensils
} from 'lucide-react';
import { ProductItem, TradeCategoryConfig, BusinessTradeCategory } from '../types';

interface ConfigOntologyProps {
  products: ProductItem[];
  tradeCategories: TradeCategoryConfig[];
  onUpdateProducts: (updated: ProductItem[]) => void;
}

export const ConfigOntology: React.FC<ConfigOntologyProps> = ({
  products,
  tradeCategories,
  onUpdateProducts
}) => {
  const [selectedTrade, setSelectedTrade] = useState<BusinessTradeCategory>('hardware');
  const [items, setItems] = useState<ProductItem[]>(products);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(
    products.find(p => p.category === 'hardware') || products[0]
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const tradeProducts = items.filter(p => p.category === selectedTrade);

  const handleFieldChange = (field: keyof ProductItem, value: any) => {
    const updated = { ...selectedProduct, [field]: value };
    setSelectedProduct(updated);
    setItems(items.map(it => (it.id === updated.id ? updated : it)));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/ontology/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct)
      });

      if (res.ok) {
        setFeedback(`✅ Vigezo na mipaka ya bei kwa "${selectedProduct.name}" vimehifadhiwa!`);
        onUpdateProducts(items);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Configurable Trade Ontology & Price Guardrails
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">Zero Hardcoded Prompts</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Trade-by-Trade Product Catalog & Bounded Guardrails
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Configure trade slang & Sheng synonyms, regional unit packaging multipliers (cartons, bags, rolls, crates, jerricans), MOQ thresholds, rolling cycle windows, and wholesale price guardrails without code changes.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Trade Guardrails
          </button>
        </div>

        {/* Trade Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-stone-100 overflow-x-auto text-xs scrollbar-none">
          <span className="text-stone-400 font-medium mr-2">Trade Category:</span>
          {tradeCategories.map(cat => {
            const isSelected = selectedTrade === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedTrade(cat.id);
                  const firstOfTrade = items.find(p => p.category === cat.id);
                  if (firstOfTrade) setSelectedProduct(firstOfTrade);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products for selected trade */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2 px-1">
            {selectedTrade.toUpperCase()} Products ({tradeProducts.length})
          </span>

          {tradeProducts.map(item => {
            const isSelected = item.id === selectedProduct.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800 ml-2">
                    KSh {item.benchmarkPriceKsh}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>MOQ: {item.moqBaseUnit} {item.defaultUnit}</span>
                  <span className="text-stone-400">
                    Bands: KSh {item.guardrailMinKsh} - {item.guardrailMaxKsh}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Edit Parameters & Guardrails */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-xs font-mono text-stone-400 block uppercase">
                {selectedProduct.category} · {selectedProduct.id}
              </span>
              <h3 className="text-base font-bold text-stone-900">
                Edit {selectedProduct.name}
              </h3>
            </div>
            <span className="text-xs bg-stone-100 px-2.5 py-1 rounded font-mono text-stone-600">
              Window: {selectedProduct.rollingWindowDays} days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Product Name (Standard):</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Swahili Name:</label>
              <input
                type="text"
                value={selectedProduct.swahiliName}
                onChange={e => handleFieldChange('swahiliName', e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-stone-700 font-medium mb-1">
                Sheng & Local Synonyms (used by AI Parser across markets):
              </label>
              <input
                type="text"
                value={selectedProduct.synonyms.join(', ')}
                onChange={e =>
                  handleFieldChange(
                    'synonyms',
                    e.target.value.split(',').map(s => s.trim().toLowerCase())
                  )
                }
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Comma-separated local words small traders use in voice notes or text.
              </span>
            </div>

            {/* Price Guardrail Bands */}
            <div className="md:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Wholesale Price Guardrail Bands (Per {selectedProduct.defaultUnit})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Floor Price (Supplier Cost Floor):
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.guardrailMinKsh}
                    onChange={e => handleFieldChange('guardrailMinKsh', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Min fair factory price</span>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Wholesale Benchmark:
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.benchmarkPriceKsh}
                    onChange={e => handleFieldChange('benchmarkPriceKsh', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Current wholesale target</span>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Ceiling Price (Safety Guardrail):
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.guardrailMaxKsh}
                    onChange={e => handleFieldChange('guardrailMaxKsh', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-rose-600 mt-0.5 block">Exceeded = Escalate to Ops</span>
                </div>
              </div>
            </div>

            {/* Minimum Order Quantity (MOQ) */}
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Wholesale Minimum Order Quantity (MOQ):
              </label>
              <input
                type="number"
                value={selectedProduct.moqBaseUnit}
                onChange={e => handleFieldChange('moqBaseUnit', Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Cluster locks and routes to supplier once this volume is hit.
              </span>
            </div>

            {/* Packaging Multipliers */}
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Supported Trade Packaging Multipliers:
              </label>
              <div className="bg-stone-50 border border-stone-200 rounded p-2 space-y-1 font-mono text-[11px]">
                {selectedProduct.supportedUnits.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-stone-700">
                    <span>{u.label}</span>
                    <span className="font-bold text-stone-900">{u.multiplierToBase} base units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
