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
  Languages
} from 'lucide-react';
import { MicroAgreement, MamaMbogaVendor } from '../types';

interface MicroAgreementsViewProps {
  agreements: MicroAgreement[];
  vendors: MamaMbogaVendor[];
  onConfirmVendorAgreement: (agreementId: string, vendorId: string) => void;
  onNavigateToMpesa: () => void;
}

export const MicroAgreementsView: React.FC<MicroAgreementsViewProps> = ({
  agreements,
  vendors,
  onConfirmVendorAgreement,
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
        <p className="text-sm font-medium">Bado hakuna mikataba iliyotengenezwa.</p>
      </div>
    );
  }

  const allVendorsConfirmed = Object.values(agreement.vendorConfirmations).every(v => v.confirmed);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Digital Micro-Agreements Desk
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">{agreement.contractNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Bilingual Farm-to-Vendor Micro-Contract
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Plain-language digital delivery agreements legally binding farm cooperatives and Mama Mboga clusters. Confirmed via single-word WhatsApp reply ("NDIYO" / "YES").
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

        {/* Agreement Switcher if multiple */}
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
                {a.contractNumber} ({a.produceName})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Agreement Document Preview */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
          {/* Official Document Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  SOKO SMART REPO: {agreement.contractNumber}
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-mono">
                  HASH: {agreement.digitalVerificationHash}
                </span>
              </div>
              <h1 className="text-lg font-black text-stone-950 mt-1 uppercase tracking-tight">
                Micro-Delivery Produce Sourcing Agreement
              </h1>
              <p className="text-xs text-stone-500">
                Makadara Informal Produce Vendors Pool ↔ {agreement.cooperativeName}
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
              <span className="text-stone-500 block text-[10px]">Produce & Quality Grade</span>
              <span className="font-bold text-stone-900 block">{agreement.produceName}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Total Pooled Volume</span>
              <span className="font-bold text-stone-900 block">{agreement.totalQuantityKg.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Agreed Farm-gate Rate</span>
              <span className="font-bold text-emerald-800 block font-mono">KSh {agreement.pricePerKgKsh} / kg</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Total Consideration</span>
              <span className="font-bold text-stone-900 block font-mono">KSh {agreement.totalContractValueKsh.toLocaleString()}</span>
            </div>
          </div>

          {/* Agreement Body Text (Swahili, English or Bilingual) */}
          <div className="space-y-4 text-xs leading-relaxed text-stone-800">
            {(languageMode === 'swahili' || languageMode === 'bilingual') && (
              <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-100 font-sans">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-2">
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

          {/* Compliance & Regulatory Notice */}
          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Compliance & Legal Transparency Notice:</span>
              This micro-agreement serves as a lightweight digital ledger record for mutual trust and accountability between informal vendors and registered farm cooperatives. Funds are secured via Safaricom Daraja M-PESA escrow suspension prior to dispatch.
            </div>
          </div>
        </div>

        {/* Right Column: One-Tap Confirmation Status & Signoff Desk */}
        <div className="lg:col-span-4 space-y-4">
          {/* Parties Confirmation Tracker */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
              One-Word Confirmation Status ("NDIYO" / "YES")
            </h3>

            {/* Farm Cooperative Signoff */}
            <div className="p-3 rounded-lg border border-stone-200 mb-3 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  🚜 {agreement.cooperativeName}
                </span>
                {agreement.coopConfirmed ? (
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
                {agreement.cooperativePhone}
              </span>
            </div>

            {/* Pooled Mama Mbogas Signoff Checklists */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                Mama Mboga Cluster Members:
              </span>

              {Object.entries(agreement.vendorConfirmations).map(([vId, conf]) => {
                const matchedVendor = vendors.find(v => v.id === vId);
                const isConfirmed = conf.confirmed;

                return (
                  <div
                    key={vId}
                    className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-800 block">
                        {matchedVendor?.name || vId}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {matchedVendor?.phone}
                      </span>
                    </div>

                    {isConfirmed ? (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        "NDIYO" Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => onConfirmVendorAgreement(agreement.id, vId)}
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

            {/* Action to Proceed to M-PESA STK Escrow Settlement */}
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
