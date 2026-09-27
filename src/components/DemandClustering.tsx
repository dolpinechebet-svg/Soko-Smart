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
  Truck
} from 'lucide-react';
import { DemandCluster, DemandOrder, ProduceItem, MamaMbogaVendor } from '../types';

interface DemandClusteringProps {
  clusters: DemandCluster[];
  orders: DemandOrder[];
  catalog: ProduceItem[];
  vendors: MamaMbogaVendor[];
  onLockCluster: (clusterId: string) => void;
  onOrderAdded: () => void;
  onNavigateToNegotiation: (clusterId: string) => void;
}

export const DemandClustering: React.FC<DemandClusteringProps> = ({
  clusters,
  orders,
  catalog,
  vendors,
  onLockCluster,
  onOrderAdded,
  onNavigateToNegotiation
}) => {
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [newOrderForm, setNewOrderForm] = useState({
    vendorId: vendors[0]?.id || '',
    produceId: catalog[0]?.id || '',
    quantity: 2,
    unit: 'gunia',
    ward: 'Makadara - Hamza'
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/demand/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: newOrderForm.vendorId,
          produceId: newOrderForm.produceId,
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

  const filteredClusters = selectedWardFilter === 'all'
    ? clusters
    : clusters.filter(c => c.neighbourhood.toLowerCase().includes(selectedWardFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Banner: Corridor & Batch Window Rules */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Automated Demand Clustering Engine
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-medium">Batch Cycle: Next Morning Delivery</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Makadara Produce Aggregation Board
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Individual orders from Mama Mbogas across Hamza, Maringo, Viwandani, and Harambee are automatically pooled to reach wholesale Minimum Order Quantities (MOQ).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg text-xs">
              <span className="text-stone-500 block text-[10px] font-medium">Daily Pooling Cutoff</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                18:00 EAT Today
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

        {/* Ward Filter Buttons */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-stone-100 overflow-x-auto text-xs">
          <span className="text-stone-400 font-medium mr-2">Filter Ward:</span>
          {['all', 'Hamza', 'Maringo', 'Viwandani', 'Harambee'].map(ward => (
            <button
              key={ward}
              onClick={() => setSelectedWardFilter(ward)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedWardFilter === ward
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {ward === 'all' ? 'All Makadara Wards' : ward}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClusters.map(cluster => {
          const progressPercent = Math.min(100, Math.round((cluster.totalQuantityKg / cluster.moqKg) * 100));
          const isMoqMet = cluster.moqMet;
          const statusLabels: Record<string, { label: string; color: string }> = {
            open: { label: 'Open for Vendor Pooling', color: 'text-amber-800 bg-amber-50 border-amber-200' },
            negotiating: { label: 'In Negotiation with Co-op', color: 'text-blue-800 bg-blue-50 border-blue-200' },
            agreement_drafted: { label: 'Micro-Agreement Drafted', color: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
            stk_sent: { label: 'M-PESA STK Escrow Sent', color: 'text-purple-800 bg-purple-50 border-purple-200' },
            paid: { label: '100% Escrow Funded', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
            dispatched: { label: 'Farm Truck Dispatched', color: 'text-cyan-800 bg-cyan-50 border-cyan-200' }
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
              {/* Cluster Card Header */}
              <div className="p-5 border-b border-stone-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-stone-400 block mb-1">
                      {cluster.id}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 leading-tight">
                      {cluster.produceName}
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
                      Volume: {cluster.totalQuantityKg.toLocaleString()} kg / {cluster.moqKg.toLocaleString()} kg MOQ
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
                        ? '✅ Minimum Lot Met for Farm Direct'
                        : `Need ${(cluster.moqKg - cluster.totalQuantityKg).toLocaleString()} kg more to lock`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Breakdown Section */}
              <div className="p-5 bg-stone-50/50">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    Pooled Mama Mbogas ({cluster.vendorCount} Vendors)
                  </span>
                  <span className="text-xs text-stone-500">
                    Est. Farm-gate: ~KSh {cluster.targetPriceCeilingPerKg}/kg
                  </span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {cluster.vendorBreakdown.map((vb, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-stone-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-stone-800 block">{vb.vendorName}</span>
                        <span className="text-[11px] text-stone-500 font-mono">{vb.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">{vb.rawDisplay}</span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          ~KSh {vb.allocatedAmountKsh.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    Drop-off: <strong className="text-stone-700">Hamza Hub 06:30 AM</strong>
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

      {/* Manual / SMS Walk-in Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                Register Mama Mboga Demand
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
                <label className="block font-medium text-stone-700 mb-1">Select Vendor:</label>
                <select
                  value={newOrderForm.vendorId}
                  onChange={e => setNewOrderForm({ ...newOrderForm, vendorId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.ward}) - {v.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Produce:</label>
                <select
                  value={newOrderForm.produceId}
                  onChange={e => setNewOrderForm({ ...newOrderForm, produceId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {catalog.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.swahiliName} ({p.name}) - Benchmark KSh {p.benchmarkPriceKshPerKg}/kg
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
                  <select
                    value={newOrderForm.unit}
                    onChange={e => setNewOrderForm({ ...newOrderForm, unit: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="gunia">Gunia (Standard Bag)</option>
                    <option value="debe">Debe (Tin)</option>
                    <option value="kilo">Kilo (Exact kg)</option>
                    <option value="net">Net (10kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Ward Location:</label>
                <select
                  value={newOrderForm.ward}
                  onChange={e => setNewOrderForm({ ...newOrderForm, ward: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Makadara - Hamza">Makadara - Hamza Market</option>
                  <option value="Makadara - Maringo">Makadara - Maringo Stage</option>
                  <option value="Makadara - Viwandani">Makadara - Viwandani Center</option>
                  <option value="Makadara - Harambee">Makadara - Harambee Junction</option>
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
                  Pool into Makadara Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
