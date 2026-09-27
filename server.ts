import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PRODUCT_CATALOG,
  INITIAL_BUSINESS_OWNERS,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_CLUSTERS,
  INITIAL_AGREEMENTS,
  INITIAL_LEDGER,
  INITIAL_DISPUTES,
  TRADE_CATEGORIES
} from './src/data/seedData';
import {
  ProductItem,
  BusinessOwner,
  WholesaleSupplier,
  DemandOrder,
  DemandCluster,
  MicroAgreement,
  LedgerEntry,
  DisputeTicket,
  NluParseResult,
  NegotiationSession,
  MpesaTransaction,
  BusinessTradeCategory
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory operational database
let products: ProductItem[] = [...INITIAL_PRODUCT_CATALOG];
let businesses: BusinessOwner[] = [...INITIAL_BUSINESS_OWNERS];
let suppliers: WholesaleSupplier[] = [...INITIAL_SUPPLIERS];
let orders: DemandOrder[] = [...INITIAL_ORDERS];
let clusters: DemandCluster[] = [...INITIAL_CLUSTERS];
let agreements: MicroAgreement[] = [...INITIAL_AGREEMENTS];
let ledger: LedgerEntry[] = [...INITIAL_LEDGER];
let disputes: DisputeTicket[] = [...INITIAL_DISPUTES];
let mpesaTransactions: MpesaTransaction[] = [
  {
    id: 'tx-hw-001',
    checkoutRequestId: 'ws_CO_27092026_HW01',
    merchantRequestId: 'MR-HW-9921',
    businessId: 'biz-hardware-kamau',
    businessName: 'Kamau Hardwares Depot',
    phone: '254712998877',
    amount: 6600,
    purpose: 'trader_pool_collection',
    status: 'completed',
    mpesaReceiptNumber: 'QKA82910HW',
    resultCode: 0,
    resultDesc: 'The service request is processed successfully.',
    timestamp: '2026-09-27T08:20:15Z'
  }
];

// Active negotiation sessions
let negotiationSessions: Record<string, NegotiationSession> = {
  'cluster-salon-makadara-01': {
    id: 'neg-salon-01',
    clusterId: 'cluster-salon-makadara-01',
    category: 'salon_beauty',
    supplierId: 'supp-salon-darling',
    supplierName: 'Darling Kenya Master Wholesaler',
    productName: 'Darling Abuja / Classic Braids (Color #1 / #2)',
    totalUnits: 48,
    status: 'in_progress',
    guardrails: {
      minPricePerUnit: 95,
      maxPricePerUnit: 130,
      requiredDeliveryDate: '2026-09-28',
      paymentSplit: '50% on agreement via STK Push, 50% upon delivery inspection'
    },
    initialAskPricePerUnit: 115,
    currentCounterPricePerUnit: 102,
    transcript: [
      {
        id: 'nm-sl-1',
        sender: 'supplier',
        senderName: 'Darling Kenya Key Accounts',
        message: 'Habari Soko Smart. Tunazo cartons za kutosha za Darling Abuja #1. Bei yetu ya kiwanda ni KSh 115 kwa bundle.',
        priceOfferPerUnit: 115,
        timestamp: '2026-09-27T07:20:00Z'
      },
      {
        id: 'nm-sl-2',
        sender: 'agent',
        senderName: 'Soko Smart AI Coordinator',
        message: 'Asante Darling Kenya. Wamiliki wa saluni Makadara wameunganisha agizo la pamoja la carton 1 (bundles 48) na malipo ya 50% escrow ya papo hapo. Tunaweza kufunga kwa KSh 102 kwa bundle na mshushe kesho asubuhi?',
        priceOfferPerUnit: 102,
        timestamp: '2026-09-27T07:25:00Z'
      }
    ]
  },
  'cluster-hardware-makadara-01': {
    id: 'neg-hw-01',
    clusterId: 'cluster-hardware-makadara-01',
    category: 'hardware',
    supplierId: 'supp-hardware-devki',
    supplierName: 'Devki & Bamburi Regional Industrial Depot',
    productName: 'Bamburi Nguvu Cement 32.5R (50kg)',
    totalUnits: 35,
    status: 'agreed',
    guardrails: {
      minPricePerUnit: 630,
      maxPricePerUnit: 720,
      requiredDeliveryDate: '2026-09-29',
      paymentSplit: '50% STK Push deposit, 50% upon offload signoff'
    },
    initialAskPricePerUnit: 680,
    currentCounterPricePerUnit: 660,
    agreedPricePerUnit: 660,
    transcript: [
      {
        id: 'nm-hw-1',
        sender: 'supplier',
        senderName: 'Devki Industrial Dispatch',
        message: 'Bei ya kiwanda ya Bamburi 32.5R ni KSh 680 kwa mfuko.',
        priceOfferPerUnit: 680,
        timestamp: '2026-09-27T07:00:00Z'
      },
      {
        id: 'nm-hw-2',
        sender: 'agent',
        senderName: 'Soko Smart AI Coordinator',
        message: 'Wafanyabiashara wa Hamza wamekusanya mifuko 35 (Tani 1.75) na kutoa malipo ya escrow ya moja kwa moja. Tunaomba bei ya jumla ya KSh 660.',
        priceOfferPerUnit: 660,
        timestamp: '2026-09-27T07:05:00Z'
      },
      {
        id: 'nm-hw-3',
        sender: 'supplier',
        senderName: 'Devki Industrial Dispatch',
        message: 'Sawa, kwa sababu ya ununuzi wa pamoja na malipo salama ya M-PESA escrow, tumekubali KSh 660. Lori litaleta kabla ya 08:00 AM.',
        priceOfferPerUnit: 660,
        timestamp: '2026-09-27T07:10:00Z'
      }
    ]
  }
};

// Trader conversation state sessions keyed by phone
interface ConversationSession {
  phone: string;
  businessId?: string;
  businessName?: string;
  ownerName?: string;
  category?: BusinessTradeCategory;
  currentStep: 'IDLE' | 'ONBOARDING_CATEGORY' | 'ONBOARDING_DETAILS' | 'CONFIRMING_ORDER' | 'PENDING_AGREEMENT_CONFIRMATION' | 'AWAITING_PIN' | 'REPORTING_DISPUTE';
  pendingOrderDraft?: {
    productId: string;
    productName: string;
    category: BusinessTradeCategory;
    quantity: number;
    unit: string;
    normalizedBaseQty: number;
    priceCeiling?: number;
    brandPreference?: string;
    deliveryDate: string;
  };
  activeAgreementId?: string;
  history: {
    role: 'trader' | 'agent';
    text: string;
    timestamp: string;
    type?: string;
  }[];
}

const traderSessions: Record<string, ConversationSession> = {};

function getOrCreateSession(phone: string): ConversationSession {
  if (!traderSessions[phone]) {
    const matched = businesses.find(b => b.phone === phone || b.mpesaNumber === phone.replace('+', ''));
    traderSessions[phone] = {
      phone,
      businessId: matched?.id,
      businessName: matched?.businessName || 'Duka / Biashara',
      ownerName: matched?.ownerName || 'Mfanyabiashara',
      category: matched?.category,
      currentStep: 'IDLE',
      history: [
        {
          role: 'agent',
          text: `Habari! Mimi ni Soko Smart, msaidizi wako wa ununuzi wa pamoja (bulk pooling) kwa wafanyabiashara wa Kenya.\n\nTunaunganisha oda za Hardware, Saluni, Mboga, Vitambaa, na Vyakula ili ununue kwa bei ya jumla ya kiwanda.\n\nNiambie bidhaa unazohitaji leo (mfano: "Nahitaji mifuko 20 ya saruji Bamburi", au "Carton 2 za Darling braids") kwa maandishi au sauti.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
  return traderSessions[phone];
}

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// ==========================================
// 1. TRADE-AGNOSTIC MULTILINGUAL NLU PARSER
// ==========================================

async function parseTraderMessageWithAI(rawText: string, currentCategory?: BusinessTradeCategory): Promise<NluParseResult> {
  const fallbackResult = fallbackNluParser(rawText, currentCategory);

  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `You are the NLU parser for "Soko Smart", an AI coordinator for informal and small business owners across Kenya (hardware, beauty/salons, tailoring/textiles, kibanda/food, produce/mama mboga, boda spares, dukas).
Traders send messages in Swahili, Sheng (Nairobi street slang), English, or mixed code-switching.

Active Trade Categories:
- "hardware": cement ("saruji/simiti"), iron sheets ("mabati"), nails ("misumari"), pipes, paint
- "salon_beauty": braids ("nywele/darling/lines"), shampoo ("shampu"), relaxer, oils, hair extensions
- "produce_kiosk": tomatoes ("nyanya"), onions ("vitunguu"), potatoes ("viazi/waru"), greens ("sukuma wiki/managu")
- "tailoring_textiles": fabric ("kitambaa/kanga/vitenge/ankara"), thread ("uzi wa mashine"), zippers
- "kibanda_food": cooking oil ("mafuta ya kupikia/jerrican"), maize flour ("unga wa ugali/sembe"), sugar ("sukari")
- "boda_parts": engine oil ("oil ya 4T"), spark plugs, brake pads, tubes ("mipira")
- "general_duka": general household retail provisions

Identify the trader's intent:
- 'onboarding': User greets ("Hi", "Niaje", "Hello", "Nataka kujiunga") or states their trade ("Nina salon", "Nauza hardware", "Mimi ni fundi")
- 'place_order': User specifies items they need to buy/restock
- 'confirm_agreement': User confirms ("NDIYO", "YES", "Sawa", "Confirm", "Thibitisha", "1", "Nimekubali")
- 'report_dispute': User flags issue ("TATIZO", damaged, broken, bent, counterfeit, spoiled, missing)
- 'check_price': User asks for current wholesale factory price or market benchmark
- 'cancel_order': User cancels an order
- 'help': User asks how Soko Smart works
- 'other': Unclassified chatter

Input text:
"${rawText}"

Current trader category context: ${currentCategory || 'unknown'}

Return ONLY valid JSON matching this schema:
{
  "intent": "place_order" | "confirm_agreement" | "report_dispute" | "check_price" | "cancel_order" | "onboarding" | "help" | "other",
  "detectedLanguage": "swahili" | "sheng" | "english" | "mixed",
  "inferredCategory": "hardware" | "salon_beauty" | "produce_kiosk" | "tailoring_textiles" | "kibanda_food" | "boda_parts" | "general_duka",
  "confidence": number between 0 and 1,
  "rawInput": string,
  "extractedEntities": [
    {
      "productName": string,
      "canonicalProductId": string,
      "category": string,
      "quantity": number,
      "unit": string,
      "normalizedBaseQty": number,
      "brandPreference": string or null,
      "priceCeilingKsh": number or null
    }
  ],
  "requiresClarification": boolean,
  "clarificationMessage": {
    "swahili": string,
    "english": string,
    "sheng": string
  },
  "summaryForTrader": {
    "swahili": string,
    "sheng": string,
    "english": string
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.intent && parsed.extractedEntities !== undefined) {
      return {
        intent: parsed.intent,
        detectedLanguage: parsed.detectedLanguage || 'swahili',
        inferredCategory: parsed.inferredCategory || currentCategory,
        confidence: parsed.confidence || 0.95,
        rawInput: rawText,
        extractedEntities: parsed.extractedEntities || [],
        requiresClarification: Boolean(parsed.requiresClarification),
        clarificationMessage: parsed.clarificationMessage,
        summaryForTrader: parsed.summaryForTrader || fallbackResult.summaryForTrader
      };
    }
    return fallbackResult;
  } catch (error) {
    console.error('Gemini NLU Parse Error, using trade-aware fallback:', error);
    return fallbackResult;
  }
}

function fallbackNluParser(text: string, currentCategory?: BusinessTradeCategory): NluParseResult {
  const lower = text.toLowerCase().trim();

  // 1. Confirm agreement
  if (
    lower === 'ndiyo' ||
    lower === 'yes' ||
    lower === 'sawa' ||
    lower === 'thibitisha' ||
    lower === '1' ||
    lower.includes('thibitisha') ||
    lower.includes('nimekubali') ||
    lower.includes('iko sawa') ||
    lower.includes('confirm')
  ) {
    return {
      intent: 'confirm_agreement',
      detectedLanguage: 'swahili',
      inferredCategory: currentCategory,
      confidence: 0.98,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForTrader: {
        swahili: 'Umethibitisha makubaliano ya ununuzi.',
        sheng: 'Umeshagonga confirm.',
        english: 'You have confirmed the micro-purchase agreement.'
      }
    };
  }

  // 2. Dispute
  if (
    lower.includes('tatizo') ||
    lower.includes('imevunjika') ||
    lower.includes('imeharibika') ||
    lower.includes('zimeoza') ||
    lower.includes('upungufu') ||
    lower.includes('feiki') ||
    lower.includes('dispute') ||
    lower.includes('shida') ||
    lower.includes('mabati yamepondoka')
  ) {
    return {
      intent: 'report_dispute',
      detectedLanguage: lower.includes('shida') || lower.includes('imevunjika') ? 'swahili' : 'sheng',
      inferredCategory: currentCategory,
      confidence: 0.95,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForTrader: {
        swahili: 'Kikosi chetu cha usimamizi kimepokea ripoti ya tatizo na kinashughulikia mara moja.',
        sheng: 'Rada ya tatizo imeshika, ops wanacheki sahii.',
        english: 'Dispute ticket registered. Operations team is reviewing.'
      }
    };
  }

  // 3. Price check
  if (lower.includes('bei') || lower.includes('ni ngapi') || lower.includes('how much') || lower.includes('price')) {
    return {
      intent: 'check_price',
      detectedLanguage: lower.includes('how much') ? 'english' : 'swahili',
      inferredCategory: currentCategory,
      confidence: 0.9,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForTrader: {
        swahili: 'Unaulizia bei za jumla kutoka kiwandani.',
        sheng: 'Unacheki bei za jumla leo.',
        english: 'Inquiring about current wholesale bulk prices.'
      }
    };
  }

  // 4. Onboarding greetings
  if (lower === 'hi' || lower === 'hello' || lower === 'niaje' || lower.includes('kujiunga') || lower.includes('mimi ni')) {
    return {
      intent: 'onboarding',
      detectedLanguage: lower.includes('niaje') ? 'sheng' : 'swahili',
      inferredCategory: currentCategory,
      confidence: 0.95,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForTrader: {
        swahili: 'Karibu Soko Smart. Chagua sekta yako ya biashara ili tuunganishe oda yako.',
        sheng: 'Karibu Soko Smart. Bisha na biashara yako tuanze pooling.',
        english: 'Welcome to Soko Smart. Select your business trade category.'
      }
    };
  }

  // 5. Multi-Trade Entity Extraction
  const entities: NluParseResult['extractedEntities'] = [];
  let detectedTrade: BusinessTradeCategory = currentCategory || 'hardware';

  // --- Hardware terms ---
  if (lower.includes('saruji') || lower.includes('simiti') || lower.includes('cement') || lower.includes('bamburi')) {
    detectedTrade = 'hardware';
    let qty = 20;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Bamburi Nguvu Cement 32.5R (50kg)',
      canonicalProductId: 'prod-cement-bamburi',
      category: 'hardware',
      quantity: qty,
      unit: 'mfuko',
      normalizedBaseQty: qty,
      brandPreference: 'Bamburi Nguvu 32.5R',
      priceCeilingKsh: 680
    });
  } else if (lower.includes('mabati') || lower.includes('iron sheet') || lower.includes('gauge 30')) {
    detectedTrade = 'hardware';
    let qty = 15;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Corrugated Iron Sheets G30 (2.5m)',
      canonicalProductId: 'prod-mabati-g30',
      category: 'hardware',
      quantity: qty,
      unit: 'bati',
      normalizedBaseQty: qty,
      brandPreference: 'MRM Gauge 30',
      priceCeilingKsh: 780
    });
  } else if (lower.includes('misumari') || lower.includes('nails')) {
    detectedTrade = 'hardware';
    let qty = 10;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Common Wire Nails (3-inch / 4-inch)',
      canonicalProductId: 'prod-nails-wire',
      category: 'hardware',
      quantity: qty,
      unit: 'kilo',
      normalizedBaseQty: qty,
      priceCeilingKsh: 135
    });
  }
  // --- Salon / Beauty terms ---
  else if (lower.includes('braid') || lower.includes('darling') || lower.includes('nywele') || lower.includes('abuja')) {
    detectedTrade = 'salon_beauty';
    let qty = 1;
    let unit = 'carton';
    if (lower.includes('bundle') || lower.includes('pcs')) unit = 'bundle';
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Darling Abuja / Classic Braids (Color #1 / #2)',
      canonicalProductId: 'prod-darling-braids',
      category: 'salon_beauty',
      quantity: qty,
      unit: unit,
      normalizedBaseQty: unit === 'carton' ? qty * 48 : qty,
      brandPreference: 'Darling Original Color #1',
      priceCeilingKsh: 110
    });
  } else if (lower.includes('shampoo') || lower.includes('shampu') || lower.includes('conditioner')) {
    detectedTrade = 'salon_beauty';
    let qty = 2;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Salon Pro Conditioning Herbal Shampoo (5 Litres)',
      canonicalProductId: 'prod-salon-shampoo',
      category: 'salon_beauty',
      quantity: qty,
      unit: 'jerrican',
      normalizedBaseQty: qty,
      priceCeilingKsh: 650
    });
  }
  // --- Tailoring & Textiles terms ---
  else if (lower.includes('kitambaa') || lower.includes('kanga') || lower.includes('vitenge') || lower.includes('fabric')) {
    detectedTrade = 'tailoring_textiles';
    let qty = 3;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'African Print Fabric / Kanga Rolls (6 Yards / Roll)',
      canonicalProductId: 'prod-kanga-fabric',
      category: 'tailoring_textiles',
      quantity: qty,
      unit: 'roll',
      normalizedBaseQty: qty,
      priceCeilingKsh: 950
    });
  } else if (lower.includes('uzi') || lower.includes('thread')) {
    detectedTrade = 'tailoring_textiles';
    let qty = 1;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'High-Tensile Industrial Sewing Thread Cones',
      canonicalProductId: 'prod-sewing-thread',
      category: 'tailoring_textiles',
      quantity: qty,
      unit: 'boksi',
      normalizedBaseQty: qty * 12,
      priceCeilingKsh: 120
    });
  }
  // --- Produce / Mama Mboga terms ---
  else if (lower.includes('nyanya') || lower.includes('tomato')) {
    detectedTrade = 'produce_kiosk';
    let qty = 2;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Firm Grade A Tomatoes (60kg Crate)',
      canonicalProductId: 'prod-nyanya',
      category: 'produce_kiosk',
      quantity: qty,
      unit: 'gunia',
      normalizedBaseQty: qty,
      priceCeilingKsh: 2400
    });
  } else if (lower.includes('vitunguu') || lower.includes('onion')) {
    detectedTrade = 'produce_kiosk';
    let qty = 1;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Red Bulb Onions (50kg Net Bag)',
      canonicalProductId: 'prod-vitunguu',
      category: 'produce_kiosk',
      quantity: qty,
      unit: 'gunia',
      normalizedBaseQty: qty,
      priceCeilingKsh: 2750
    });
  }
  // --- Kibanda / Food terms ---
  else if (lower.includes('mafuta') || lower.includes('cooking oil')) {
    detectedTrade = 'kibanda_food';
    let qty = 1;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Refined Vegetable Cooking Oil (20 Litre Jerrican)',
      canonicalProductId: 'prod-cooking-oil',
      category: 'kibanda_food',
      quantity: qty,
      unit: 'jerrican',
      normalizedBaseQty: qty,
      priceCeilingKsh: 4400
    });
  } else if (lower.includes('unga') || lower.includes('ugali')) {
    detectedTrade = 'kibanda_food';
    let qty = 2;
    const match = lower.match(/(\d+)/);
    if (match) qty = parseInt(match[1], 10);
    entities.push({
      productName: 'Fortified Maize Meal Unga (Bundle of 12 x 2kg)',
      canonicalProductId: 'prod-unga-maize',
      category: 'kibanda_food',
      quantity: qty,
      unit: 'bundle',
      normalizedBaseQty: qty,
      priceCeilingKsh: 1650
    });
  }

  if (entities.length > 0) {
    const isSheng = lower.includes('niaje') || lower.includes('budget') || lower.includes('manze');
    return {
      intent: 'place_order',
      detectedLanguage: isSheng ? 'sheng' : 'swahili',
      inferredCategory: detectedTrade,
      confidence: 0.92,
      rawInput: text,
      extractedEntities: entities,
      requiresClarification: false,
      summaryForTrader: {
        swahili: `Umependekeza kuagiza: ${entities.map(e => `${e.quantity} ${e.unit} ya ${e.productName}`).join(', ')}.`,
        sheng: `Oda yako ni: ${entities.map(e => `${e.quantity} ${e.unit} ya ${e.productName}`).join(', ')}.`,
        english: `Order items: ${entities.map(e => `${e.quantity} ${e.unit} of ${e.productName}`).join(', ')}.`
      }
    };
  }

  return {
    intent: 'help',
    detectedLanguage: 'swahili',
    inferredCategory: currentCategory,
    confidence: 0.7,
    rawInput: text,
    extractedEntities: [],
    requiresClarification: true,
    clarificationMessage: {
      swahili: 'Tafadhali taja bidhaa unazohitaji (mfano: saruji, mabati, nywele za kusuka, mafuta ya kupikia) na idadi unayotaka.',
      sheng: 'Niambie stock unataka ku-pool, mfano mifuko 20 ya saruji au carton ya braids.',
      english: 'Please specify the stock needed (e.g. cement, iron sheets, braids, cooking oil) and quantities.'
    },
    summaryForTrader: {
      swahili: 'Taja bidhaa na kiwango unachohitaji.',
      sheng: 'Bisha na oda yako freshi.',
      english: 'Specify your stock items and quantity.'
    }
  };
}

// ==========================================
// 2. CONVERSATION STATE MACHINE & RESPONDER
// ==========================================

async function processTraderMessage(phone: string, text: string) {
  const session = getOrCreateSession(phone);
  const nlu = await parseTraderMessageWithAI(text, session.category);

  session.history.push({
    role: 'trader',
    text,
    timestamp: new Date().toISOString()
  });

  let replyText = '';
  let quickReplies: { title: string; payload: string }[] | undefined = undefined;
  let triggerStkPush = false;
  let stkAmount = 0;

  switch (nlu.intent) {
    case 'onboarding': {
      session.currentStep = 'ONBOARDING_CATEGORY';
      replyText = `Karibu Soko Smart! Tunasaidia wafanyabiashara wa jua kali, maduka, saluni na vibanda kuunganisha oda ili kununua moja kwa moja kutoka kiwandani kwa bei ya chini.\n\nBiashara yako inahusu nini? Chagua kategoria:`;
      quickReplies = [
        { title: '1. Vifaa vya Ujenzi & Hardware', payload: 'cat_hardware' },
        { title: '2. Saluni & Vipodozi (Beauty)', payload: 'cat_salon' },
        { title: '3. Mboga & Matunda (Mama Mboga)', payload: 'cat_produce' },
        { title: '4. Vitambaa & Ushonaji (Tailoring)', payload: 'cat_tailoring' },
        { title: '5. Chakula & Kibanda (Kiosk)', payload: 'cat_food' }
      ];
      break;
    }

    case 'confirm_agreement': {
      // Find agreement pending confirmation for this trader
      const matchedAgreement = agreements.find(
        a => a.status === 'pending_confirmation' && a.businessConfirmations[session.businessId || '']?.confirmed === false
      ) || agreements[0];

      if (matchedAgreement && session.businessId) {
        matchedAgreement.businessConfirmations[session.businessId] = {
          confirmed: true,
          timestamp: new Date().toISOString(),
          channel: 'whatsapp'
        };

        const allConfirmed = Object.values(matchedAgreement.businessConfirmations).every(v => v.confirmed);
        if (allConfirmed) {
          matchedAgreement.status = 'confirmed_by_all';
        }

        const cluster = clusters.find(c => c.id === matchedAgreement.clusterId);
        const traderAlloc = cluster?.businessBreakdown.find(bb => bb.businessId === session.businessId);
        const totalCost = traderAlloc ? traderAlloc.allocatedAmountKsh : 6600;
        stkAmount = Math.round(totalCost * 0.5);

        replyText = `Asante ${session.ownerName}! Ujumbe wako wa "NDIYO" umethibitisha Mkataba #${matchedAgreement.contractNumber}.\n\nTunakutumia ombi la M-PESA STK Push la KSh ${stkAmount.toLocaleString()} (Amana ya 50% ya kuzuiliwa kwenye Soko Smart Escrow kwa usalama). Tafadhali weka PIN yako kwenye simu.`;
        triggerStkPush = true;
        session.currentStep = 'AWAITING_PIN';
      } else {
        replyText = `Asante! Huna mkataba unaosubiri uthibitisho kwa sasa. Ungependa kuweka oda mpya ya jumla?`;
      }
      break;
    }

    case 'place_order': {
      if (nlu.extractedEntities.length > 0) {
        const first = nlu.extractedEntities[0];
        const product = products.find(p => p.id === first.canonicalProductId) || products[0];
        const estTotal = first.normalizedBaseQty ? first.normalizedBaseQty * product.benchmarkPriceKsh : 3000;

        session.pendingOrderDraft = {
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity: first.quantity || 1,
          unit: first.unit || product.defaultUnit,
          normalizedBaseQty: first.normalizedBaseQty || 1,
          priceCeiling: first.priceCeilingKsh,
          brandPreference: first.brandPreference,
          deliveryDate: 'Kesho / Next Batch Window'
        };
        session.currentStep = 'CONFIRMING_ORDER';

        replyText = `Safi sana! Nimepata oda yako ya ${product.name}:\n• Kiasi: ${first.quantity} ${first.unit} (~${first.normalizedBaseQty} base units)\n• Bei ya makadirio ya jumla ya kiwanda: ~KSh ${estTotal.toLocaleString()}\n• Kituo cha Kushusha: Hamza Central Dropoff, Makadara.\n\nTafadhali jibu "NDIYO" au bonyeza 1 ili kuunganisha oda yako na wafanyabiashara wenzako.`;

        quickReplies = [
          { title: '1. Thibitisha (NDIYO)', payload: 'confirm_order_draft' },
          { title: '2. Badilisha Kiasi', payload: 'modify_order' },
          { title: '3. Futa', payload: 'cancel' }
        ];
      } else {
        replyText = nlu.clarificationMessage?.swahili || 'Tafadhali taja bidhaa na idadi unayotaka kuagiza.';
      }
      break;
    }

    case 'report_dispute': {
      session.currentStep = 'REPORTING_DISPUTE';
      const newDispute: DisputeTicket = {
        id: `disp-${Date.now().toString().slice(-4)}`,
        orderId: 'ord-today',
        clusterId: 'cluster-hardware-makadara-01',
        category: session.category || 'hardware',
        businessId: session.businessId || 'biz-unknown',
        businessName: session.businessName || 'Biashara',
        phone: phone,
        productName: 'Bidhaa za Jumla',
        issueType: 'damaged_item',
        description: text,
        claimedAmountKsh: 1320,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      disputes.unshift(newDispute);

      replyText = `Pole sana ${session.ownerName}. Tumefungua tiketi rasmi ya tatizo (#${newDispute.id}) kwa ajili ya bidhaa zako.\n\nMhudumu wa Soko Smart Operations anashughulikia sasa hivi. Utafidiwa au kurejeshewa pesa kwa M-PESA kutoka kwenye escrow mara tu ukaguzi unapothibitishwa.\n\nTuma picha ya bidhaa hapa ikiwa unayo.`;
      break;
    }

    case 'check_price': {
      const categoryProducts = session.category
        ? products.filter(p => p.category === session.category)
        : products.slice(0, 5);

      const summaryList = categoryProducts
        .slice(0, 4)
        .map(p => `• ${p.swahiliName}: KSh ${p.benchmarkPriceKsh} kwa ${p.defaultUnit}`)
        .join('\n');

      replyText = `Bei za Jumla za Kiwanda Leo (Soko Smart Bulk Rates):\n${summaryList}\n\nUngependa kuweka oda ya pamoja? Andika mfano unachotaka.`;
      break;
    }

    case 'help':
    default: {
      replyText = `Karibu Soko Smart! Mratibu wa ununuzi wa pamoja kwa wafanyabiashara wa Kenya.\n\nUnaweza:\n1. Kuagiza bidhaa: "Nahitaji mifuko 20 ya saruji Bamburi" au "Carton 1 ya Darling braids"\n2. Kuangalia bei: "Niambie bei za leo"\n3. Kuripoti tatizo la mzigo: "TATIZO"`;
      quickReplies = [
        { title: 'Saruji Bamburi (20 Mifuko)', payload: 'order_cement' },
        { title: 'Darling Braids (1 Carton)', payload: 'order_braids' },
        { title: 'Angalia Bei za Leo', payload: 'check_prices' }
      ];
      break;
    }
  }

  session.history.push({
    role: 'agent',
    text: replyText,
    timestamp: new Date().toISOString()
  });

  return {
    replyText,
    quickReplies,
    triggerStkPush,
    stkAmount,
    nlu,
    session
  };
}

// ==========================================
// 3. API ROUTES
// ==========================================

// --- Health / Status ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Soko Smart Agentic B2B Coordinator',
    version: '2.0.0',
    geminiEnabled: Boolean(geminiApiKey),
    neighbourhood: 'Makadara Corridor, Nairobi',
    supportedTrades: TRADE_CATEGORIES.map(t => t.name),
    time: new Date().toISOString()
  });
});

// --- Meta WhatsApp Webhook ---
app.get('/api/webhook/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'soko_smart_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification token mismatch' });
  }
});

app.post('/api/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages) {
            for (const msg of value.messages) {
              const from = msg.from;
              let incomingText = '';
              if (msg.type === 'text') {
                incomingText = msg.text.body;
              } else if (msg.type === 'interactive') {
                incomingText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
              } else if (msg.type === 'audio') {
                incomingText = 'Nahitaji mifuko ishirini ya saruji Bamburi kesho asubuhi';
              }

              if (incomingText) {
                await processTraderMessage(`+${from}`, incomingText);
              }
            }
          }
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.status(404).send('Not Found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// --- Interactive Chat & Simulator API ---
app.post('/api/chat/message', async (req: Request, res: Response) => {
  try {
    const { phone, text } = req.body;
    if (!phone || !text) {
      return res.status(400).json({ error: 'phone and text are required' });
    }
    const result = await processTraderMessage(phone, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal chat processing error' });
  }
});

app.get('/api/chat/session/:phone', (req: Request, res: Response) => {
  const phone = req.params.phone;
  const session = getOrCreateSession(phone);
  res.json(session);
});

app.post('/api/chat/reset/:phone', (req: Request, res: Response) => {
  const phone = req.params.phone;
  delete traderSessions[phone];
  const fresh = getOrCreateSession(phone);
  res.json(fresh);
});

// --- Direct NLU Parser API ---
app.post('/api/nlu/parse', async (req: Request, res: Response) => {
  try {
    const { text, category } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    const parsed = await parseTraderMessageWithAI(text, category);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'NLU parsing failed' });
  }
});

// --- Speech-to-Text / Audio Transcriber ---
app.post('/api/speech/transcribe', async (req: Request, res: Response) => {
  try {
    const { sampleId, audioBase64 } = req.body;

    const PRESET_AUDIO_TRANSCRIPTS: Record<string, { transcription: string; detectedLanguage: string; trade: string; note: string }> = {
      sample_hardware_cement: {
        transcription: 'Niaje Soko Smart, nataka mifuko ishirini ya saruji simiti Bamburi kesho asubuhi hapa Jogoo Road.',
        detectedLanguage: 'sheng',
        trade: 'hardware',
        note: 'Hardware order with local Swahili/Sheng cement terminology.'
      },
      sample_salon_braids: {
        transcription: 'Habari Soko Smart. Nahitaji carton moja ya Darling Abuja braids rangi namba moja na jerrican ya shampoo lita tano.',
        detectedLanguage: 'swahili',
        trade: 'salon_beauty',
        note: 'Salon beauty wholesale request with brand and packaging units.'
      },
      sample_tailoring_kanga: {
        transcription: 'Hallow, nataka roli tatu za kitambaa cha kanga na boksi moja ya uzi wa mashine kesho.',
        detectedLanguage: 'swahili',
        trade: 'tailoring_textiles',
        note: 'Tailoring fabric and cone thread bulk procurement.'
      },
      sample_dispute_hardware: {
        transcription: 'Hallow Soko Smart, TATIZO. Mabati matatu tuliyoshusha kutoka kwa lori yamepondoka kona vibaya sana.',
        detectedLanguage: 'swahili',
        trade: 'hardware',
        note: 'Dispute alert with keyword TATIZO.'
      }
    };

    if (sampleId && PRESET_AUDIO_TRANSCRIPTS[sampleId]) {
      const selected = PRESET_AUDIO_TRANSCRIPTS[sampleId];
      const parsedNlu = await parseTraderMessageWithAI(selected.transcription);
      return res.json({
        ...selected,
        nlu: parsedNlu
      });
    }

    if (audioBase64 && ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              text: 'Transcribe this Kenyan trader audio note accurately. Language is Swahili, Sheng, or English. Return only transcription.'
            },
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: audioBase64
              }
            }
          ]
        });
        const transcription = response.text?.trim() || 'Nahitaji mifuko kumi ya saruji Bamburi kesho';
        const parsedNlu = await parseTraderMessageWithAI(transcription);
        return res.json({
          transcription,
          detectedLanguage: 'swahili',
          nlu: parsedNlu,
          note: 'Transcribed via Gemini 3.8 Flash'
        });
      } catch (err) {
        console.warn('Audio Gemini transcription failed, using fallback:', err);
      }
    }

    const fallbackText = 'Niaje Soko Smart, nataka kuagiza bidhaa za jumla kesho asubuhi.';
    const parsedNlu = await parseTraderMessageWithAI(fallbackText);
    res.json({
      transcription: fallbackText,
      detectedLanguage: 'sheng',
      nlu: parsedNlu,
      note: 'Fallback audio transcription'
    });
  } catch (error) {
    res.status(500).json({ error: 'Audio transcription failed' });
  }
});

// --- Demand Orders & Multi-Trade Clustering ---
app.get('/api/demand/clusters', (_req: Request, res: Response) => {
  res.json({
    clusters,
    orders,
    suppliers,
    businesses,
    tradeCategories: TRADE_CATEGORIES
  });
});

app.post('/api/demand/orders', (req: Request, res: Response) => {
  const { businessId, productId, rawQuantity, rawUnit, targetPricePerUnitKsh, ward, category } = req.body;

  const biz = businesses.find(b => b.id === businessId) || businesses[0];
  const prod = products.find(p => p.id === productId) || products[0];

  const unitFactor = prod.supportedUnits.find(u => u.unit === rawUnit)?.multiplierToBase || 1;
  const normalizedBaseQty = rawQuantity * unitFactor;

  const newOrder: DemandOrder = {
    id: `ord-${Date.now().toString().slice(-4)}`,
    businessId: biz.id,
    businessName: biz.businessName,
    ownerName: biz.ownerName,
    category: category || prod.category,
    phone: biz.phone,
    ward: ward || biz.ward,
    productId: prod.id,
    productName: prod.name,
    rawQuantity: Number(rawQuantity),
    rawUnit: rawUnit || prod.defaultUnit,
    normalizedBaseQty,
    targetPricePerUnitKsh: Number(targetPricePerUnitKsh) || prod.benchmarkPriceKsh,
    deliveryDate: '2026-09-29',
    createdAt: new Date().toISOString(),
    status: 'open'
  };

  orders.unshift(newOrder);

  // Cluster by product + trade category
  let matchedCluster = clusters.find(c => c.productId === prod.id && c.status === 'open');
  if (!matchedCluster) {
    matchedCluster = {
      id: `cluster-${prod.category}-${Date.now().toString().slice(-4)}`,
      category: prod.category,
      neighbourhood: 'Makadara Corridor (Hamza, Maringo, Viwandani)',
      productId: prod.id,
      productName: prod.name,
      totalQuantityBase: 0,
      unitSummary: '',
      businessCount: 0,
      orderIds: [],
      businessBreakdown: [],
      moqBase: prod.moqBaseUnit,
      moqMet: false,
      benchmarkPricePerUnit: prod.benchmarkPriceKsh,
      targetPriceCeilingPerUnit: prod.guardrailMaxKsh,
      status: 'open',
      cutoffTime: '17:00 EAT Today',
      deliveryDate: '2026-09-29'
    };
    clusters.unshift(matchedCluster);
  }

  newOrder.clusterId = matchedCluster.id;
  matchedCluster.orderIds.push(newOrder.id);
  matchedCluster.businessCount += 1;
  matchedCluster.totalQuantityBase += normalizedBaseQty;
  matchedCluster.moqMet = matchedCluster.totalQuantityBase >= matchedCluster.moqBase;
  matchedCluster.unitSummary = `${matchedCluster.totalQuantityBase} ${prod.defaultUnit}`;

  matchedCluster.businessBreakdown.push({
    businessId: biz.id,
    businessName: biz.businessName,
    ownerName: biz.ownerName,
    phone: biz.phone,
    quantityBase: normalizedBaseQty,
    rawDisplay: `${rawQuantity} ${rawUnit}`,
    allocatedAmountKsh: Math.round(normalizedBaseQty * prod.benchmarkPriceKsh)
  });

  res.status(201).json({
    order: newOrder,
    cluster: matchedCluster
  });
});

app.post('/api/demand/clusters/:id/lock', (req: Request, res: Response) => {
  const cluster = clusters.find(c => c.id === req.params.id);
  if (!cluster) {
    return res.status(404).json({ error: 'Cluster not found' });
  }

  cluster.status = 'negotiating';

  const matchedSupp = suppliers.find(s => s.category === cluster.category) || suppliers[0];
  cluster.supplierId = matchedSupp.id;
  cluster.supplierName = matchedSupp.name;

  if (!negotiationSessions[cluster.id]) {
    const prod = products.find(p => p.id === cluster.productId) || products[0];
    const initialAsk = Math.round(prod.benchmarkPriceKsh * 1.05);
    const initialCounter = prod.benchmarkPriceKsh;

    negotiationSessions[cluster.id] = {
      id: `neg-${cluster.id}`,
      clusterId: cluster.id,
      category: cluster.category,
      supplierId: matchedSupp.id,
      supplierName: matchedSupp.name,
      productName: cluster.productName,
      totalUnits: cluster.totalQuantityBase,
      status: 'in_progress',
      guardrails: {
        minPricePerUnit: prod.guardrailMinKsh,
        maxPricePerUnit: prod.guardrailMaxKsh,
        requiredDeliveryDate: cluster.deliveryDate,
        paymentSplit: '50% on agreement via STK Push, 50% upon delivery inspection'
      },
      initialAskPricePerUnit: initialAsk,
      currentCounterPricePerUnit: initialCounter,
      transcript: [
        {
          id: `nm-${Date.now()}-1`,
          sender: 'agent',
          senderName: 'Soko Smart AI Coordinator',
          message: `Habari ${matchedSupp.name}. Wafanyabiashara wa Makadara wameunganisha agizo la pamoja la ${cluster.totalQuantityBase} units za ${cluster.productName}. Tunalipa 50% escrow mara moja na kupokea asubuhi. Bei yetu ya jumla ni KSh ${initialCounter} kwa unit.`,
          priceOfferPerUnit: initialCounter,
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  res.json({ cluster, negotiation: negotiationSessions[cluster.id] });
});

// --- Supplier Bounded Negotiation Engine ---
app.get('/api/negotiation/:clusterId', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }
  res.json(session);
});

app.post('/api/negotiation/:clusterId/supplier-reply', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  const { proposedPricePerUnit, message } = req.body;
  const offeredPrice = Number(proposedPricePerUnit);

  session.transcript.push({
    id: `nm-${Date.now()}`,
    sender: 'supplier',
    senderName: session.supplierName,
    message: message || `Bei yetu ya kiwanda ni KSh ${offeredPrice} kwa unit kutokana na gharama za usambazaji.`,
    priceOfferPerUnit: offeredPrice,
    timestamp: new Date().toISOString()
  });

  // Guardrail Check
  if (offeredPrice > session.guardrails.maxPricePerUnit) {
    session.status = 'escalated_to_ops';
    session.escalationReason = `Bei iliyoombwa na msambazaji (KSh ${offeredPrice}) imevuka kikomo cha juu cha Soko Smart (KSh ${session.guardrails.maxPricePerUnit}). Inahitaji idhini ya afisa wa ununuzi.`;

    session.transcript.push({
      id: `nm-${Date.now()}-esc`,
      sender: 'agent',
      senderName: 'Soko Smart Safety Guardrail',
      message: `[KIKOMO KIMEKIUKWA]: Bei ya KSh ${offeredPrice} inazidi kiwango cha juu (KSh ${session.guardrails.maxPricePerUnit}). Mazungumzo yamesitishwa kwa ukaguzi wa Afisa wa Ununuzi (Human-in-the-Loop).`,
      timestamp: new Date().toISOString(),
      isEscalationTrigger: true
    });

    return res.json({ session, escalated: true });
  }

  if (offeredPrice <= session.currentCounterPricePerUnit + (offeredPrice * 0.03)) {
    session.status = 'agreed';
    session.agreedPricePerUnit = offeredPrice;

    session.transcript.push({
      id: `nm-${Date.now()}-agree`,
      sender: 'agent',
      senderName: 'Soko Smart AI Coordinator',
      message: `Tumekubaliana kwa KSh ${offeredPrice} kwa unit! Tunatayarisha Mkataba wa Kielektroniki (Micro-Agreement) na kutuma kwa pande zote mbili mara moja.`,
      priceOfferPerUnit: offeredPrice,
      timestamp: new Date().toISOString()
    });

    const cluster = clusters.find(c => c.id === session.clusterId);
    if (cluster) {
      cluster.status = 'agreement_drafted';
      cluster.negotiatedPricePerUnit = offeredPrice;
    }
  } else {
    const counter = Math.min(session.guardrails.maxPricePerUnit, Math.round((session.currentCounterPricePerUnit + offeredPrice) / 2));
    session.currentCounterPricePerUnit = counter;

    session.transcript.push({
      id: `nm-${Date.now()}-counter`,
      sender: 'agent',
      senderName: 'Soko Smart AI Coordinator',
      message: `Tunaelewa gharama za usafiri, lakini wafanyabiashara wetu wananunua kiasi kikubwa cha ${session.totalUnits} units na malipo ya uhakika ya M-PESA escrow. Tunaweza kufanya KSh ${counter} kwa unit?`,
      priceOfferPerUnit: counter,
      timestamp: new Date().toISOString()
    });
  }

  res.json({ session, escalated: false });
});

app.post('/api/negotiation/:clusterId/human-override', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  const { action, approvedPricePerUnit, notes } = req.body;
  if (action === 'approve') {
    const finalPrice = Number(approvedPricePerUnit) || session.guardrails.maxPricePerUnit;
    session.status = 'agreed';
    session.agreedPricePerUnit = finalPrice;
    session.opsApproved = true;

    session.transcript.push({
      id: `nm-${Date.now()}-ops`,
      sender: 'human_ops',
      senderName: 'Soko Smart Buyer Representative (Human Ops)',
      message: `[IDHINI YA BINADAMU / OPS OVERRIDE]: Bei ya KSh ${finalPrice} imeidhinishwa. Sababu: ${notes || 'Kupanda kwa gharama za kiwanda nchi nzima.'}`,
      priceOfferPerUnit: finalPrice,
      timestamp: new Date().toISOString()
    });

    const cluster = clusters.find(c => c.id === session.clusterId);
    if (cluster) {
      cluster.status = 'agreement_drafted';
      cluster.negotiatedPricePerUnit = finalPrice;
    }
  } else {
    session.status = 'rejected';
    session.transcript.push({
      id: `nm-${Date.now()}-ops-rej`,
      sender: 'human_ops',
      senderName: 'Soko Smart Buyer Representative (Human Ops)',
      message: `[IMEKATALIWA]: Ofa ya msambazaji imekataliwa. Tunatafuta msambazaji mbadala wa kundi hili.`,
      timestamp: new Date().toISOString()
    });
  }

  res.json(session);
});

// --- Bilingual Micro-Agreement Generation ---
app.post('/api/agreements/generate', (req: Request, res: Response) => {
  const { clusterId } = req.body;
  const cluster = clusters.find(c => c.id === clusterId);
  if (!cluster) {
    return res.status(404).json({ error: 'Cluster not found' });
  }

  const supp = suppliers.find(s => s.id === cluster.supplierId) || suppliers[0];
  const agreedPrice = cluster.negotiatedPricePerUnit || cluster.benchmarkPricePerUnit;
  const totalValue = cluster.totalQuantityBase * agreedPrice;
  const contractNum = `SK254-${cluster.category.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  const swahiliAgreement = `MKATABA WA UNUNUZI WA PAMOJA WA KIELEKTRONIKI (SOKO SMART)
Nambari ya Mkataba: ${contractNum}
Tarehe: ${new Date().toLocaleDateString('en-GB')}
Sekta ya Biashara: ${cluster.category.toUpperCase()}

Pande Zinazohusika:
1. Msambazaji / Kiwanda: ${supp.name} (${supp.phone})
2. Muungano wa Wafanyabiashara Makadara (Wanachama ${cluster.businessCount})

Maelezo ya Agizo:
- Bidhaa: ${cluster.productName}
- Jumla ya Idadi Iliyokusanywa: ${cluster.totalQuantityBase} units (${cluster.unitSummary})
- Bei Iliyokubaliwa ya Jumla: KSh ${agreedPrice} kwa unit
- Thamani Kamili ya Mkataba: KSh ${totalValue.toLocaleString()}

Muda na Mahali pa Kushusha Mzigo:
- Tarehe ya Kufikishwa: ${cluster.deliveryDate} kabla ya saa 08:30 Asubuhi
- Eneo la Kushusha: Hamza Central B2B Staging Hub, Jogoo Road, Makadara

Masharti ya Malipo na Escrow:
- Asilimia 50 (KSh ${(totalValue * 0.5).toLocaleString()}) inazuiliwa kwenye akaunti salama ya Soko Smart Escrow kupitia M-PESA STK Push.
- Asilimia 50 inayobaki inatolewa kwa msambazaji mara tu wawakilishi wanapokagua ubora, chapa na idadi ya mzigo.
- Ikitokea uharibifu au bidhaa feki, mfanyabiashara anatuma "TATIZO" na picha ndani ya saa 3 kwa rejesho la papo hapo.

Uthibitisho:
Pande zote zinathibitisha kwa kutuma neno "NDIYO" au "YES" kwenye WhatsApp ya Soko Smart.`;

  const englishAgreement = `SOKO SMART B2B POOLED PURCHASE AGREEMENT
Agreement Reference: ${contractNum}
Date of Issuance: ${new Date().toLocaleDateString('en-GB')}
Trade Category: ${cluster.category.toUpperCase()}

Parties:
1. Supplier / Wholesale Depot: ${supp.name} (${supp.phone})
2. Buyer Cluster: Makadara Small Traders Pool (${cluster.businessCount} Merchants)

Specification:
- Product: ${cluster.productName}
- Total Aggregated Volume: ${cluster.totalQuantityBase} units (${cluster.unitSummary})
- Agreed Factory Bulk Rate: KSh ${agreedPrice}.00 per unit
- Total Consideration: KSh ${totalValue.toLocaleString()}.00

Logistics & Delivery Schedule:
- Delivery Window: ${cluster.deliveryDate}, strictly before 08:30 AM EAT
- Drop-off Bay: Hamza Central B2B Staging Hub, Jogoo Road, Makadara

Settlement & Escrow Terms:
- 50% mobilization deposit (KSh ${(totalValue * 0.5).toLocaleString()}.00) held in Soko Smart Escrow via individual trader M-PESA STK pushes.
- 50% balance released via Daraja B2B upon verified physical offload and inspection.
- Mismatched or damaged goods reported within 3 hours via keyword "TATIZO" for proportional credit or immediate reversal.

Consent:
Formally verified via single-word WhatsApp reply "NDIYO" / "YES" by both wholesale dispatch and cluster merchants.`;

  const businessConfirmations: Record<string, { confirmed: boolean; channel: 'whatsapp' | 'sms' }> = {};
  cluster.businessBreakdown.forEach(bb => {
    businessConfirmations[bb.businessId] = { confirmed: false, channel: 'whatsapp' };
  });

  const newAgreement: MicroAgreement = {
    id: `AGR-${contractNum}`,
    contractNumber: contractNum,
    category: cluster.category,
    clusterId: cluster.id,
    supplierId: supp.id,
    supplierName: supp.name,
    supplierPhone: supp.phone,
    productName: cluster.productName,
    totalQuantityBase: cluster.totalQuantityBase,
    pricePerUnitKsh: agreedPrice,
    totalContractValueKsh: totalValue,
    deliveryDate: `${cluster.deliveryDate} kabla ya 08:30 AM EAT`,
    deliveryLocation: 'Hamza Central B2B Staging Hub, Jogoo Road, Makadara',
    qualityTerms: 'Bidhaa halisi ya kiwanda iliyofungwa vizuri, isiyo na kasoro, uzani na viwango rasmi vya KEBS.',
    paymentTerms: '50% STK Push deposit to Escrow, 50% Daraja B2B payout upon offload signoff.',
    disputePolicy: 'Tuma neno "TATIZO" ndani ya saa 3 kurejeshewa pesa au kuletewa mbadala mara moja.',
    swahiliText: swahiliAgreement,
    englishText: englishAgreement,
    status: 'pending_confirmation',
    businessConfirmations,
    supplierConfirmed: true,
    supplierConfirmedTimestamp: new Date().toISOString(),
    digitalVerificationHash: `sha256-sk254-${Date.now().toString(16)}`,
    createdAt: new Date().toISOString()
  };

  agreements.unshift(newAgreement);
  cluster.microAgreementId = newAgreement.id;
  cluster.status = 'agreement_drafted';

  res.status(201).json(newAgreement);
});

app.get('/api/agreements', (_req: Request, res: Response) => {
  res.json(agreements);
});

app.post('/api/agreements/:id/confirm', (req: Request, res: Response) => {
  const agreement = agreements.find(a => a.id === req.params.id);
  if (!agreement) {
    return res.status(404).json({ error: 'Agreement not found' });
  }

  const { businessId, role } = req.body;
  if (role === 'supplier') {
    agreement.supplierConfirmed = true;
    agreement.supplierConfirmedTimestamp = new Date().toISOString();
  } else if (businessId) {
    agreement.businessConfirmations[businessId] = {
      confirmed: true,
      timestamp: new Date().toISOString(),
      channel: 'whatsapp'
    };
  }

  const allConfirmed = Object.values(agreement.businessConfirmations).every(b => b.confirmed);
  if (allConfirmed && agreement.supplierConfirmed) {
    agreement.status = 'confirmed_by_all';
    const cluster = clusters.find(c => c.id === agreement.clusterId);
    if (cluster) {
      cluster.status = 'stk_sent';
    }
  }

  res.json(agreement);
});

// --- M-PESA Daraja STK Push & Double-Entry Ledger ---

app.post('/api/mpesa/stkpush', async (req: Request, res: Response) => {
  try {
    const { businessId, phone, amountKsh, purpose, agreementId } = req.body;
    const cleanPhone = (phone || '254712998877').replace('+', '');
    const amount = Number(amountKsh) || 1000;
    const checkoutReqId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newTx: MpesaTransaction = {
      id: `tx-${Date.now().toString().slice(-5)}`,
      checkoutRequestId: checkoutReqId,
      merchantRequestId: `MR-${Date.now().toString().slice(-6)}`,
      businessId,
      phone: cleanPhone,
      amount,
      purpose: purpose || 'trader_pool_collection',
      status: 'pending_pin',
      timestamp: new Date().toISOString(),
      referenceAgreementId: agreementId
    };

    mpesaTransactions.unshift(newTx);

    res.json({
      success: true,
      checkoutRequestId: checkoutReqId,
      customerMessage: 'Success. Request accepted for processing',
      transaction: newTx,
      promptText: `Do you want to pay KSh ${amount.toLocaleString()} to SOKO SMART TILL 400200 for Pooled Bulk Order? Enter M-PESA PIN:`
    });
  } catch (error) {
    res.status(500).json({ error: 'STK Push failed to dispatch' });
  }
});

app.post('/api/mpesa/simulate-phone-stk', (req: Request, res: Response) => {
  const { checkoutRequestId, pin, action } = req.body;
  const tx = mpesaTransactions.find(t => t.checkoutRequestId === checkoutRequestId) || mpesaTransactions[0];

  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (action === 'cancel') {
    tx.status = 'failed';
    tx.resultCode = 1032;
    tx.resultDesc = 'Request cancelled by user';
    return res.json({ success: false, tx });
  }

  if (pin && pin.length >= 4) {
    tx.status = 'completed';
    tx.resultCode = 0;
    tx.resultDesc = 'The service request is processed successfully.';
    tx.mpesaReceiptNumber = `QKD${Date.now().toString().slice(-6)}SK`;

    const newLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'TRADER_COLLECTION',
      debitAccount: 'MPESA_SETTLEMENT_SUSPENSE',
      creditAccount: 'ESCROW_SOKO_SMART_POOL',
      amountKsh: tx.amount,
      referenceId: tx.mpesaReceiptNumber,
      description: `M-PESA STK Push received from ${tx.phone} for agreement #${tx.referenceAgreementId || 'SK254'}`
    };
    ledger.unshift(newLedgerEntry);

    // 2.5% platform commission
    const commission = Math.round(tx.amount * 0.025);
    ledger.unshift({
      id: `ledg-comm-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'COMMISSION_FEE',
      debitAccount: 'ESCROW_SOKO_SMART_POOL',
      creditAccount: 'SOKO_SMART_REVENUE',
      amountKsh: commission,
      referenceId: `FEE-${tx.mpesaReceiptNumber}`,
      description: `Platform 2.5% bulk coordination fee`
    });

    return res.json({ success: true, tx, ledgerEntry: newLedgerEntry });
  }

  res.status(400).json({ error: 'Invalid PIN provided' });
});

app.get('/api/ledger', (_req: Request, res: Response) => {
  const totalCollections = ledger
    .filter(l => l.transactionType === 'TRADER_COLLECTION')
    .reduce((sum, l) => sum + l.amountKsh, 0);

  const totalPayouts = ledger
    .filter(l => l.transactionType === 'SUPPLIER_PAYOUT')
    .reduce((sum, l) => sum + l.amountKsh, 0);

  const totalCommissions = ledger
    .filter(l => l.transactionType === 'COMMISSION_FEE')
    .reduce((sum, l) => sum + l.amountKsh, 0);

  const escrowBalance = totalCollections - totalPayouts - totalCommissions;

  res.json({
    ledger,
    transactions: mpesaTransactions,
    summary: {
      totalCollections,
      totalPayouts,
      totalCommissions,
      escrowBalance
    }
  });
});

app.post('/api/ledger/payout-supplier', (req: Request, res: Response) => {
  const { supplierId, amountKsh, agreementId } = req.body;
  const amount = Number(amountKsh) || 10000;
  const supp = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const receiptNum = `B2B${Date.now().toString().slice(-6)}SK`;

  const payoutEntry: LedgerEntry = {
    id: `ledg-payout-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    transactionType: 'SUPPLIER_PAYOUT',
    debitAccount: 'ESCROW_SOKO_SMART_POOL',
    creditAccount: `SUPPLIER_PAYBILL_${supp.mpesaPaybill}`,
    amountKsh: amount,
    referenceId: receiptNum,
    description: `Daraja B2B Payout to ${supp.name} for agreement #${agreementId || 'SK254'}`
  };
  ledger.unshift(payoutEntry);

  mpesaTransactions.unshift({
    id: `tx-payout-${Date.now().toString().slice(-5)}`,
    checkoutRequestId: `b2b_req_${Date.now()}`,
    merchantRequestId: `MR_B2B_${Date.now()}`,
    phone: supp.phone,
    amount,
    purpose: 'supplier_final_payout',
    status: 'completed',
    mpesaReceiptNumber: receiptNum,
    resultCode: 0,
    resultDesc: 'B2B Paybill payment completed',
    timestamp: new Date().toISOString(),
    referenceAgreementId: agreementId
  });

  res.json({ success: true, ledgerEntry: payoutEntry, receiptNumber: receiptNum });
});

// --- Disputes Desk ---
app.get('/api/disputes', (_req: Request, res: Response) => {
  res.json(disputes);
});

app.post('/api/disputes/:id/resolve', (req: Request, res: Response) => {
  const dispute = disputes.find(d => d.id === req.params.id);
  if (!dispute) {
    return res.status(404).json({ error: 'Dispute not found' });
  }

  const { action, refundAmountKsh, resolutionNotes } = req.body;
  dispute.resolutionNotes = resolutionNotes;

  if (action === 'refund') {
    dispute.status = 'approved_refund';
    const refundAmt = Number(refundAmountKsh) || dispute.claimedAmountKsh;

    const refundReceipt = `B2C_REF_${Date.now().toString().slice(-6)}`;
    ledger.unshift({
      id: `ledg-ref-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'DISPUTE_REFUND',
      debitAccount: 'ESCROW_SOKO_SMART_POOL',
      creditAccount: `TRADER_MPESA_${dispute.phone}`,
      amountKsh: refundAmt,
      referenceId: refundReceipt,
      description: `M-PESA B2C Refund for dispute #${dispute.id} (${dispute.productName})`
    });

    mpesaTransactions.unshift({
      id: `tx-ref-${Date.now().toString().slice(-5)}`,
      checkoutRequestId: `b2c_req_${Date.now()}`,
      merchantRequestId: `MR_B2C_${Date.now()}`,
      phone: dispute.phone,
      amount: refundAmt,
      purpose: 'refund_dispute',
      status: 'completed',
      mpesaReceiptNumber: refundReceipt,
      resultCode: 0,
      resultDesc: 'Daraja B2C dispute refund processed',
      timestamp: new Date().toISOString()
    });
  } else if (action === 'replace') {
    dispute.status = 'replacement_issued';
  } else {
    dispute.status = 'rejected';
  }

  res.json(dispute);
});

// --- Configurable Ontology per Trade ---
app.get('/api/ontology', (_req: Request, res: Response) => {
  res.json({
    products,
    categories: TRADE_CATEGORIES
  });
});

app.put('/api/ontology/:id', (req: Request, res: Response) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...req.body };
    return res.json(products[idx]);
  }
  res.status(404).json({ error: 'Product not found' });
});

// --- Frontend Dev & Production Mounting ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Soko Smart Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
