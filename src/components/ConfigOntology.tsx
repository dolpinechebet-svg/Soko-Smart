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
  CheckCircle2
} from 'lucide-react';
import { ProduceItem } from '../types';

interface ConfigOntologyProps {
  catalog: ProduceItem[];
  onUpdateCatalog: (updated: ProduceItem[]) => void;
}

export const ConfigOntology: React.FC<ConfigOntologyProps> = ({ catalog, onUpdateCatalog }) => {
  const [items, setItems] = useState<ProduceItem[]>(catalog);
  const [selectedItem, setSelectedItem] = useState<ProduceItem>(catalog[0]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFieldChange = (field: keyof ProduceItem, value: any) => {
    const updated = { ...selectedItem, [field]: value };
    setSelectedItem(updated);
    setItems(items.map(it => (it.id === updated.id ? updated : it)));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/ontology/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedItem)
      });

      if (res.ok) {
        setFeedback('✅ Vigezo na mipaka ya bei vimehifadhiwa kikamilifu!');
        onUpdateCatalog(items);
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
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Configurable Produce Ontology & Price Guardrails
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">Non-Hardcoded Platform Rules</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Canonical Produce Catalog & Algorithm Guardrails
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Configure local Swahili and Sheng synonyms, regional unit-to-kg conversion factors (e.g. gunia, debe, tenga), wholesale Minimum Order Quantities (MOQ), and negotiation price floors and ceilings.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Guardrail Changes
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Produce Item List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2 px-1">
            Active Catalog Items ({items.length})
          </span>

          {items.map(item => {
            const isSelected = item.id === selectedItem.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">
                    {item.swahiliName} ({item.name})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    KSh {item.benchmarkPriceKshPerKg}/kg
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>MOQ: {item.moqKg} kg</span>
                  <span className="text-stone-400">
                    Bands: KSh {item.guardrailMinKshPerKg} - {item.guardrailMaxKshPerKg}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Edit Produce Parameters & Guardrails */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-xs font-mono text-stone-400 block">{selectedItem.id}</span>
              <h3 className="text-base font-bold text-stone-900">
                Edit {selectedItem.swahiliName} ({selectedItem.name})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">English Canonical Name:</label>
              <input
                type="text"
                value={selectedItem.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Swahili Local Name:</label>
              <input
                type="text"
                value={selectedItem.swahiliName}
                onChange={e => handleFieldChange('swahiliName', e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-stone-700 font-medium mb-1">
                Sheng & Local Synonyms (for LLM NLU mapping):
              </label>
              <input
                type="text"
                value={selectedItem.synonyms.join(', ')}
                onChange={e =>
                  handleFieldChange(
                    'synonyms',
                    e.target.value.split(',').map(s => s.trim().toLowerCase())
                  )
                }
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Comma-separated local market words Mama Mbogas use in text or voice.
              </span>
            </div>

            {/* Negotiation Price Guardrails */}
            <div className="md:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Autonomous Negotiation Guardrail Bands (Per Kg)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Floor Price (Farmer Minimum):
                  </label>
                  <input
                    type="number"
                    value={selectedItem.guardrailMinKshPerKg}
                    onChange={e => handleFieldChange('guardrailMinKshPerKg', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Min fair cost to farmer</span>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Wholesale Benchmark:
                  </label>
                  <input
                    type="number"
                    value={selectedItem.benchmarkPriceKshPerKg}
                    onChange={e => handleFieldChange('benchmarkPriceKshPerKg', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Market avg reference</span>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Ceiling Price (Safety Guardrail):
                  </label>
                  <input
                    type="number"
                    value={selectedItem.guardrailMaxKshPerKg}
                    onChange={e => handleFieldChange('guardrailMaxKshPerKg', Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-rose-600 mt-0.5 block">Above this = Escalate to Ops</span>
                </div>
              </div>
            </div>

            {/* Minimum Order Quantity (MOQ) */}
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Minimum Order Quantity (MOQ in kg):
              </label>
              <input
                type="number"
                value={selectedItem.moqKg}
                onChange={e => handleFieldChange('moqKg', Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Cluster locks and triggers co-op negotiations once this weight is pooled.
              </span>
            </div>

            {/* Supported Units Conversion Table */}
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Regional Units Conversion:
              </label>
              <div className="bg-stone-50 border border-stone-200 rounded p-2 space-y-1 font-mono text-[11px]">
                {selectedItem.supportedUnits.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-stone-700">
                    <span>{u.label}</span>
                    <span className="font-bold text-stone-900">{u.factorToKg} kg</span>
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
