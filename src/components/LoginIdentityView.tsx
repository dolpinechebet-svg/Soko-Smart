import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Lock,
  Globe,
  Building2,
  MapPin,
  Sparkles,
  LogIn,
  LogOut,
  UserPlus,
  Star,
  Award,
  QrCode,
  Check,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { BusinessOwner, Language, BusinessTradeCategory } from '../types';
import { getTranslations } from '../utils/translations';

interface LoginIdentityViewProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: BusinessOwner | null;
  isAuthenticated: boolean;
  onUserLogin: (user: BusinessOwner) => void;
  onLogout: () => void;
  allBusinesses: BusinessOwner[];
  onRefreshBusinesses: () => void;
  onNavigateToWorkspace?: () => void;
}

export const LoginIdentityView: React.FC<LoginIdentityViewProps> = ({
  currentLanguage,
  onLanguageChange,
  currentUser,
  isAuthenticated,
  onUserLogin,
  onLogout,
  allBusinesses,
  onRefreshBusinesses,
  onNavigateToWorkspace
}) => {
  const t = getTranslations(currentLanguage);

  // Authentication mode: 'phone' | 'quick' | 'register'
  const [authMode, setAuthMode] = useState<'phone' | 'quick' | 'register'>('phone');

  // Phone & PIN state
  const [phoneInput, setPhoneInput] = useState('0712998877');
  const [pinInput, setPinInput] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration state
  const [regForm, setRegForm] = useState({
    ownerName: '',
    businessName: '',
    category: 'hardware' as BusinessTradeCategory,
    ward: '',
    locationDesc: '',
    phone: '',
    nationalId: '',
    preferredLanguage: currentLanguage,
    pin: '1234',
    typicalNeeds: ''
  });

  const languageOptions: { id: Language; name: string; badge: string; desc: string; sample: string; flag: string }[] = [
    {
      id: 'swahili',
      name: t.languagePref.options.swahili.name,
      badge: t.languagePref.options.swahili.badge,
      desc: t.languagePref.options.swahili.desc,
      sample: t.languagePref.options.swahili.preview,
      flag: '🇰🇪'
    },
    {
      id: 'sheng',
      name: t.languagePref.options.sheng.name,
      badge: t.languagePref.options.sheng.badge,
      desc: t.languagePref.options.sheng.desc,
      sample: t.languagePref.options.sheng.preview,
      flag: '🇰🇪'
    },
    {
      id: 'english',
      name: t.languagePref.options.english.name,
      badge: t.languagePref.options.english.badge,
      desc: t.languagePref.options.english.desc,
      sample: t.languagePref.options.english.preview,
      flag: '🇬🇧'
    },
    {
      id: 'mixed',
      name: t.languagePref.options.mixed.name,
      badge: t.languagePref.options.mixed.badge,
      desc: t.languagePref.options.mixed.desc,
      sample: t.languagePref.options.mixed.preview,
      flag: '🇰🇪'
    }
  ];

  // Quick profile select
  const handleSelectBusiness = async (b: BusinessOwner) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: b.id })
      });
      if (res.ok) {
        const data = await res.json();
        onUserLogin(data.user);
        setAuthSuccess(`${t.auth.loginSuccess} ${data.user.ownerName} (${data.user.businessName})`);
        if (data.user.preferredLanguage) {
          onLanguageChange(data.user.preferredLanguage);
        }
      } else {
        // Fallback local
        onUserLogin(b);
        setAuthSuccess(`${t.auth.loginSuccess} ${b.ownerName}`);
        if (b.preferredLanguage) onLanguageChange(b.preferredLanguage);
      }
    } catch {
      onUserLogin(b);
      setAuthSuccess(`${t.auth.loginSuccess} ${b.ownerName}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAuthSuccess(null), 3500);
    }
  };

  // Phone + PIN login
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) {
      setAuthError('Please enter your mobile phone number / Weka nambari ya simu');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, pin: pinInput || '1234' })
      });

      if (res.ok) {
        const data = await res.json();
        onUserLogin(data.user);
        setAuthSuccess(`${t.auth.loginSuccess} ${data.user.ownerName} (${data.user.businessName})`);
        if (data.user.preferredLanguage) {
          onLanguageChange(data.user.preferredLanguage);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(
          errData.error ||
            'Nambari hii au PIN haijapatikana. Tafadhali thibitisha namba yako au chagua mfanyabiashara kwenye orodha.'
        );
      }
    } catch {
      setAuthError('Kuna hitilafu ya mtandao. Tafadhali jaribu tena.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAuthSuccess(null), 3500);
    }
  };

  // Demo account quick filler
  const handleFillDemoAccount = (b: BusinessOwner) => {
    setPhoneInput(b.phone.replace('+254', '0'));
    setPinInput(b.pin || '1234');
    setAuthError(null);
  };

  // Register new trader
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.ownerName || !regForm.businessName || !regForm.phone) {
      setAuthError('Jina, jina la biashara, na nambari ya simu ni lazima.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });

      if (res.ok) {
        const data = await res.json();
        onRefreshBusinesses();
        onUserLogin(data.user);
        setAuthSuccess(t.auth.registeredSuccess);
        setAuthMode('phone');
        if (data.user.preferredLanguage) {
          onLanguageChange(data.user.preferredLanguage);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.error || 'Usajili haukufaulu. Tafadhali kagua taarifa ulizoingiza.');
      }
    } catch {
      setAuthError('Kuna hitilafu ya mtandao wakati wa usajili.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAuthSuccess(null), 3500);
    }
  };

  // Change language preference
  const handleSetLanguage = async (newLang: Language) => {
    onLanguageChange(newLang);
    if (currentUser?.id) {
      try {
        await fetch(`/api/users/${currentUser.id}/language`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredLanguage: newLang })
        });
      } catch (err) {
        console.warn('Could not sync language to backend:', err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner / Identity Summary */}
      <div className="bg-gradient-to-r from-[#0b2416] via-[#103822] to-[#174e30] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Soko Smart Digital Identity & Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isAuthenticated ? t.auth.title : 'Karibu Soko Smart · Trader Log In'}
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl">
              {isAuthenticated
                ? t.auth.subtitle
                : 'Sign in to access your pooled wholesale demand orders, WhatsApp B2B coordinator, and verified M-PESA escrow ledger.'}
            </p>
          </div>

          {/* Quick Network Status */}
          <div className="flex items-center gap-3 bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-700/50 backdrop-blur-sm self-start md:self-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              🇰🇪
            </div>
            <div className="text-xs">
              <div className="text-emerald-200/70 font-medium">Verified Network</div>
              <div className="font-bold text-white text-sm">
                {allBusinesses.length} Kenyan Merchants
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {authSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-sm shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{authSuccess}</span>
        </div>
      )}

      {authError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 text-sm shadow-xs animate-fadeIn">
          <Lock className="w-5 h-5 text-red-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* ACTIVE LOGGED-IN TRADER IDENTITY CARD (when authenticated) */}
      {isAuthenticated && currentUser && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0b2416] text-emerald-400 font-extrabold text-xl flex items-center justify-center shadow-md">
                {currentUser.ownerName
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-stone-900">{currentUser.ownerName}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <Check className="w-3 h-3" />
                    {t.auth.verifiedBadge}
                  </span>
                </div>
                <div className="text-sm font-medium text-stone-600 flex items-center gap-2 flex-wrap">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{currentUser.businessName}</span>
                  <span className="text-stone-300">·</span>
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{currentUser.ward}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    {currentUser.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              {onNavigateToWorkspace && (
                <button
                  onClick={onNavigateToWorkspace}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-stone-200"
                title="Log out from current identity"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span>{t.auth.logoutButton}</span>
              </button>
            </div>
          </div>

          {/* Credentials and Escrow Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
              <div className="text-[11px] text-stone-500 font-medium">{t.auth.reputationFulfillment}</div>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                {currentUser.reputationScore?.fulfillmentRate || 98}%
              </div>
              <div className="text-[10px] text-stone-400">Order arrival reliability</div>
            </div>

            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
              <div className="text-[11px] text-stone-500 font-medium">{t.auth.reputationRating}</div>
              <div className="text-lg font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                <span>{currentUser.reputationScore?.rating || 4.9}</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-[10px] text-stone-400">{currentUser.reputationScore?.totalOrders || 28} pooled orders</div>
            </div>

            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
              <div className="text-[11px] text-stone-500 font-medium">M-PESA Settlement</div>
              <div className="text-sm font-bold text-stone-900 mt-1 font-mono">
                {currentUser.phone}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">Daraja STK Connected</div>
            </div>

            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
              <div className="text-[11px] text-stone-500 font-medium">National ID / Staging Bay</div>
              <div className="text-sm font-bold text-stone-900 mt-1 font-mono">
                {currentUser.nationalId || 'Verified Merchant'}
              </div>
              <div className="text-[10px] text-stone-400">Hamza & Makadara Hubs</div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN & AUTHENTICATION PORTAL (Shown when not authenticated OR to switch user) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-bold text-stone-900">
                {isAuthenticated ? t.auth.switchIdentity : t.auth.loginForIdentity}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Sign in with your Kenyan phone number and PIN, or select a verified merchant identity below:
            </p>
          </div>

          {/* Quick language toggle pill on login card */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto border border-stone-200">
            {languageOptions.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => handleSetLanguage(l.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentLanguage === l.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {l.flag} {l.id.toUpperCase().slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabbed Login Modes */}
        <div className="flex border-b border-stone-200 space-x-4">
          <button
            onClick={() => setAuthMode('phone')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
              authMode === 'phone'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{t.auth.phonePinLogin}</span>
          </button>

          <button
            onClick={() => setAuthMode('quick')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
              authMode === 'quick'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.auth.quickProfiles}</span>
          </button>

          <button
            onClick={() => setAuthMode('register')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
              authMode === 'register'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.auth.newTraderRegister}</span>
          </button>
        </div>

        {/* TAB 1: PHONE & PIN LOGIN */}
        {authMode === 'phone' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <form onSubmit={handlePhoneLogin} className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.enterPhone} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0712 998 877 au +254 712..."
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-mono"
                    required
                  />
                  <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Accepts Safaricom M-PESA & Airtel numbers (e.g. 0712998877 or +254712998877)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.enterPin} *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    placeholder="1234"
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-mono tracking-widest"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-stone-500">
                    Default demo PIN: <span className="font-mono font-bold text-emerald-800">1234</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      setOtpInput('829104');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Request SMS Code
                  </button>
                </div>
              </div>

              {/* Remember me & Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Remember my login on this device</span>
                </label>
              </div>

              {/* OTP Simulation Card if clicked */}
              {otpSent && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 animate-fadeIn">
                  <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>SMS Verification Code Sent (Simulated Daraja SMS)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      placeholder="6-digit OTP"
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-emerald-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setPinInput('1234')}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Apply Code
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0b2416] hover:bg-[#133c25] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : t.auth.loginButton}</span>
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="md:col-span-5 bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>One-Click Demo Credentials</span>
              </div>
              <p className="text-xs text-stone-500">
                Click any Kenyan merchant profile to auto-fill their credentials and PIN:
              </p>
              <div className="space-y-1.5">
                {allBusinesses.slice(0, 4).map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleFillDemoAccount(b)}
                    className="w-full text-left p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900">{b.ownerName}</div>
                      <div className="text-[11px] text-stone-500">{b.businessName}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Auto Fill →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK PROFILES SELECT */}
        {authMode === 'quick' && (
          <div className="space-y-4">
            <div className="text-xs text-stone-500">
              Select any registered Kenyan merchant to instantly sign in as their verified identity:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {allBusinesses.map(biz => {
                const isCurrent = currentUser?.id === biz.id;
                return (
                  <div
                    key={biz.id}
                    onClick={() => handleSelectBusiness(biz)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-stone-50/50 hover:border-emerald-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#0b2416] text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {biz.ownerName
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{biz.ownerName}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-600">{biz.businessName}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-emerald-800 uppercase tracking-wider text-[10px]">
                            {biz.category.replace('_', ' ')}
                          </span>
                          <span>·</span>
                          <span>{biz.ward}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      {isCurrent ? 'Active' : 'Log In →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER NEW TRADER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.fullName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kiprono"
                  value={regForm.ownerName}
                  onChange={e => setRegForm({ ...regForm, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.businessName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiprono Hardware & Tools"
                  value={regForm.businessName}
                  onChange={e => setRegForm({ ...regForm, businessName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.tradeCategory}
                </label>
                <select
                  value={regForm.category}
                  onChange={e => setRegForm({ ...regForm, category: e.target.value as BusinessTradeCategory })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="hardware">Hardware & Construction (Saruji, Mabati, Nails)</option>
                  <option value="salon_beauty">Salon & Beauty (Braids, Relaxers, Shampoos)</option>
                  <option value="produce_kiosk">Mama Mboga / Fresh Produce (Nyanya, Vitunguu)</option>
                  <option value="tailoring_textiles">Tailoring & Textiles (Vitambaa, Zips)</option>
                  <option value="kibanda_food">Food Kiosk & Kibanda (Cooking Oil, Unga)</option>
                  <option value="boda_parts">Boda Boda Spares (Oil 4T, Plugs, Tubes)</option>
                  <option value="general_duka">General Duka Provisions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.phoneLabel} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+254 7..."
                  value={regForm.phone}
                  onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.countyWard}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Makadara - Hamza / Gikomba Market"
                  value={regForm.ward}
                  onChange={e => setRegForm({ ...regForm, ward: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.locationDesc}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stall 14C near Hamza Bus Stage"
                  value={regForm.locationDesc}
                  onChange={e => setRegForm({ ...regForm, locationDesc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.nationalIdLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29881726"
                  value={regForm.nationalId}
                  onChange={e => setRegForm({ ...regForm, nationalId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Preferred Communication Language
                </label>
                <select
                  value={regForm.preferredLanguage}
                  onChange={e => setRegForm({ ...regForm, preferredLanguage: e.target.value as Language })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="swahili">Kiswahili Sanifu</option>
                  <option value="sheng">Sheng ya Mtaa</option>
                  <option value="english">English (Commercial)</option>
                  <option value="mixed">Kiswahili + English (Mixed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.typicalNeedsLabel}
              </label>
              <input
                type="text"
                placeholder="e.g. Saruji, Mabati G30, Misumari 3 inch"
                value={regForm.typicalNeeds}
                onChange={e => setRegForm({ ...regForm, typicalNeeds: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : t.auth.registerSubmit}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('phone')}
                className="px-4 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-sm font-medium transition-colors"
              >
                {t.auth.cancel}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* LANGUAGE PREFERENCES SECTION (Full interactive preview) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-bold text-stone-900">
                {t.languagePref.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {t.languagePref.subtitle}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            Current: {languageOptions.find(o => o.id === currentLanguage)?.name}
          </span>
        </div>

        {/* 4 Interactive Language Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languageOptions.map(option => {
            const isSelected = currentLanguage === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handleSetLanguage(option.id)}
                className={`cursor-pointer rounded-xl p-4 sm:p-5 transition-all relative border-2 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-stone-200 bg-stone-50/40 hover:border-emerald-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{option.flag}</span>
                    <span className="font-bold text-stone-900 text-sm sm:text-base">{option.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {option.badge}
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-stone-300" />
                  )}
                </div>

                <p className="text-xs text-stone-600 mb-3">{option.desc}</p>

                {/* Live Message Sample Preview */}
                <div className="bg-white rounded-lg p-2.5 border border-stone-200 text-xs text-stone-700 font-mono leading-relaxed">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Sample Bot Message Preview:
                  </span>
                  "{option.sample}"
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
