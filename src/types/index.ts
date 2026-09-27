export type Language = 'swahili' | 'sheng' | 'english' | 'mixed';

export type BusinessTradeCategory =
  | 'hardware'
  | 'salon_beauty'
  | 'produce_kiosk'
  | 'tailoring_textiles'
  | 'kibanda_food'
  | 'boda_parts'
  | 'general_duka';

export interface TradeCategoryConfig {
  id: BusinessTradeCategory;
  name: string;
  swahiliName: string;
  icon: string;
  description: string;
  cadence: 'daily' | 'twice_weekly' | 'weekly';
  sampleNeeds: string[];
}

export interface ProductItem {
  id: string;
  category: BusinessTradeCategory;
  name: string;
  swahiliName: string;
  synonyms: string[]; // local slang, Sheng, brand nicknames
  brandOrGrade?: string;
  defaultUnit: string;
  supportedUnits: {
    unit: string;
    label: string;
    multiplierToBase: number; // e.g., 1 carton = 12 pcs, 1 bag = 50kg, 1 roll = 30 meters
    description: string;
  }[];
  moqBaseUnit: number;
  benchmarkPriceKsh: number; // per base unit
  guardrailMinKsh: number;
  guardrailMaxKsh: number;
  rollingWindowDays: number;
  storageGuidelines?: string;
}

export interface BusinessOwner {
  id: string;
  businessName: string;
  ownerName: string;
  category: BusinessTradeCategory;
  phone: string;
  ward: string; // e.g. "Makadara - Hamza", "Eastleigh North", "Gikomba Section 3", "Rongai Town"
  locationDesc: string;
  preferredLanguage: Language;
  reputationScore: {
    fulfillmentRate: number; // percentage
    onTimeRate: number;
    disputeRate: number;
    totalOrders: number;
    rating: number; // 1-5
  };
  mpesaNumber: string;
  onboarded: boolean;
  typicalNeeds: string[];
  nationalId?: string;
  pin?: string;
  registeredDate?: string;
  verified?: boolean;
}

export interface AuthSession {
  user: BusinessOwner;
  loginTime: string;
  authMethod: 'quick_select' | 'phone_pin' | 'registered';
}

export interface DemandOrder {
  id: string;
  businessId: string;
  businessName: string;
  ownerName: string;
  category: BusinessTradeCategory;
  phone: string;
  ward: string;
  productId: string;
  productName: string;
  rawQuantity: number;
  rawUnit: string;
  normalizedBaseQty: number; // e.g., meters, kg, pcs, bags
  targetPricePerUnitKsh?: number;
  brandPreference?: string;
  deliveryDate: string;
  createdAt: string;
  status: 'open' | 'clustered' | 'negotiating' | 'locked' | 'paid' | 'delivered' | 'disputed';
  clusterId?: string;
  notes?: string;
}

export interface DemandCluster {
  id: string;
  category: BusinessTradeCategory;
  neighbourhood: string;
  productId: string;
  productName: string;
  totalQuantityBase: number;
  unitSummary: string; // e.g. "45 bags (~2,250 kg)" or "60 rolls (1,800 meters)"
  businessCount: number;
  orderIds: string[];
  businessBreakdown: {
    businessId: string;
    businessName: string;
    ownerName: string;
    phone: string;
    quantityBase: number;
    rawDisplay: string;
    allocatedAmountKsh: number;
  }[];
  moqBase: number;
  moqMet: boolean;
  benchmarkPricePerUnit: number;
  targetPriceCeilingPerUnit: number;
  status: 'open' | 'negotiating' | 'agreement_drafted' | 'stk_sent' | 'paid' | 'dispatched' | 'delivered';
  supplierId?: string;
  supplierName?: string;
  negotiatedPricePerUnit?: number;
  cutoffTime: string;
  deliveryDate: string;
  microAgreementId?: string;
}

export interface WholesaleSupplier {
  id: string;
  name: string;
  category: BusinessTradeCategory;
  supplierType: 'manufacturer' | 'wholesale_depot' | 'import_distributor' | 'farm_cooperative';
  region: string;
  contactPerson: string;
  phone: string;
  mpesaPaybill: string;
  rating: number;
  minLotSize: number;
  availableProducts: string[];
  priceList: Record<string, { pricePerUnit: number; availableQty: number; gradeOrSpec: string }>;
}

export interface NegotiationMessage {
  id: string;
  sender: 'agent' | 'supplier' | 'human_ops';
  senderName: string;
  message: string;
  priceOfferPerUnit?: number;
  totalAmount?: number;
  timestamp: string;
  isEscalationTrigger?: boolean;
}

export interface NegotiationSession {
  id: string;
  clusterId: string;
  category: BusinessTradeCategory;
  supplierId: string;
  supplierName: string;
  productName: string;
  totalUnits: number;
  status: 'in_progress' | 'agreed' | 'escalated_to_ops' | 'rejected';
  guardrails: {
    minPricePerUnit: number;
    maxPricePerUnit: number;
    requiredDeliveryDate: string;
    paymentSplit: string; // e.g. "50% on agreement via STK Push, 50% on delivery inspection"
  };
  initialAskPricePerUnit: number;
  currentCounterPricePerUnit: number;
  agreedPricePerUnit?: number;
  transcript: NegotiationMessage[];
  escalationReason?: string;
  opsApproved?: boolean;
}

export interface MicroAgreement {
  id: string;
  contractNumber: string;
  category: BusinessTradeCategory;
  clusterId: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  productName: string;
  totalQuantityBase: number;
  pricePerUnitKsh: number;
  totalContractValueKsh: number;
  deliveryDate: string;
  deliveryLocation: string;
  qualityTerms: string;
  paymentTerms: string;
  disputePolicy: string;
  swahiliText: string;
  englishText: string;
  status: 'draft' | 'pending_confirmation' | 'confirmed_by_supplier' | 'confirmed_by_all' | 'fulfilled';
  businessConfirmations: Record<string, {
    confirmed: boolean;
    timestamp?: string;
    channel: 'whatsapp' | 'sms';
  }>;
  supplierConfirmed: boolean;
  supplierConfirmedTimestamp?: string;
  digitalVerificationHash: string;
  createdAt: string;
}

export interface MpesaTransaction {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  businessId?: string;
  businessName?: string;
  phone: string;
  amount: number;
  purpose: 'trader_pool_collection' | 'supplier_advance_payout' | 'supplier_final_payout' | 'refund_dispute';
  status: 'initiated' | 'pending_pin' | 'completed' | 'failed' | 'reversed';
  mpesaReceiptNumber?: string;
  resultCode?: number;
  resultDesc?: string;
  timestamp: string;
  referenceAgreementId?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  transactionType: 'TRADER_COLLECTION' | 'ESCROW_ALLOCATION' | 'SUPPLIER_PAYOUT' | 'COMMISSION_FEE' | 'DISPUTE_REFUND';
  debitAccount: string;
  creditAccount: string;
  amountKsh: number;
  referenceId: string;
  description: string;
}

export interface DisputeTicket {
  id: string;
  orderId: string;
  clusterId: string;
  category: BusinessTradeCategory;
  businessId: string;
  businessName: string;
  phone: string;
  productName: string;
  issueType: 'damaged_item' | 'short_quantity' | 'late_delivery' | 'counterfeit_wrong_spec' | 'spoilage';
  description: string;
  claimedAmountKsh: number;
  status: 'open' | 'investigating' | 'approved_refund' | 'rejected' | 'replacement_issued';
  evidencePhotoUrl?: string;
  createdAt: string;
  resolutionNotes?: string;
}

export interface NluParseResult {
  intent: 'place_order' | 'confirm_agreement' | 'report_dispute' | 'check_price' | 'cancel_order' | 'onboarding' | 'help' | 'other';
  detectedLanguage: Language;
  inferredCategory?: BusinessTradeCategory;
  confidence: number;
  rawInput: string;
  extractedEntities: {
    productName?: string;
    canonicalProductId?: string;
    category?: BusinessTradeCategory;
    quantity?: number;
    unit?: string;
    normalizedBaseQty?: number;
    brandPreference?: string;
    priceCeilingKsh?: number;
    deliveryTime?: string;
    ward?: string;
  }[];
  requiresClarification: boolean;
  clarificationMessage?: {
    swahili: string;
    english: string;
    sheng: string;
  };
  summaryForTrader: {
    swahili: string;
    sheng: string;
    english: string;
  };
}
