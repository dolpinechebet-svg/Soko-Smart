import React from 'react';
import { ShoppingBag, PhoneCall, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { BusinessTradeCategory } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiConnected: boolean;
  unresolvedDisputesCount: number;
  pendingAgreementsCount: number;
  selectedTradeFilter: string;
  setSelectedTradeFilter: (trade: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  geminiConnected,
  unresolvedDisputesCount,
  pendingAgreementsCount,
  selectedTradeFilter,
  setSelectedTradeFilter
}) => {
  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp / SMS Chat', badge: null },
    { id: 'clustering', label: 'Multi-Trade Clustering', badge: null },
    { id: 'negotiation', label: 'Supplier Negotiation', badge: null },
    { id: 'agreements', label: 'Bilingual Agreements', badge: pendingAgreementsCount > 0 ? pendingAgreementsCount : null },
    { id: 'mpesa', label: 'M-PESA & Escrow', badge: null },
    { id: 'disputes', label: 'Disputes ("TATIZO")', badge: unresolvedDisputesCount > 0 ? unresolvedDisputesCount : null },
    { id: 'ontology', label: 'Trade Ontologies & Bands', badge: null }
  ];

  return (
    <header className="bg-[#0b2416] text-white border-b border-[#1b442d] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-base shadow-inner tracking-wider">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  Soko Smart
                </span>
                <span className="text-[11px] bg-emerald-900/90 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/60">
                  Agentic B2B Coordinator
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-normal">
                Trade-Agnostic Demand Pooling for Kenyan Small Businesses · Swahili · Sheng · English
              </p>
            </div>
          </div>

          {/* System Telemetry & Status */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-emerald-100/80">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>NLU: {geminiConnected ? 'Gemini 3.8 Flash' : 'Swahili/Sheng Engine'}</span>
            </div>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Cloud API</span>
            </div>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daraja M-PESA STK & Escrow</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-[#163825] scrollbar-none">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
