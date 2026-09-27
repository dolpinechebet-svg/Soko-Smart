import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  ShieldCheck,
  QrCode,
  Download,
  Send,
  Languages,
  Hammer,
  Sparkles,
  Scissors,
  Apple,
  Utensils
} from 'lucide-react';
import { MicroAgreement, BusinessOwner, BusinessTradeCategory } from '../types';

interface MicroAgreementsViewProps {
  agreements: MicroAgreement[];
  businesses: BusinessOwner[];
  onConfirmBusinessAgreement: (agreementId: string, businessId: string) => void;
  onNavigateToMpesa: () => void;
}

export const MicroAgreementsView: React.FC<MicroAgreementsViewProps> = ({
  agreements,
  businesses,
  onConfirmBusinessAgreement,
  onNavigateToMpesa
}) => {
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(
    agreements[0]?.id || ''
  );
  const [languageMode, setLanguageMode] = useState<'swahili' | 'english' | 'bilingual'>('bilingual');

  const agreement = agreements.find(a => a.id === selectedAgreementId) || agreements[0];

  if (!agreement) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
        <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm font-medium">Bado hakuna mikataba ya kielektroniki iliyotengenezwa.</p>
      </div>
    );
  }

  const allBusinessesConfirmed = Object.values(agreement.businessConfirmations).every(v => v.confirmed);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Digital Micro-Purchase Agreements Desk
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">{agreement.contractNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Bilingual Trade Micro-Contract Generator
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Plain-language digital purchase records binding wholesalers and small business merchant pools. Confirmed via single-word WhatsApp reply ("NDIYO" / "YES").
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setLanguageMode('swahili')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  languageMode === 'swahili' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Kiswahili
              </button>
              <button
                onClick={() => setLanguageMode('english')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  languageMode === 'english' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguageMode('bilingual')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  languageMode === 'bilingual' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bilingual (Both)
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
              title="Print Delivery Docket"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agreement Selector Tabs */}
        {agreements.length > 1 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 overflow-x-auto text-xs">
            <span className="text-stone-400 font-medium">Select Agreement:</span>
            {agreements.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAgreementId(a.id)}
                className={`px-3 py-1 rounded-md font-medium font-mono text-xs ${
                  a.id === agreement.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {a.contractNumber} ({a.productName})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Agreement Document Preview */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  SOKO SMART REF: {agreement.contractNumber}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-mono">
                  HASH: {agreement.digitalVerificationHash}
                </span>
              </div>
              <h1 className="text-lg font-black text-stone-950 mt-1 uppercase tracking-tight">
                Micro-Purchase Sourcing Agreement · {agreement.category.toUpperCase()}
              </h1>
              <p className="text-xs text-stone-500">
                Makadara Small Business Merchant Pool ↔ {agreement.supplierName}
              </p>
            </div>

            <div className="w-16 h-16 bg-stone-50 border border-stone-200 rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
              <QrCode className="w-9 h-9 text-stone-800" />
              <span className="text-[9px] text-stone-500 font-mono mt-0.5">VERIFIED</span>
            </div>
          </div>

          {/* Key Parameters Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[10px]">Product / Material</span>
              <span className="font-bold text-stone-900 block truncate">{agreement.productName}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Aggregated Volume</span>
              <span className="font-bold text-stone-900 block">{agreement.totalQuantityBase.toLocaleString()} units</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Agreed Factory Rate</span>
              <span className="font-bold text-emerald-800 block font-mono">KSh {agreement.pricePerUnitKsh}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Total Consideration</span>
              <span className="font-bold text-stone-900 block font-mono">KSh {agreement.totalContractValueKsh.toLocaleString()}</span>
            </div>
          </div>

          {/* Agreement Body Text */}
          <div className="space-y-4 text-xs leading-relaxed text-stone-800">
            {(languageMode === 'swahili' || languageMode === 'bilingual') && (
              <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-100 font-sans">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 block mb-2">
                  🇰🇪 Nakala ya Kiswahili (Swahili Digital Record)
                </span>
                <pre className="font-sans whitespace-pre-line text-xs text-stone-800">
                  {agreement.swahiliText}
                </pre>
              </div>
            )}

            {(languageMode === 'english' || languageMode === 'bilingual') && (
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 font-sans">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block mb-2">
                  🇬🇧 English Formal Reference
                </span>
                <pre className="font-sans whitespace-pre-line text-xs text-stone-700">
                  {agreement.englishText}
                </pre>
              </div>
            )}
          </div>

          {/* Legal Transparency & Compliance Notice */}
          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Compliance & Legal Transparency Notice:</span>
              This micro-agreement serves as a lightweight digital ledger record for mutual trust and accountability between informal traders and registered wholesale suppliers. Funds are secured via Safaricom Daraja M-PESA escrow suspension prior to dispatch.
            </div>
          </div>
        </div>

        {/* Right Column: One-Word Confirmation Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
              One-Word Confirmation Status ("NDIYO" / "YES")
            </h3>

            {/* Supplier Signoff */}
            <div className="p-3 rounded-lg border border-stone-200 mb-3 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 truncate">
                  🏢 {agreement.supplierName}
                </span>
                {agreement.supplierConfirmed ? (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Confirmed
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Dispatch
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-mono">
                {agreement.supplierPhone}
              </span>
            </div>

            {/* Pooled Business Owners Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                Pooled Business Merchants:
              </span>

              {Object.entries(agreement.businessConfirmations).map(([bId, conf]) => {
                const matchedBiz = businesses.find(b => b.id === bId);
                const isConfirmed = conf.confirmed;

                return (
                  <div
                    key={bId}
                    className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-800 block">
                        {matchedBiz?.businessName || bId}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {matchedBiz?.phone}
                      </span>
                    </div>

                    {isConfirmed ? (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        "NDIYO" Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => onConfirmBusinessAgreement(agreement.id, bId)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        Simulate "NDIYO"
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Proceed to Escrow Ledger */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={onNavigateToMpesa}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Proceed to M-PESA Escrow Ledger</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
