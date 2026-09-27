import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  User,
  MapPin,
  Clock,
  Hammer,
  Sparkles,
  Scissors,
  Apple,
  Utensils
} from 'lucide-react';
import { DisputeTicket, BusinessOwner, BusinessTradeCategory } from '../types';

interface DisputeDeskProps {
  businesses: BusinessOwner[];
  onDisputeResolved?: () => void;
}

export const DisputeDesk: React.FC<DisputeDeskProps> = ({ businesses, onDisputeResolved }) => {
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('');
  const [resolutionAction, setResolutionAction] = useState<'refund' | 'replace' | 'reject'>('refund');
  const [refundAmount, setRefundAmount] = useState<number>(2280);
  const [resolutionNotes, setResolutionNotes] = useState<string>('Picha zimehakikiwa: Mabati 3 yalikuwa yamepondoka wakati wa kushusha. Rejesho la papo hapo limeidhinishwa.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
        if (data.length > 0 && !selectedDisputeId) {
          setSelectedDisputeId(data[0].id);
          setRefundAmount(data[0].claimedAmountKsh);
        }
      }
    } catch (err) {
      console.error('Fetch disputes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedDisputeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/disputes/${selectedDisputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: resolutionAction,
          refundAmountKsh: refundAmount,
          resolutionNotes
        })
      });

      if (res.ok) {
        fetchDisputes();
        onDisputeResolved?.();
      }
    } catch (err) {
      console.error('Resolve dispute error:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeDispute = disputes.find(d => d.id === selectedDisputeId) || disputes[0];

  const getIssueLabel = (issue: string) => {
    switch (issue) {
      case 'damaged_item':
        return '🔨 Damaged / Broken Item';
      case 'counterfeit_wrong_spec':
        return '⚠️ Wrong Spec / Counterfeit';
      case 'short_quantity':
        return '⚖️ Short Quantity';
      case 'spoilage':
        return '🥀 Perishable Spoilage';
      default:
        return '⚠️ ' + issue;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Multi-Trade Quality & Dispute Desk
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">Keyword Trigger: "TATIZO"</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Quality Assurance & M-PESA B2C Reversals
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              When a small business owner flags damaged stock, wrong specification, or missing quantities at the delivery hub, Soko Smart logs photo evidence and executes automated M-PESA B2C refunds from the supplier escrow hold.
            </p>
          </div>

          <button
            onClick={fetchDisputes}
            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tickets Queue */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Active Dispute Tickets ({disputes.length})
            </span>
            <span className="text-xs text-stone-400">Hamza Staging Hub</span>
          </div>

          <div className="space-y-2">
            {disputes.map(disp => {
              const isSelected = disp.id === selectedDisputeId;
              const isPending = disp.status === 'open' || disp.status === 'investigating';

              return (
                <button
                  key={disp.id}
                  onClick={() => {
                    setSelectedDisputeId(disp.id);
                    setRefundAmount(disp.claimedAmountKsh);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-1 ring-rose-500'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{disp.businessName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isPending
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {disp.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 mt-1 flex items-center justify-between">
                    <span className="font-semibold text-rose-800">
                      {getIssueLabel(disp.issueType)} - {disp.productName}
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      KSh {disp.claimedAmountKsh.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-1 italic">
                    "{disp.description}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Dispute Detail & Resolution */}
        {activeDispute && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-mono text-stone-400 block uppercase">
                  TICKET: {activeDispute.id} · {activeDispute.category}
                </span>
                <h3 className="text-lg font-bold text-stone-900 leading-tight">
                  {activeDispute.businessName} ({activeDispute.phone})
                </h3>
                <span className="text-xs text-stone-500 mt-0.5 block">
                  Filed via WhatsApp keyword "TATIZO" at{' '}
                  {new Date(activeDispute.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <span className="text-xs font-bold font-mono px-3 py-1 bg-stone-100 rounded-lg text-stone-800">
                Claim: KSh {activeDispute.claimedAmountKsh.toLocaleString()}
              </span>
            </div>

            {/* Statement */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
              <span className="text-stone-500 block text-[11px] font-semibold mb-1">
                Trader Voice / Text Statement:
              </span>
              <p className="text-stone-800 italic leading-relaxed">
                "{activeDispute.description}"
              </p>
            </div>

            {/* Photo Evidence */}
            {activeDispute.evidencePhotoUrl && (
              <div>
                <span className="text-xs font-semibold text-stone-700 block mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-stone-500" />
                  Photographic Evidence Submitted by Trader:
                </span>
                <div className="relative rounded-lg overflow-hidden border border-stone-200 max-h-48 bg-stone-950 flex items-center justify-center">
                  <img
                    src={activeDispute.evidencePhotoUrl}
                    alt="Dispute Spoilage/Damage Evidence"
                    className="w-full h-48 object-cover opacity-90"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-xs font-mono">
                    GEO: HAMZA_MAKADARA · TIMESTAMP: {activeDispute.createdAt}
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Form */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Take Operational Action:
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setResolutionAction('refund')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                    resolutionAction === 'refund'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  M-PESA B2C Refund
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionAction('replace')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                    resolutionAction === 'replace'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Dispatch Replacement
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionAction('reject')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                    resolutionAction === 'reject'
                      ? 'border-stone-800 bg-stone-900 text-white shadow-2xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Reject Claim
                </button>
              </div>

              {resolutionAction === 'refund' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">
                      Refund Amount (KSh):
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={e => setRefundAmount(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 font-bold font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">
                      Disbursement Channel:
                    </label>
                    <div className="bg-stone-100 rounded px-3 py-2 text-stone-700 font-mono">
                      M-PESA B2C → {activeDispute.phone}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-600 font-medium mb-1 text-xs">
                  Audit Notes for Trader & Supplier:
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleResolve}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Execute Resolution & Settle via M-PESA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
