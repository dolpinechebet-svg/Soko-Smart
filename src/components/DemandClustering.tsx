import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin,
  PlusCircle,
  Truck,
  Hammer,
  Sparkles,
  Scissors,
  Apple,
  Utensils,
  ShoppingBag
} from 'lucide-react';
import { DemandCluster, DemandOrder, ProductItem, BusinessOwner, TradeCategoryConfig, BusinessTradeCategory } from '../types';

interface DemandClusteringProps {
  clusters: DemandCluster[];
  orders: DemandOrder[];
  products: ProductItem[];
  businesses: BusinessOwner[];
  tradeCategories: TradeCategoryConfig[];
  onLockCluster: (clusterId: string) => void;
  onOrderAdded: () => void;
  onNavigateToNegotiation: (clusterId: string) => void;
}

export const DemandClustering: React.FC<DemandClusteringProps> = ({
  clusters,
  orders,
  products,
  businesses,
  tradeCategories,
  onLockCluster,
  onOrderAdded,
  onNavigateToNegotiation
}) => {
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('all');
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [newOrderForm, setNewOrderForm] = useState({
    businessId: businesses[0]?.id || '',
    productId: products[0]?.id || '',
    quantity: 20,
    unit: 'mfuko',
    ward: 'Makadara - Hamza'
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProd = products.find(p => p.id === newOrderForm.productId);
      const res = await fetch('/api/demand/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: newOrderForm.businessId,
          productId: newOrderForm.productId,
          category: selectedProd?.category,
          rawQuantity: Number(newOrderForm.quantity),
          rawUnit: newOrderForm.unit,
          ward: newOrderForm.ward
        })
      });

      if (res.ok) {
        setShowAddOrderModal(false);
        onOrderAdded();
      }
    } catch (err) {
      console.error('Order creation error:', err);
    }
  };

  const filteredClusters = selectedTradeFilter === 'all'
    ? clusters
    : clusters.filter(c => c.category === selectedTradeFilter);

  const getCategoryBadge = (cat: BusinessTradeCategory) => {
    switch (cat) {
      case 'hardware':
        return { label: 'Hardware', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'salon_beauty':
        return { label: 'Salon & Beauty', color: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'tailoring_textiles':
        return { label: 'Tailoring', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'produce_kiosk':
        return { label: 'Produce', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'kibanda_food':
        return { label: 'Food Kibanda', color: 'bg-orange-100 text-orange-900 border-orange-300' };
      default:
        return { label: cat, color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Multi-Trade Aggregation Engine */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Trade-Agnostic Demand Aggregation Engine
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-medium">Batch Clustering & Rolling Windows</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Soko Smart Kenya B2B Aggregation Board
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Individual orders from small businesses are pooled per neighbourhood, trade category, and product to hit wholesale Minimum Order Quantities (MOQ) for factory-direct discounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg text-xs">
              <span className="text-stone-500 block text-[10px] font-medium">Daily Pooling Cutoff</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                17:00 EAT Today
              </span>
            </div>

            <button
              onClick={() => setShowAddOrderModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Add Walk-in / SMS Order
            </button>
          </div>
        </div>

        {/* Trade Category Tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-stone-100 overflow-x-auto text-xs scrollbar-none">
          <span className="text-stone-400 font-medium mr-2">Filter Trade:</span>
          <button
            onClick={() => setSelectedTradeFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedTradeFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Trades ({clusters.length})
          </button>
          {tradeCategories.map(cat => {
            const isSelected = selectedTradeFilter === cat.id;
            const count = clusters.filter(c => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedTradeFilter(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClusters.map(cluster => {
          const progressPercent = Math.min(100, Math.round((cluster.totalQuantityBase / cluster.moqBase) * 100));
          const isMoqMet = cluster.moqMet;
          const tradeBadge = getCategoryBadge(cluster.category);

          const statusLabels: Record<string, { label: string; color: string }> = {
            open: { label: 'Open for Pooling', color: 'text-amber-800 bg-amber-50 border-amber-200' },
            negotiating: { label: 'In Supplier Negotiation', color: 'text-blue-800 bg-blue-50 border-blue-200' },
            agreement_drafted: { label: 'Micro-Agreement Drafted', color: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
            stk_sent: { label: 'M-PESA STK Escrow Sent', color: 'text-purple-800 bg-purple-50 border-purple-200' },
            paid: { label: '100% Escrow Funded', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
            dispatched: { label: 'Dispatched from Depot', color: 'text-cyan-800 bg-cyan-50 border-cyan-200' }
          };

          const currentStatus = statusLabels[cluster.status] || {
            label: cluster.status,
            color: 'text-stone-800 bg-stone-50 border-stone-200'
          };

          return (
            <div
              key={cluster.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${tradeBadge.color}`}>
                        {tradeBadge.label}
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        {cluster.id}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 leading-tight">
                      {cluster.productName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{cluster.neighbourhood}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                </div>

                {/* MOQ Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-stone-700">
                      Volume: {cluster.totalQuantityBase.toLocaleString()} / {cluster.moqBase.toLocaleString()} MOQ Units
                    </span>
                    <span className={`font-bold ${isMoqMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isMoqMet ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
                    <span>{cluster.unitSummary}</span>
                    <span>
                      {isMoqMet
                        ? '✅ Minimum Wholesale Lot Reached'
                        : `Need ${(cluster.moqBase - cluster.totalQuantityBase).toLocaleString()} more to lock`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Members Breakdown */}
              <div className="p-5 bg-stone-50/50">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    Pooled Businesses ({cluster.businessCount} Members)
                  </span>
                  <span className="text-xs text-stone-500">
                    Est. Rate: ~KSh {cluster.targetPriceCeilingPerUnit}/unit
                  </span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {cluster.businessBreakdown.map((bb, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-stone-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-stone-800 block">{bb.businessName}</span>
                        <span className="text-[11px] text-stone-500">{bb.ownerName} ({bb.phone})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">{bb.rawDisplay}</span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          ~KSh {bb.allocatedAmountKsh.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    Staging: <strong className="text-stone-700">Hamza Central Hub</strong>
                  </div>

                  {cluster.status === 'open' ? (
                    <button
                      onClick={() => onLockCluster(cluster.id)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Lock & Negotiate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToNegotiation(cluster.id)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open Negotiation Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual / Walk-in Registration Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                Register Trader Demand Order
              </h3>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Select Small Business:</label>
                <select
                  value={newOrderForm.businessId}
                  onChange={e => setNewOrderForm({ ...newOrderForm, businessId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.businessName} ({b.ownerName}) - {b.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Product to Restock:</label>
                <select
                  value={newOrderForm.productId}
                  onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    setNewOrderForm({
                      ...newOrderForm,
                      productId: e.target.value,
                      unit: prod?.defaultUnit || 'unit'
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name} - Benchmark KSh {p.benchmarkPriceKsh}/{p.defaultUnit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Quantity:</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrderForm.quantity}
                    onChange={e => setNewOrderForm({ ...newOrderForm, quantity: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Unit:</label>
                  <input
                    type="text"
                    value={newOrderForm.unit}
                    onChange={e => setNewOrderForm({ ...newOrderForm, unit: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Ward Location:</label>
                <select
                  value={newOrderForm.ward}
                  onChange={e => setNewOrderForm({ ...newOrderForm, ward: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Makadara - Hamza">Makadara - Hamza</option>
                  <option value="Makadara - Maringo">Makadara - Maringo</option>
                  <option value="Makadara - Viwandani">Makadara - Viwandani</option>
                  <option value="Makadara - Harambee">Makadara - Harambee</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="px-3.5 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Pool into Soko Smart Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
