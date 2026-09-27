import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Scale,
  Sparkles,
  Send,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { NegotiationSession, DemandCluster } from '../types';

interface NegotiationRoomProps {
  clusterId?: string;
  clusters: DemandCluster[];
  onAgreementDrafted: (clusterId: string) => void;
  onNavigateToAgreements: () => void;
}

export const NegotiationRoom: React.FC<NegotiationRoomProps> = ({
  clusterId,
  clusters,
  onAgreementDrafted,
  onNavigateToAgreements
}) => {
  const activeCluster = clusters.find(c => c.id === clusterId) || clusters[1] || clusters[0];
  const [session, setSession] = useState<NegotiationSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulatedCoopPrice, setSimulatedCoopPrice] = useState<number>(23);
  const [simulatedCoopMessage, setSimulatedCoopMessage] = useState<string>('');
  const [overridePrice, setOverridePrice] = useState<number>(29);
  const [overrideNotes, setOverrideNotes] = useState<string>('Mvua kubwa imepandisha bei za kote Nairobi.');

  useEffect(() => {
    if (activeCluster) {
      fetchSession(activeCluster.id);
    }
  }, [activeCluster?.id]);

  const fetchSession = async (cId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/negotiation/${cId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (err) {
      console.warn('Fetch session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCoopReply = async (customPrice?: number, customMsg?: string) => {
    if (!activeCluster) return;
    const priceToSubmit = customPrice !== undefined ? customPrice : simulatedCoopPrice;
    setLoading(true);

    try {
      const res = await fetch(`/api/negotiation/${activeCluster.id}/coop-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedPricePerKg: priceToSubmit,
          message: customMsg || simulatedCoopMessage || `Ofa yetu ni KSh ${priceToSubmit} kwa kila kilo.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setSimulatedCoopMessage('');
      }
    } catch (err) {
      console.error('Coop reply error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanOverride = async (action: 'approve' | 'reject') => {
    if (!activeCluster) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/negotiation/${activeCluster.id}/human-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          approvedPricePerKg: overridePrice,
          notes: overrideNotes
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSession(updated);
      }
    } catch (err) {
      console.error('Override error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftAgreement = async () => {
    if (!activeCluster) return;
    try {
      const res = await fetch('/api/agreements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: activeCluster.id })
      });

      if (res.ok) {
        onAgreementDrafted(activeCluster.id);
        onNavigateToAgreements();
      }
    } catch (err) {
      console.error('Draft agreement error:', err);
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
        <Scale className="w-8 h-8 text-stone-300 mx-auto mb-2 animate-bounce" />
        <p className="text-sm font-medium">Inapakia mazungumzo ya chama cha wakulima...</p>
      </div>
    );
  }

  const isEscalated = session.status === 'escalated_to_ops';
  const isAgreed = session.status === 'agreed';

  return (
    <div className="space-y-6">
      {/* Negotiation Room Header & Status Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Bounded Autonomous Negotiation
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">{activeCluster.id}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              {activeCluster.produceName} ({session.totalKg.toLocaleString()} kg) ↔ {session.cooperativeName}
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Agent coordinates with farm cooperative dispatch via WhatsApp/SMS under strict algorithmically enforced safety price bands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAgreed ? (
              <button
                onClick={handleDraftAgreement}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                Draft Bilingual Micro-Agreement
              </button>
            ) : isEscalated ? (
              <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Escalated to Human Ops Lead
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Autonomous Bargaining Active
              </span>
            )}
          </div>
        </div>

        {/* Guardrail Policy Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100 text-xs">
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-stone-500 block text-[10px]">Floor (Farmer Cost Floor)</span>
            <span className="font-bold text-stone-800 text-sm">
              KSh {session.guardrails.minPricePerKg} / kg
            </span>
          </div>

          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-stone-500 block text-[10px]">Ceiling (Max Allowed Band)</span>
            <span className="font-bold text-rose-700 text-sm">
              KSh {session.guardrails.maxPricePerKg} / kg
            </span>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <span className="text-emerald-700 block text-[10px]">Current Coordinator Counter</span>
            <span className="font-bold text-emerald-900 text-sm">
              KSh {session.agreedPricePerKg || session.currentCounterPricePerKg} / kg
            </span>
          </div>

          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-stone-500 block text-[10px]">Payment & Delivery Terms</span>
            <span className="font-semibold text-stone-700 truncate block" title={session.guardrails.paymentSplit}>
              {session.guardrails.paymentSplit}
            </span>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Ops Escalation Card (Triggered on Guardrail Violation) */}
      {isEscalated && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-950">
                ⚠️ Platform Guardrail Breach: Human-in-the-Loop Approval Required
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                {session.escalationReason}
              </p>
              <div className="text-[11px] text-rose-700 mt-0.5">
                Per non-negotiable platform policy: The AI agent is prohibited from committing vendor mobile funds to farm-gate prices above configured ceilings without human buyer-rep authorization.
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-3 border border-rose-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
            <div className="md:col-span-3">
              <label className="block text-stone-600 font-medium mb-1">Approved Price / kg:</label>
              <input
                type="number"
                value={overridePrice}
                onChange={e => setOverridePrice(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div className="md:col-span-6">
              <label className="block text-stone-600 font-medium mb-1">Audit Justification Notes:</label>
              <input
                type="text"
                value={overrideNotes}
                onChange={e => setOverrideNotes(e.target.value)}
                placeholder="Reason for approving above ceiling..."
                className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end pt-4 md:pt-0">
              <button
                onClick={() => handleHumanOverride('reject')}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-semibold transition-colors"
              >
                Reject Offer
              </button>
              <button
                onClick={() => handleHumanOverride('approve')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors shadow-xs flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Negotiation Split View: Transcript + Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Complete Immutable Transcript */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Audit Transcript & Negotiation History
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Status: {session.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {session.transcript.map(msg => {
              const isAgent = msg.sender === 'agent';
              const isHuman = msg.sender === 'human_ops';
              const isCoop = msg.sender === 'cooperative';

              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    isHuman
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950 ring-1 ring-amber-400'
                      : isAgent
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold flex items-center gap-1.5">
                      {isHuman ? (
                        <span className="text-amber-800">👤 {msg.senderName}</span>
                      ) : isAgent ? (
                        <span className="text-emerald-800">🤖 {msg.senderName}</span>
                      ) : (
                        <span className="text-stone-700">🚜 {msg.senderName}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="whitespace-pre-line text-xs font-normal">
                    {msg.message}
                  </p>

                  {msg.priceOfferPerKg && (
                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center gap-2 text-[11px]">
                      <span className="font-semibold">Offer Price:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-300 font-bold">
                        KSh {msg.priceOfferPerKg} / kg
                      </span>
                      <span className="text-stone-500">
                        (~KSh {(msg.priceOfferPerKg * session.totalKg).toLocaleString()} total batch)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Co-op Response Tester & Guardrail Simulation Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Cooperative Simulation Deck
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              Test how the Soko Smart agent reacts to different price asks from farm cooperatives:
            </p>

            {/* Test Scenario Buttons */}
            <div className="space-y-2 text-xs">
              <button
                onClick={() =>
                  handleSendCoopReply(
                    21,
                    'Tumekubaliana! Tunaweza kufikisha kilo 350 za sukuma wiki safi kabla ya 06:30 AM Hamza Market kwa KSh 21/kg.'
                  )
                }
                disabled={loading}
                className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block">Scenario A: Co-op Accepts (KSh 21/kg)</span>
                  <span className="text-emerald-700 text-[11px]">
                    Within guardrail → Agent immediately agrees and moves to draft contract.
                  </span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSendCoopReply(
                    32,
                    'Kutokana na uhaba wa mafuta na mvua Limuru, bei yetu ya chini ni KSh 32 kwa kilo, hatuwezi kwenda chini ya hapo.'
                  )
                }
                disabled={loading}
                className="w-full text-left p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors flex items-start gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900 block">Scenario B: Guardrail Violation (KSh 32/kg)</span>
                  <span className="text-rose-700 text-[11px]">
                    Exceeds KSh 28 ceiling → Agent halts and triggers Human-in-the-Loop review!
                  </span>
                </div>
              </button>
            </div>

            {/* Custom Price Slider / Reply */}
            <div className="mt-4 pt-4 border-t border-stone-100 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-stone-700">Custom Co-op Counter Ask:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  KSh {simulatedCoopPrice} / kg
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={38}
                value={simulatedCoopPrice}
                onChange={e => setSimulatedCoopPrice(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />

              <textarea
                rows={2}
                value={simulatedCoopMessage}
                onChange={e => setSimulatedCoopMessage(e.target.value)}
                placeholder="Optional custom Swahili/English message from cooperative..."
                className="w-full mt-2 bg-stone-50 border border-stone-300 rounded p-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                onClick={() => handleSendCoopReply()}
                disabled={loading}
                className="w-full mt-2 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Co-op Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
