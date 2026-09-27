import React from 'react';
import { ShoppingBag, PhoneCall, ShieldCheck, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiConnected: boolean;
  unresolvedDisputesCount: number;
  pendingAgreementsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  geminiConnected,
  unresolvedDisputesCount,
  pendingAgreementsCount
}) => {
  const tabs = [
    { id: 'whatsapp', label: 'Mama Mboga WhatsApp', badge: null },
    { id: 'clustering', label: 'Demand Clustering', badge: null },
    { id: 'negotiation', label: 'Co-op Negotiation', badge: null },
    { id: 'agreements', label: 'Micro-Agreements', badge: pendingAgreementsCount > 0 ? pendingAgreementsCount : null },
    { id: 'mpesa', label: 'M-PESA & Ledger', badge: null },
    { id: 'disputes', label: 'Disputes Desk', badge: unresolvedDisputesCount > 0 ? unresolvedDisputesCount : null },
    { id: 'ontology', label: 'Produce & Guardrails', badge: null }
  ];

  return (
    <header className="bg-[#143626] text-white border-b border-[#23533c] sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Corridor Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-lg shadow-inner">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-white">Soko Smart</span>
                <span className="text-xs bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                  Agentic Produce Coordinator
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 font-normal">
                Corridor: Makadara, Nairobi · Swahili · Sheng · English
              </p>
            </div>
          </div>

          {/* System Telemetry & Status */}
          <div className="hidden md:flex items-center gap-4 text-xs text-emerald-100/80">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>NLU: {geminiConnected ? 'Gemini 3.8 Flash' : 'Swahili NLU Rule-Engine'}</span>
            </div>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Cloud API</span>
            </div>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daraja M-PESA STK</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-[#1e4d36] scrollbar-none">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-sm'
                    : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
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
