import React, { useState } from 'react';
import {
  User,
  Globe,
  PhoneCall,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { BusinessOwner, Language, BusinessTradeCategory } from '../types';
import { getTranslations } from '../utils/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiConnected: boolean;
  unresolvedDisputesCount: number;
  pendingAgreementsCount: number;
  selectedTradeFilter: string;
  setSelectedTradeFilter: (trade: string) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: BusinessOwner | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  geminiConnected,
  unresolvedDisputesCount,
  pendingAgreementsCount,
  selectedTradeFilter,
  setSelectedTradeFilter,
  currentLanguage,
  onLanguageChange,
  currentUser,
  isAuthenticated,
  onLogout
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = getTranslations(currentLanguage);

  const tabs = [
    { id: 'whatsapp', label: t.tabs.whatsapp, badge: null },
    { id: 'clustering', label: t.tabs.clustering, badge: null },
    { id: 'negotiation', label: t.tabs.negotiation, badge: null },
    { id: 'agreements', label: t.tabs.agreements, badge: pendingAgreementsCount > 0 ? pendingAgreementsCount : null },
    { id: 'mpesa', label: t.tabs.mpesa, badge: null },
    { id: 'disputes', label: t.tabs.disputes, badge: unresolvedDisputesCount > 0 ? unresolvedDisputesCount : null },
    { id: 'ontology', label: t.tabs.ontology, badge: null },
    { id: 'login', label: t.tabs.login, badge: null, isAuthTab: true }
  ];

  const languageLabels: Record<Language, { label: string; short: string; flag: string }> = {
    swahili: { label: 'Kiswahili Sanifu', short: 'Kiswahili', flag: '🇰🇪' },
    sheng: { label: 'Sheng ya Mtaa', short: 'Sheng', flag: '🇰🇪' },
    english: { label: 'English (UK/KE)', short: 'English', flag: '🇬🇧' },
    mixed: { label: 'Soko Mix (Swahili/Eng)', short: 'Mixed', flag: '🇰🇪' }
  };

  return (
    <header className="bg-[#0b2416] text-white border-b border-[#1b442d] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab(isAuthenticated ? 'whatsapp' : 'login')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-base shadow-inner tracking-wider">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  Soko Smart
                </span>
                <span className="text-[11px] bg-emerald-900/90 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/60 hidden sm:inline-block">
                  Agentic B2B Coordinator
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-normal hidden md:block">
                Trade-Agnostic Demand Pooling for Kenyan Small Businesses · Swahili · Sheng · English
              </p>
            </div>
          </div>

          {/* Right Controls: Telemetry, Language Preferences Dropdown & User Identity Profile */}
          <div className="flex items-center gap-3">
            {/* System Status Indicators (Desktop) */}
            <div className="hidden xl:flex items-center gap-3 text-xs text-emerald-100/70 border-r border-emerald-900/80 pr-3">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>{geminiConnected ? 'Gemini 3.8' : 'NLU Active'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daraja Escrow</span>
              </div>
            </div>

            {/* Quick Language Preference Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-850 text-white text-xs font-semibold border border-emerald-700/60 transition-colors shadow-xs"
                title="Change language preferences"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>{languageLabels[currentLanguage]?.flag}</span>
                <span className="hidden sm:inline">{languageLabels[currentLanguage]?.short}</span>
                <ChevronDown className="w-3 h-3 text-emerald-300" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-stone-900 shadow-xl border border-stone-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                      Lugha / Language Preferences
                    </div>
                    {(Object.keys(languageLabels) as Language[]).map(langKey => {
                      const isSelected = currentLanguage === langKey;
                      return (
                        <button
                          key={langKey}
                          onClick={() => {
                            onLanguageChange(langKey);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                            isSelected ? 'bg-emerald-50/80 text-emerald-900 font-bold' : 'text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{languageLabels[langKey].flag}</span>
                            <span>{languageLabels[langKey].label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                    <div className="p-2 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setActiveTab('login');
                          setLangDropdownOpen(false);
                        }}
                        className="w-full text-center py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Language & Identity Settings →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Individual Identity Login / Profile Card Button */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    activeTab === 'login'
                      ? 'bg-emerald-800 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                      : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-white border-emerald-700/60'
                  }`}
                  title="View identity or log out"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
                    {currentUser.ownerName
                      ? currentUser.ownerName.split(' ').map(n => n[0]).slice(0, 2).join('')
                      : 'ID'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-xs leading-tight text-white flex items-center gap-1">
                      <span>{currentUser.ownerName}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-[10px] text-emerald-300/80 leading-tight truncate max-w-[130px]">
                      {currentUser.businessName}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-emerald-300 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-stone-900 shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <div className="font-bold text-sm text-stone-900">{currentUser.ownerName}</div>
                        <div className="text-xs text-stone-600">{currentUser.businessName}</div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Kenyan Merchant · {currentUser.ward}</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveTab('login');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Digital Trader ID & Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('login');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Change Language Preferences</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-stone-100">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out / Ondoka</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Ingia</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-[#163825] scrollbar-none items-center">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : tab.isAuthTab
                    ? 'text-emerald-300 bg-emerald-900/40 hover:bg-emerald-900/70 hover:text-white border border-emerald-700/50'
                    : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                {tab.isAuthTab && <User className="w-3 h-3 text-emerald-400" />}
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
