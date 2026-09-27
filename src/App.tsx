import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { DemandClustering } from './components/DemandClustering';
import { NegotiationRoom } from './components/NegotiationRoom';
import { MicroAgreementsView } from './components/MicroAgreementsView';
import { MpesaLedgerView } from './components/MpesaLedgerView';
import { DisputeDesk } from './components/DisputeDesk';
import { ConfigOntology } from './components/ConfigOntology';
import {
  MamaMbogaVendor,
  ProduceItem,
  DemandCluster,
  DemandOrder,
  MicroAgreement,
  CooperativeSupplier,
  DisputeTicket
} from './types';
import {
  INITIAL_VENDORS,
  INITIAL_PRODUCE_CATALOG,
  INITIAL_CLUSTERS,
  INITIAL_ORDERS,
  INITIAL_AGREEMENTS,
  INITIAL_COOPERATIVES,
  INITIAL_DISPUTES
} from './data/seedData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('whatsapp');
  const [vendors, setVendors] = useState<MamaMbogaVendor[]>(INITIAL_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState<MamaMbogaVendor>(INITIAL_VENDORS[0]);
  const [catalog, setCatalog] = useState<ProduceItem[]>(INITIAL_PRODUCE_CATALOG);
  const [clusters, setClusters] = useState<DemandCluster[]>(INITIAL_CLUSTERS);
  const [orders, setOrders] = useState<DemandOrder[]>(INITIAL_ORDERS);
  const [agreements, setAgreements] = useState<MicroAgreement[]>(INITIAL_AGREEMENTS);
  const [cooperatives, setCooperatives] = useState<CooperativeSupplier[]>(INITIAL_COOPERATIVES);
  const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_DISPUTES);
  const [activeNegotiationClusterId, setActiveNegotiationClusterId] = useState<string>(
    INITIAL_CLUSTERS[0]?.id || ''
  );
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);

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
      const [demandRes, agreementsRes, disputesRes, ontologyRes] = await Promise.all([
        fetch('/api/demand/clusters'),
        fetch('/api/agreements'),
        fetch('/api/disputes'),
        fetch('/api/ontology')
      ]);

      if (demandRes.ok) {
        const data = await demandRes.json();
        setClusters(data.clusters || INITIAL_CLUSTERS);
        setOrders(data.orders || INITIAL_ORDERS);
        setCooperatives(data.cooperatives || INITIAL_COOPERATIVES);
        setVendors(data.vendors || INITIAL_VENDORS);
      }
      if (agreementsRes.ok) {
        const data = await agreementsRes.json();
        setAgreements(data || INITIAL_AGREEMENTS);
      }
      if (disputesRes.ok) {
        const data = await disputesRes.json();
        setDisputes(data || INITIAL_DISPUTES);
      }
      if (ontologyRes.ok) {
        const data = await ontologyRes.json();
        setCatalog(data || INITIAL_PRODUCE_CATALOG);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  const handleLockCluster = async (clusterId: string) => {
    try {
      const res = await fetch(`/api/demand/clusters/${clusterId}/lock`, {
        method: 'POST'
      });
      if (res.ok) {
        refreshAllData();
        setActiveNegotiationClusterId(clusterId);
        setActiveTab('negotiation');
      }
    } catch (err) {
      console.error('Lock error:', err);
    }
  };

  const handleConfirmVendorAgreement = async (agreementId: string, vendorId: string) => {
    try {
      const res = await fetch(`/api/agreements/${agreementId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      });
      if (res.ok) {
        refreshAllData();
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans flex flex-col">
      {/* Top Application Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiConnected={geminiConnected}
        unresolvedDisputesCount={openDisputesCount}
        pendingAgreementsCount={pendingAgreementsCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'whatsapp' && (
          <WhatsAppSimulator
            vendors={vendors}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            onOrderCreated={refreshAllData}
            onAgreementConfirmed={refreshAllData}
            onOpenAgreementsTab={() => setActiveTab('agreements')}
          />
        )}

        {activeTab === 'clustering' && (
          <DemandClustering
            clusters={clusters}
            orders={orders}
            catalog={catalog}
            vendors={vendors}
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
            vendors={vendors}
            onConfirmVendorAgreement={handleConfirmVendorAgreement}
            onNavigateToMpesa={() => setActiveTab('mpesa')}
          />
        )}

        {activeTab === 'mpesa' && (
          <MpesaLedgerView cooperatives={cooperatives} />
        )}

        {activeTab === 'disputes' && (
          <DisputeDesk vendors={vendors} onDisputeResolved={refreshAllData} />
        )}

        {activeTab === 'ontology' && (
          <ConfigOntology catalog={catalog} onUpdateCatalog={setCatalog} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Soko Smart Engine · Makadara Produce Aggregation Network (Hamza, Maringo, Viwandani, Harambee)
          </span>
          <span className="font-mono text-stone-400">
            M-PESA Daraja Integration · WhatsApp Cloud API · Swahili & Sheng NLU
          </span>
        </div>
      </footer>
    </div>
  );
}
