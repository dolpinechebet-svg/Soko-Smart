export type Language = 'swahili' | 'sheng' | 'english' | 'mixed';

export interface ProduceItem {
  id: string;
  name: string;
  swahiliName: string;
  synonyms: string[];
  category: 'leafy_greens' | 'root_vegetables' | 'fruits_tomatoes' | 'onions_garlic' | 'legumes';
  defaultUnit: string;
  supportedUnits: {
    unit: string;
    label: string;
    factorToKg: number; // e.g. gunia = 90kg, debe = 15kg, kilo = 1kg
    description: string;
  }[];
  moqKg: number;
  benchmarkPriceKshPerKg: number;
  guardrailMinKshPerKg: number;
  guardrailMaxKshPerKg: number;
  typicalShelfLifeDays: number;
}

export interface MamaMbogaVendor {
  id: string;
  name: string;
  phone: string;
  ward: string; // e.g. "Makadara - Hamza", "Makadara - Maringo", "Makadara - Viwandani"
  stallLocation: string;
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
}

export interface DemandOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  phone: string;
  ward: string;
  produceId: string;
  produceName: string;
  rawQuantity: number;
  rawUnit: string;
  normalizedQtyKg: number;
  targetPricePerUnitKsh?: number;
  deliveryDate: string;
  createdAt: string;
  status: 'open' | 'clustered' | 'negotiating' | 'locked' | 'paid' | 'delivered' | 'disputed';
  clusterId?: string;
  notes?: string;
}

export interface DemandCluster {
  id: string;
  neighbourhood: string;
  produceId: string;
  produceName: string;
  totalQuantityKg: number;
  unitSummary: string; // e.g. "18 magunia (~1,620 kg)"
  vendorCount: number;
  orderIds: string[];
  vendorBreakdown: {
    vendorId: string;
    vendorName: string;
    phone: string;
    quantityKg: number;
    rawDisplay: string;
    allocatedAmountKsh: number;
  }[];
  moqKg: number;
  moqMet: boolean;
  benchmarkPricePerKg: number;
  targetPriceCeilingPerKg: number;
  status: 'open' | 'negotiating' | 'agreement_drafted' | 'stk_sent' | 'paid' | 'dispatched' | 'delivered';
  cooperativeId?: string;
  cooperativeName?: string;
  negotiatedPricePerKg?: number;
  cutoffTime: string;
  deliveryDate: string;
  microAgreementId?: string;
}

export interface CooperativeSupplier {
  id: string;
  name: string;
  region: string; // e.g. "Kinangop, Nyandarua", "Limuru, Kiambu", "Naivasha, Nakuru"
  contactPerson: string;
  phone: string;
  mpesaPaybill: string;
  rating: number;
  minLotSizeKg: number;
  availableProduce: string[];
  priceList: Record<string, { pricePerKg: number; availableQtyKg: number; grade: string }>;
}

export interface NegotiationMessage {
  id: string;
  sender: 'agent' | 'cooperative' | 'human_ops';
  senderName: string;
  message: string;
  priceOfferPerKg?: number;
  totalAmount?: number;
  timestamp: string;
  isEscalationTrigger?: boolean;
}

export interface NegotiationSession {
  id: string;
  clusterId: string;
  cooperativeId: string;
  cooperativeName: string;
  produceName: string;
  totalKg: number;
  status: 'in_progress' | 'agreed' | 'escalated_to_ops' | 'rejected';
  guardrails: {
    minPricePerKg: number;
    maxPricePerKg: number;
    requiredDeliveryDate: string;
    paymentSplit: string; // e.g. "50% STK on confirmation, 50% on inspection"
  };
  initialAskPricePerKg: number;
  currentCounterPricePerKg: number;
  agreedPricePerKg?: number;
  transcript: NegotiationMessage[];
  escalationReason?: string;
  opsApproved?: boolean;
}

export interface MicroAgreement {
  id: string;
  contractNumber: string;
  clusterId: string;
  cooperativeId: string;
  cooperativeName: string;
  cooperativePhone: string;
  produceName: string;
  totalQuantityKg: number;
  pricePerKgKsh: number;
  totalContractValueKsh: number;
  deliveryDate: string;
  deliveryLocation: string;
  qualityTerms: string;
  paymentTerms: string;
  disputePolicy: string;
  swahiliText: string;
  englishText: string;
  status: 'draft' | 'pending_confirmation' | 'confirmed_by_coop' | 'confirmed_by_all' | 'fulfilled';
  vendorConfirmations: Record<string, {
    confirmed: boolean;
    timestamp?: string;
    channel: 'whatsapp' | 'sms';
  }>;
  coopConfirmed: boolean;
  coopConfirmedTimestamp?: string;
  digitalVerificationHash: string;
  createdAt: string;
}

export interface MpesaTransaction {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  vendorId?: string;
  vendorName?: string;
  vendorPhone: string;
  amount: number;
  purpose: 'vendor_pool_collection' | 'coop_advance_payout' | 'coop_final_payout' | 'refund_dispute';
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
  transactionType: 'MAMA_MBOGA_COLLECTION' | 'ESCROW_ALLOCATION' | 'COOPERATIVE_PAYOUT' | 'COMMISSION_FEE' | 'DISPUTE_REFUND';
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
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  produceName: string;
  issueType: 'rotten_produce' | 'short_weight' | 'late_delivery' | 'wrong_grade';
  description: string;
  claimedAmountKsh: number;
  status: 'open' | 'investigating' | 'approved_refund' | 'rejected' | 'replacement_issued';
  evidencePhotoUrl?: string;
  createdAt: string;
  resolutionNotes?: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'audio' | 'interactive' | 'stk_prompt';
  body: string;
  audioDurationSeconds?: number;
  transcription?: string;
  timestamp: string;
  quickReplies?: { title: string; payload: string }[];
  agreementId?: string;
}

export interface NluParseResult {
  intent: 'place_order' | 'confirm_agreement' | 'report_dispute' | 'check_price' | 'cancel_order' | 'onboarding' | 'help' | 'other';
  detectedLanguage: Language;
  confidence: number;
  rawInput: string;
  extractedEntities: {
    produceName?: string;
    canonicalProduceId?: string;
    quantity?: number;
    unit?: string;
    normalizedKg?: number;
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
  summaryForVendor: {
    swahili: string;
    sheng: string;
    english: string;
  };
}
