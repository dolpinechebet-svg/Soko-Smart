import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { DemandClustering } from './components/DemandClustering';
import { NegotiationRoom } from './components/NegotiationRoom';
import { MicroAgreementsView } from './components/MicroAgreementsView';
import { MpesaLedgerView } from './components/MpesaLedgerView';
import { DisputeDesk } from './components/DisputeDesk';
import { ConfigOntology } from './components/ConfigOntology';
import { LoginIdentityView } from './components/LoginIdentityView';
import {
  BusinessOwner,
  ProductItem,
  DemandCluster,
  DemandOrder,
  MicroAgreement,
  WholesaleSupplier,
  DisputeTicket,
  BusinessTradeCategory,
  Language
} from './types';
import {
  INITIAL_BUSINESS_OWNERS,
  INITIAL_PRODUCT_CATALOG,
  INITIAL_CLUSTERS,
  INITIAL_ORDERS,
  INITIAL_AGREEMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_DISPUTES,
  TRADE_CATEGORIES
} from './data/seedData';

export default function App() {
  const [businesses, setBusinesses] = useState<BusinessOwner[]>(INITIAL_BUSINESS_OWNERS);
  
  // Persistent Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const storedAuth = localStorage.getItem('soko_smart_auth');
      return storedAuth !== 'false'; // default authenticated for smooth initial demo, but togglable
    } catch {
      return true;
    }
  });

  const [selectedBusiness, setSelectedBusiness] = useState<BusinessOwner>(() => {
    try {
      const storedUserId = localStorage.getItem('soko_smart_user_id');
      if (storedUserId) {
        const found = INITIAL_BUSINESS_OWNERS.find(b => b.id === storedUserId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return INITIAL_BUSINESS_OWNERS[0];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const storedAuth = localStorage.getItem('soko_smart_auth');
      if (storedAuth === 'false') return 'login';
    } catch {
      // ignore
    }
    return 'whatsapp';
  });

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCT_CATALOG);
  const [clusters, setClusters] = useState<DemandCluster[]>(INITIAL_CLUSTERS);
  const [orders, setOrders] = useState<DemandOrder[]>(INITIAL_ORDERS);
  const [agreements, setAgreements] = useState<MicroAgreement[]>(INITIAL_AGREEMENTS);
  const [suppliers, setSuppliers] = useState<WholesaleSupplier[]>(INITIAL_SUPPLIERS);
  const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_DISPUTES);
  const [selectedTrade, setSelectedTrade] = useState<BusinessTradeCategory | 'all'>('all');
  const [activeNegotiationClusterId, setActiveNegotiationClusterId] = useState<string>(
    INITIAL_CLUSTERS[0]?.id || ''
  );
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);

  // Language preferences state with localStorage persistence
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('soko_smart_lang') as Language;
      if (saved && ['swahili', 'sheng', 'english', 'mixed'].includes(saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return INITIAL_BUSINESS_OWNERS[0]?.preferredLanguage || 'swahili';
  });

  // Initial load from server
  useEffect(() => {
    fetchHealth();
    refreshAllData();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setGeminiConnected(data.geminiEnabled);
      }
    } catch {
      setGeminiConnected(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [demandRes, agreementsRes, disputesRes, ontologyRes, usersRes] = await Promise.all([
        fetch('/api/demand/clusters'),
        fetch('/api/agreements'),
        fetch('/api/disputes'),
        fetch('/api/ontology'),
        fetch('/api/users')
      ]);

      if (demandRes.ok) {
        const data = await demandRes.json();
        if (data.clusters) setClusters(data.clusters);
        if (data.orders) setOrders(data.orders);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.businesses) setBusinesses(data.businesses);
      }
      if (agreementsRes.ok) {
        const data = await agreementsRes.json();
        if (Array.isArray(data)) setAgreements(data);
      }
      if (disputesRes.ok) {
        const data = await disputesRes.json();
        if (Array.isArray(data)) setDisputes(data);
      }
      if (ontologyRes.ok) {
        const data = await ontologyRes.json();
        if (Array.isArray(data)) setProducts(data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setBusinesses(data);
          // Keep selectedBusiness in sync if present
          setSelectedBusiness(prev => {
            const found = data.find((b: BusinessOwner) => b.id === prev.id);
            return found || prev;
          });
        }
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLanguage(newLang);
    try {
      localStorage.setItem('soko_smart_lang', newLang);
    } catch {
      // ignore
    }
    if (selectedBusiness) {
      setSelectedBusiness(prev => ({ ...prev, preferredLanguage: newLang }));
    }
  };

  const handleUserLogin = (user: BusinessOwner) => {
    setSelectedBusiness(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('soko_smart_auth', 'true');
      localStorage.setItem('soko_smart_user_id', user.id);
    } catch {
      // ignore
    }
    if (user.preferredLanguage) {
      handleLanguageChange(user.preferredLanguage);
    }
    if (user.category) {
      setSelectedTrade(user.category);
    }
    // Switch to WhatsApp or Clustering on successful login
    setActiveTab('whatsapp');
  };

  const handleUserLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('soko_smart_auth', 'false');
    } catch {
      // ignore
    }
    setActiveTab('login');
  };

  const handleLockCluster = async (clusterId: string) => {
    try {
      const res = await fetch(`/api/demand/clusters/${clusterId}/lock`, {
        method: 'POST'
      });
      if (res.ok) {
        await refreshAllData();
        setActiveNegotiationClusterId(clusterId);
        setActiveTab('negotiation');
      }
    } catch (err) {
      console.error('Lock error:', err);
    }
  };

  const handleConfirmBusinessAgreement = async (agreementId: string, businessId: string) => {
    try {
      const res = await fetch(`/api/agreements/${agreementId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Confirm agreement error:', err);
    }
  };

  const pendingAgreementsCount = agreements.filter(
    a => a.status === 'pending_confirmation' || a.status === 'draft'
  ).length;

  const openDisputesCount = disputes.filter(
    d => d.status === 'open' || d.status === 'investigating'
  ).length;

  // Filter clusters & orders if trade is selected (or show all)
  const filteredClusters = selectedTrade === 'all'
    ? clusters
    : clusters.filter(c => c.category === selectedTrade);

  const filteredOrders = selectedTrade === 'all'
    ? orders
    : orders.filter(o => o.category === selectedTrade);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans flex flex-col">
      {/* Top Application Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiConnected={geminiConnected}
        unresolvedDisputesCount={openDisputesCount}
        pendingAgreementsCount={pendingAgreementsCount}
        selectedTradeFilter={selectedTrade}
        setSelectedTradeFilter={val => setSelectedTrade(val as BusinessTradeCategory | 'all')}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currentUser={selectedBusiness}
        isAuthenticated={isAuthenticated}
        onLogout={handleUserLogout}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Log In & Identity Tab View */}
        {activeTab === 'login' && (
          <LoginIdentityView
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            currentUser={selectedBusiness}
            isAuthenticated={isAuthenticated}
            onUserLogin={handleUserLogin}
            onLogout={handleUserLogout}
            allBusinesses={businesses}
            onRefreshBusinesses={refreshAllData}
            onNavigateToWorkspace={() => setActiveTab('whatsapp')}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppSimulator
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            setSelectedBusiness={setSelectedBusiness}
            onOrderCreated={refreshAllData}
            onAgreementConfirmed={refreshAllData}
            onOpenAgreementsTab={() => setActiveTab('agreements')}
            onOpenLoginTab={() => setActiveTab('login')}
          />
        )}

        {activeTab === 'clustering' && (
          <DemandClustering
            clusters={filteredClusters}
            orders={filteredOrders}
            products={products}
            businesses={businesses}
            tradeCategories={TRADE_CATEGORIES}
            onLockCluster={handleLockCluster}
            onOrderAdded={refreshAllData}
            onNavigateToNegotiation={cId => {
              setActiveNegotiationClusterId(cId);
              setActiveTab('negotiation');
            }}
          />
        )}

        {activeTab === 'negotiation' && (
          <NegotiationRoom
            clusterId={activeNegotiationClusterId}
            clusters={clusters}
            onAgreementDrafted={_cId => refreshAllData()}
            onNavigateToAgreements={() => setActiveTab('agreements')}
          />
        )}

        {activeTab === 'agreements' && (
          <MicroAgreementsView
            agreements={agreements}
            businesses={businesses}
            onConfirmBusinessAgreement={handleConfirmBusinessAgreement}
            onNavigateToMpesa={() => setActiveTab('mpesa')}
          />
        )}

        {activeTab === 'mpesa' && (
          <MpesaLedgerView suppliers={suppliers} />
        )}

        {activeTab === 'disputes' && (
          <DisputeDesk businesses={businesses} onDisputeResolved={refreshAllData} />
        )}

        {activeTab === 'ontology' && (
          <ConfigOntology
            products={products}
            tradeCategories={TRADE_CATEGORIES}
            onUpdateProducts={setProducts}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Soko Smart Engine · Nairobi & Regional Cluster Hubs (Gikomba, Eastleigh, Makadara, Industrial Area, Kangemi, River Road)
          </span>
          <span className="font-mono text-stone-400">
            Safaricom Daraja B2B/C2B · Meta Cloud WhatsApp API · Swahili, Sheng & English Multilingual NLU
          </span>
        </div>
      </footer>
    </div>
  );
}
