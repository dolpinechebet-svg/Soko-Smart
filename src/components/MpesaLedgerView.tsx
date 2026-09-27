import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Building2,
  DollarSign,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LedgerEntry, MpesaTransaction, CooperativeSupplier } from '../types';

interface MpesaLedgerViewProps {
  cooperatives: CooperativeSupplier[];
}

export const MpesaLedgerView: React.FC<MpesaLedgerViewProps> = ({ cooperatives }) => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [summary, setSummary] = useState({
    totalCollections: 0,
    totalPayouts: 0,
    totalCommissions: 0,
    escrowBalance: 0
  });
  const [loading, setLoading] = useState(false);

  // STK Push Manual Test Form
  const [stkForm, setStkForm] = useState({
    phone: '254712345678',
    amount: 3510,
    vendorName: 'Mama Sarah Wanjiku'
  });
  const [stkFeedback, setStkFeedback] = useState<string | null>(null);

  // Cooperative Payout Form
  const [payoutForm, setPayoutForm] = useState({
    coopId: cooperatives[0]?.id || '',
    amount: 11700
  });

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ledger');
      if (res.ok) {
        const data = await res.json();
        setLedgerEntries(data.ledger || []);
        setTransactions(data.transactions || []);
        setSummary(data.summary || {
          totalCollections: 0,
          totalPayouts: 0,
          totalCommissions: 0,
          escrowBalance: 0
        });
      }
    } catch (err) {
      console.error('Ledger fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setStkFeedback('Inatuma STK Push kwa Safaricom Sandbox...');
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: stkForm.phone,
          amountKsh: stkForm.amount,
          vendorName: stkForm.vendorName,
          purpose: 'vendor_pool_collection'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStkFeedback(`✅ STK Push imetumwa! CheckoutID: ${data.checkoutRequestId}. Unaweza kuthibitisha PIN kwenye WhatsApp simulator.`);
        fetchLedger();
      }
    } catch (err) {
      setStkFeedback('Hitilafu wakati wa kutuma STK Push.');
    }
  };

  const handleReleasePayout = async () => {
    try {
      const res = await fetch('/api/ledger/payout-coop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cooperativeId: payoutForm.coopId,
          amountKsh: payoutForm.amount,
          agreementId: 'SS-MKD-260928-001'
        })
      });

      if (res.ok) {
        fetchLedger();
      }
    } catch (err) {
      console.error('Payout error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Escrow Summary Metrics */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Financial Settlement & Double-Entry Ledger
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">Safaricom Daraja API</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              M-PESA Escrow Suspense & Cooperative Payouts
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Strict isolation of funds: Mama Mboga contributions are held in trusted escrow accounts and reconciled via double-entry bookkeeping prior to releasing B2B payouts to farm co-operatives.
            </p>
          </div>

          <button
            onClick={fetchLedger}
            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reconcile
          </button>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-xs block mb-1">Total Collections (In)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-400 font-bold">KSh</span>
              <span className="text-xl font-bold text-stone-900 font-mono">
                {summary.totalCollections.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
              Via Daraja STK Push
            </span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 text-xs font-semibold block mb-1">Active Escrow Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-emerald-600 font-bold">KSh</span>
              <span className="text-xl font-bold text-emerald-950 font-mono">
                {summary.escrowBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-800 flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Held pending delivery inspection
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-xs block mb-1">Cooperative Payouts (Out)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-400 font-bold">KSh</span>
              <span className="text-xl font-bold text-stone-900 font-mono">
                {summary.totalPayouts.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-stone-400" />
              Via Daraja B2B Paybill
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-xs block mb-1">Platform Commission (2.5%)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-400 font-bold">KSh</span>
              <span className="text-xl font-bold text-stone-900 font-mono">
                {summary.totalCommissions.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
              Revenue allocation
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Double-Entry Immutable Ledger Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Double-Entry General Ledger (Audit Trail)
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {ledgerEntries.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[11px]">
                  <th className="pb-2 font-medium">Timestamp</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Debit</th>
                  <th className="pb-2 font-medium">Credit</th>
                  <th className="pb-2 font-medium text-right">Amount (KSh)</th>
                  <th className="pb-2 font-medium">Ref ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ledgerEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 font-mono text-[11px] text-stone-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-stone-800 text-[11px]">
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-600 font-mono text-[11px]">
                      {entry.debitAccount}
                    </td>
                    <td className="py-2.5 text-stone-600 font-mono text-[11px]">
                      {entry.creditAccount}
                    </td>
                    <td className="py-2.5 text-right font-bold font-mono text-stone-900">
                      KSh {entry.amountKsh.toLocaleString()}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-stone-500">
                      {entry.referenceId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Daraja STK Trigger & Co-op Disbursement Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Daraja Sandbox STK Push Tester */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              Direct STK Push Dispatcher
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              Trigger Daraja Lipa na M-PESA Online STK Push directly to a vendor:
            </p>

            <form onSubmit={handleTriggerStkPush} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">M-PESA Number (254...):</label>
                <input
                  type="text"
                  value={stkForm.phone}
                  onChange={e => setStkForm({ ...stkForm, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Amount (KSh):</label>
                <input
                  type="number"
                  value={stkForm.amount}
                  onChange={e => setStkForm({ ...stkForm, amount: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 font-bold font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch STK Push
              </button>
            </form>

            {stkFeedback && (
              <div className="mt-3 p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                {stkFeedback}
              </div>
            )}
          </div>

          {/* Release Co-op Payout Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-stone-700" />
              Disburse Co-op Payout (Daraja B2B)
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              Release remaining 50% from escrow suspense once delivery inspection at Hamza Dropoff is verified:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Cooperative:</label>
                <select
                  value={payoutForm.coopId}
                  onChange={e => setPayoutForm({ ...payoutForm, coopId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {cooperatives.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Paybill: {c.mpesaPaybill})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Payout Amount (KSh):</label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 font-bold font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleReleasePayout}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Release B2B Payout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
