import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PRODUCE_CATALOG,
  INITIAL_VENDORS,
  INITIAL_COOPERATIVES,
  INITIAL_ORDERS,
  INITIAL_CLUSTERS,
  INITIAL_AGREEMENTS,
  INITIAL_LEDGER,
  INITIAL_DISPUTES
} from './src/data/seedData';
import {
  DemandOrder,
  DemandCluster,
  MicroAgreement,
  LedgerEntry,
  DisputeTicket,
  NluParseResult,
  NegotiationSession,
  MpesaTransaction
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory operational database
let produceCatalog = [...INITIAL_PRODUCE_CATALOG];
let vendors = [...INITIAL_VENDORS];
let cooperatives = [...INITIAL_COOPERATIVES];
let orders: DemandOrder[] = [...INITIAL_ORDERS];
let clusters: DemandCluster[] = [...INITIAL_CLUSTERS];
let agreements: MicroAgreement[] = [...INITIAL_AGREEMENTS];
let ledger: LedgerEntry[] = [...INITIAL_LEDGER];
let disputes: DisputeTicket[] = [...INITIAL_DISPUTES];
let mpesaTransactions: MpesaTransaction[] = [
  {
    id: 'tx-001',
    checkoutRequestId: 'ws_CO_27092026_01',
    merchantRequestId: 'MR-9921',
    vendorId: 'vendor-sarah',
    vendorName: 'Mama Sarah Wanjiku',
    vendorPhone: '+254712345678',
    amount: 3510,
    purpose: 'vendor_pool_collection',
    status: 'completed',
    mpesaReceiptNumber: 'QKA82910XZ',
    resultCode: 0,
    resultDesc: 'The service request is processed successfully.',
    timestamp: '2026-09-27T08:12:15Z'
  },
  {
    id: 'tx-002',
    checkoutRequestId: 'ws_CO_27092026_02',
    merchantRequestId: 'MR-9922',
    vendorId: 'vendor-wambui',
    vendorName: 'Mama Wambui Kamau',
    vendorPhone: '+254722987654',
    amount: 4680,
    purpose: 'vendor_pool_collection',
    status: 'completed',
    mpesaReceiptNumber: 'QKB99301KL',
    resultCode: 0,
    resultDesc: 'The service request is processed successfully.',
    timestamp: '2026-09-27T08:15:45Z'
  }
];

// Active negotiation sessions
let negotiationSessions: Record<string, NegotiationSession> = {
  'cluster-makadara-sukuma-01': {
    id: 'neg-sukuma-01',
    clusterId: 'cluster-makadara-sukuma-01',
    cooperativeId: 'coop-limuru',
    cooperativeName: 'Limuru Greens Smallholder Alliance',
    produceName: 'Sukuma Wiki',
    totalKg: 350,
    status: 'in_progress',
    guardrails: {
      minPricePerKg: 18,
      maxPricePerKg: 28,
      requiredDeliveryDate: '2026-09-28',
      paymentSplit: '50% on agreement via STK Push, 50% upon delivery'
    },
    initialAskPricePerKg: 24,
    currentCounterPricePerKg: 21,
    transcript: [
      {
        id: 'nm-1',
        sender: 'cooperative',
        senderName: 'Limuru Greens Dispatch',
        message: 'Habari Soko Smart. Tunazo kilo 350 za sukuma safi ya shamba. Bei yetu ya jumla ni KSh 24 kwa kilo.',
        priceOfferPerKg: 24,
        timestamp: '2026-09-27T07:15:00Z'
      },
      {
        id: 'nm-2',
        sender: 'agent',
        senderName: 'Soko Smart AI Agent',
        message: 'Asante sana Limuru Greens. Makadara Mama Mbogas wanachukua oda ya pamoja ya kilo 350 na malipo ya 50% escrow ya papo hapo. Kulingana na bei ya soko ya leo, tunaweza kufunga kwa KSh 21 kwa kilo.',
        priceOfferPerKg: 21,
        timestamp: '2026-09-27T07:18:00Z'
      }
    ]
  }
};

// Vendor conversation state sessions keyed by phone
interface ConversationSession {
  phone: string;
  vendorId?: string;
  vendorName?: string;
  currentStep: 'IDLE' | 'CONFIRMING_ORDER' | 'PENDING_AGREEMENT_CONFIRMATION' | 'AWAITING_PIN' | 'REPORTING_DISPUTE';
  pendingOrderDraft?: {
    produceId: string;
    produceName: string;
    quantity: number;
    unit: string;
    normalizedKg: number;
    priceCeiling?: number;
    deliveryDate: string;
  };
  activeAgreementId?: string;
  history: {
    role: 'vendor' | 'agent';
    text: string;
    timestamp: string;
    type?: string;
  }[];
}

const vendorSessions: Record<string, ConversationSession> = {};

function getOrCreateSession(phone: string): ConversationSession {
  if (!vendorSessions[phone]) {
    const matchedVendor = vendors.find(v => v.phone === phone || v.mpesaNumber === phone.replace('+', ''));
    vendorSessions[phone] = {
      phone,
      vendorId: matchedVendor?.id,
      vendorName: matchedVendor?.name || 'Mama Mboga',
      currentStep: 'IDLE',
      history: [
        {
          role: 'agent',
          text: `Habari! Mimi ni Soko Smart, msaidizi wako wa ununuzi wa pamoja wa mboga na matunda hapa Makadara. Niambie nini unahitaji kesho (mfano: "Nataka magunia 2 ya nyanya na debe 1 ya viazi") kwa sauti au ujumbe mfupi.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
  return vendorSessions[phone];
}

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// ==========================================
// 1. NLU PARSER (Swahili / Sheng / English)
// ==========================================

async function parseVendorMessageWithAI(rawText: string): Promise<NluParseResult> {
  const fallbackResult = fallbackNluParser(rawText);

  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `You are the NLU parser for "Soko Smart", an AI coordinator for informal produce vendors ("Mama Mbogas") in Nairobi, Kenya (specifically Makadara neighbourhood).
Vendors send messages in Swahili, Sheng (Nairobi street slang), English, or code-switched combinations.

Canonical Produce Catalog:
- "nyanya" / "tomatoes" -> canonicalProduceId: "prod-nyanya", name: "Tomatoes"
- "sukuma wiki" / "sukuma" / "kales" -> canonicalProduceId: "prod-sukuma", name: "Sukuma Wiki"
- "vitunguu" / "onions" -> canonicalProduceId: "prod-vitunguu", name: "Red Onions"
- "viazi" / "waru" / "potatoes" -> canonicalProduceId: "prod-viazi", name: "Potatoes (Irish)"
- "managu" / "nightshade" -> canonicalProduceId: "prod-managu", name: "Managu"
- "kunde" / "cowpea leaves" -> canonicalProduceId: "prod-kunde", name: "Kunde"

Common Units & Conversions:
- "gunia" / "magunia" / "sack" / "bag": Nyanya ~60kg, Sukuma ~70kg, Vitunguu ~50kg, Waru ~90kg
- "debe" / "madebe": Nyanya ~15kg, Waru ~16kg
- "kilo" / "kg": 1kg
- "tenga": 75kg
- "net": 10kg

Identify the user intent:
- 'place_order': User requests produce, quantities, or supplies for tomorrow
- 'confirm_agreement': User replies "NDIYO", "YES", "Sawa", "Confirm", "Thibitisha", "1"
- 'report_dispute': User mentions "TATIZO", damaged, rotten, spoiled, missing produce
- 'check_price': User asks for current bulk prices or market status
- 'cancel_order': User wants to cancel an order
- 'onboarding': New vendor greeting or registering
- 'help': User asks how the service works
- 'other': Unrecognized or general banter

Text to analyze:
"${rawText}"

Return ONLY valid JSON matching this schema:
{
  "intent": "place_order" | "confirm_agreement" | "report_dispute" | "check_price" | "cancel_order" | "onboarding" | "help" | "other",
  "detectedLanguage": "swahili" | "sheng" | "english" | "mixed",
  "confidence": number between 0 and 1,
  "rawInput": string,
  "extractedEntities": [
    {
      "produceName": string,
      "canonicalProduceId": string,
      "quantity": number,
      "unit": string,
      "normalizedKg": number,
      "priceCeilingKsh": number or null
    }
  ],
  "requiresClarification": boolean,
  "clarificationMessage": {
    "swahili": string,
    "english": string,
    "sheng": string
  },
  "summaryForVendor": {
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
        confidence: parsed.confidence || 0.95,
        rawInput: rawText,
        extractedEntities: parsed.extractedEntities || [],
        requiresClarification: Boolean(parsed.requiresClarification),
        clarificationMessage: parsed.clarificationMessage,
        summaryForVendor: parsed.summaryForVendor || fallbackResult.summaryForVendor
      };
    }
    return fallbackResult;
  } catch (error) {
    console.error('Gemini NLU Parse Error, using fallback:', error);
    return fallbackResult;
  }
}

function fallbackNluParser(text: string): NluParseResult {
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
    lower.includes('iko sawa')
  ) {
    return {
      intent: 'confirm_agreement',
      detectedLanguage: 'swahili',
      confidence: 0.98,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForVendor: {
        swahili: 'Umethibitisha makubaliano.',
        sheng: 'Umeshagonga confirm.',
        english: 'You have confirmed the micro-agreement.'
      }
    };
  }

  // 2. Dispute
  if (
    lower.includes('tatizo') ||
    lower.includes('zimeoza') ||
    lower.includes('zimeharibika') ||
    lower.includes('upungufu') ||
    lower.includes('ubora mbaya') ||
    lower.includes('dispute') ||
    lower.includes('shida')
  ) {
    return {
      intent: 'report_dispute',
      detectedLanguage: lower.includes('shida') || lower.includes('zimeoza') ? 'swahili' : 'sheng',
      confidence: 0.95,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForVendor: {
        swahili: 'Kikosi chetu kimepokea ripoti ya tatizo na kinashughulikia sasa hivi.',
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
      confidence: 0.9,
      rawInput: text,
      extractedEntities: [],
      requiresClarification: false,
      summaryForVendor: {
        swahili: 'Unaulizia bei za soko za jumla.',
        sheng: 'Unacheki bei za jumla leo.',
        english: 'Inquiring about today bulk wholesale produce prices.'
      }
    };
  }

  // 4. Place order extraction
  const entities: NluParseResult['extractedEntities'] = [];
  const words = lower;

  // Tomatoes / Nyanya
  if (words.includes('nyanya') || words.includes('tomato')) {
    let qty = 1;
    let unit = 'gunia';
    if (words.includes('tatu') || words.includes('3')) qty = 3;
    else if (words.includes('mbili') || words.includes('2')) qty = 2;
    else if (words.includes('nne') || words.includes('4')) qty = 4;
    else if (words.includes('tano') || words.includes('5')) qty = 5;

    if (words.includes('debe')) unit = 'debe';
    else if (words.includes('kilo')) unit = 'kilo';
    else if (words.includes('tenga')) unit = 'tenga';

    const factor = unit === 'debe' ? 15 : unit === 'kilo' ? 1 : 60;
    entities.push({
      produceName: 'Nyanya',
      canonicalProduceId: 'prod-nyanya',
      quantity: qty,
      unit,
      normalizedKg: qty * factor,
      priceCeilingKsh: 2400
    });
  }

  // Sukuma wiki
  if (words.includes('sukuma') || words.includes('kales')) {
    let qty = 2;
    let unit = 'gunia';
    if (words.includes('tano') || words.includes('5')) qty = 5;
    else if (words.includes('moja') || words.includes('1')) qty = 1;
    else if (words.includes('kilo')) {
      unit = 'kilo';
      const m = words.match(/(\d+)\s*(kilo|kg)/);
      if (m) qty = parseInt(m[1], 10);
      else qty = 40;
    }

    const factor = unit === 'kilo' ? 1 : 70;
    entities.push({
      produceName: 'Sukuma Wiki',
      canonicalProduceId: 'prod-sukuma',
      quantity: qty,
      unit,
      normalizedKg: qty * factor,
      priceCeilingKsh: 1500
    });
  }

  // Onions / Vitunguu
  if (words.includes('vitunguu') || words.includes('onion')) {
    let qty = 1;
    let unit = 'gunia';
    if (words.includes('mbili') || words.includes('2')) qty = 2;
    if (words.includes('net')) unit = 'net';

    const factor = unit === 'net' ? 10 : 50;
    entities.push({
      produceName: 'Vitunguu',
      canonicalProduceId: 'prod-vitunguu',
      quantity: qty,
      unit,
      normalizedKg: qty * factor,
      priceCeilingKsh: 2800
    });
  }

  // Potatoes / Viazi / Waru
  if (words.includes('viazi') || words.includes('waru') || words.includes('potato')) {
    let qty = 2;
    let unit = 'gunia';
    if (words.includes('tano') || words.includes('5')) qty = 5;
    if (words.includes('debe')) unit = 'debe';

    const factor = unit === 'debe' ? 16 : 90;
    entities.push({
      produceName: 'Viazi / Waru',
      canonicalProduceId: 'prod-viazi',
      quantity: qty,
      unit,
      normalizedKg: qty * factor,
      priceCeilingKsh: 3200
    });
  }

  if (entities.length > 0) {
    const isSheng = words.includes('niaje') || words.includes('manze') || words.includes('budget') || words.includes('cheki');
    return {
      intent: 'place_order',
      detectedLanguage: isSheng ? 'sheng' : 'swahili',
      confidence: 0.92,
      rawInput: text,
      extractedEntities: entities,
      requiresClarification: false,
      summaryForVendor: {
        swahili: `Umependekeza kuagiza: ${entities.map(e => `${e.quantity} ${e.unit} za ${e.produceName} (~${e.normalizedKg}kg)`).join(', ')}.`,
        sheng: `Oda yako ni: ${entities.map(e => `${e.quantity} ${e.unit} ya ${e.produceName}`).join(', ')}.`,
        english: `Order items: ${entities.map(e => `${e.quantity} ${e.unit} of ${e.produceName}`).join(', ')}.`
      }
    };
  }

  return {
    intent: 'help',
    detectedLanguage: 'swahili',
    confidence: 0.7,
    rawInput: text,
    extractedEntities: [],
    requiresClarification: true,
    clarificationMessage: {
      swahili: 'Tafadhali taja zao unalohitaji (mfano: nyanya, sukuma wiki, vitunguu, viazi) na idadi kama magunia au kilo.',
      sheng: 'Niambie zao unataka, mfano magunia mbili za nyanya au debe ya waru.',
      english: 'Please specify the vegetable needed (e.g. tomatoes, kale, onions) and quantity in bags or kg.'
    },
    summaryForVendor: {
      swahili: 'Taja bidhaa na kiwango unachohitaji.',
      sheng: 'Bisha na oda yako freshi.',
      english: 'Specify your produce and quantity.'
    }
  };
}

// ==========================================
// 2. CONVERSATION STATE MACHINE & RESPONDER
// ==========================================

async function processVendorMessage(phone: string, text: string) {
  const session = getOrCreateSession(phone);
  const nlu = await parseVendorMessageWithAI(text);

  session.history.push({
    role: 'vendor',
    text,
    timestamp: new Date().toISOString()
  });

  let replyText = '';
  let quickReplies: { title: string; payload: string }[] | undefined = undefined;
  let triggerStkPush = false;
  let stkAmount = 0;

  switch (nlu.intent) {
    case 'confirm_agreement': {
      // Find agreement pending confirmation for this vendor
      const matchedAgreement = agreements.find(
        a => a.status === 'pending_confirmation' && a.vendorConfirmations[session.vendorId || '']?.confirmed === false
      ) || agreements[0];

      if (matchedAgreement && session.vendorId) {
        matchedAgreement.vendorConfirmations[session.vendorId] = {
          confirmed: true,
          timestamp: new Date().toISOString(),
          channel: 'whatsapp'
        };

        // Check if all confirmed
        const allConfirmed = Object.values(matchedAgreement.vendorConfirmations).every(v => v.confirmed);
        if (allConfirmed) {
          matchedAgreement.status = 'confirmed_by_all';
        }

        // Calculate vendor share for STK Push deposit (50%)
        const cluster = clusters.find(c => c.id === matchedAgreement.clusterId);
        const vendorAlloc = cluster?.vendorBreakdown.find(vb => vb.vendorId === session.vendorId);
        const totalCost = vendorAlloc ? vendorAlloc.allocatedAmountKsh : 3510;
        stkAmount = Math.round(totalCost * 0.5);

        replyText = `Asante ${session.vendorName}! Ujumbe wako wa "NDIYO" umethibitisha Mkataba #${matchedAgreement.contractNumber}.\n\nTunakutumia ombi la M-PESA STK Push la KSh ${stkAmount.toLocaleString()} (Amana ya 50% ya kuzuiliwa kwenye Escrow ya usalama). Tafadhali weka PIN yako kwenye simu.`;
        triggerStkPush = true;
        session.currentStep = 'AWAITING_PIN';
      } else {
        replyText = `Asante! Huna mkataba unaosubiri uthibitisho kwa sasa. Ungependa kuweka oda ya kesho?`;
      }
      break;
    }

    case 'place_order': {
      if (nlu.extractedEntities.length > 0) {
        const first = nlu.extractedEntities[0];
        const produce = produceCatalog.find(p => p.id === first.canonicalProduceId) || produceCatalog[0];
        const estPrice = first.normalizedKg ? first.normalizedKg * produce.benchmarkPriceKshPerKg : 2500;

        // Save into draft
        session.pendingOrderDraft = {
          produceId: produce.id,
          produceName: produce.name,
          quantity: first.quantity || 1,
          unit: first.unit || 'gunia',
          normalizedKg: first.normalizedKg || 60,
          priceCeiling: first.priceCeilingKsh,
          deliveryDate: 'Kesho Asubuhi (06:30 AM)'
        };
        session.currentStep = 'CONFIRMING_ORDER';

        replyText = `Safi sana! Nimepata oda yako:\n• Zao: ${produce.swahiliName} (${produce.name})\n• Kiasi: ${first.quantity} ${first.unit} (~${first.normalizedKg} kg)\n• Bei ya makadirio ya jumla: ~KSh ${estPrice.toLocaleString()}\n• Kufikishwa: Hamza Market Dropoff, kesho 06:30 AM.\n\nTafadhali jibu "NDIYO" au bonyeza 1 ili kuunganisha oda yako na wenzako Makadara.`;

        quickReplies = [
          { title: '1. Thibitisha (NDIYO)', payload: 'confirm_order_draft' },
          { title: '2. Badilisha Kiasi', payload: 'modify_order' },
          { title: '3. Futa', payload: 'cancel' }
        ];
      } else {
        replyText = nlu.clarificationMessage?.swahili || 'Tafadhali taja zao na kiasi unachotaka kesho.';
      }
      break;
    }

    case 'report_dispute': {
      session.currentStep = 'REPORTING_DISPUTE';
      const newDispute: DisputeTicket = {
        id: `disp-${Date.now().toString().slice(-4)}`,
        orderId: 'ord-today',
        clusterId: 'cluster-makadara-nyanya-01',
        vendorId: session.vendorId || 'vendor-unknown',
        vendorName: session.vendorName || 'Mama Mboga',
        vendorPhone: phone,
        produceName: 'Nyanya / Mboga',
        issueType: 'rotten_produce',
        description: text,
        claimedAmountKsh: 450,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      disputes.unshift(newDispute);

      replyText = `Pole sana ${session.vendorName}. Tumefungua tiketi rasmi ya tatizo (#${newDispute.id}).\n\nMhudumu wetu wa usimamizi (Ops Lead) wa Makadara anashughulikia sasa hivi. Utafidiwa au kurejeshewa pesa kwa M-PESA mara moja ikiwa kuna upungufu au mboga iliyooza.\n\nTuma picha au maelezo zaidi hapa ikiwa unayo.`;
      break;
    }

    case 'check_price': {
      const summaryList = produceCatalog
        .slice(0, 4)
        .map(p => `• ${p.swahiliName}: KSh ${p.benchmarkPriceKshPerKg}/kg (~KSh ${Math.round(p.benchmarkPriceKshPerKg * (p.supportedUnits[0]?.factorToKg || 60))} kwa ${p.supportedUnits[0]?.label})`)
        .join('\n');

      replyText = `Bei za Jumla za Makadara Leo (Direct Farm-Gate):\n${summaryList}\n\nUngependa kuweka oda ya kesho? Andika mfano: "Nataka magunia 2 ya nyanya"`;
      break;
    }

    case 'onboarding':
    case 'help':
    default: {
      replyText = `Karibu Soko Smart! Tunasaidia Mama Mboga wa Makadara kuunganisha maagizo ya mboga ili kununua kwa bei ya chini kabisa kutoka kwa vyama vya wakulima (cooperatives).\n\nUnaweza:\n1. Kuagiza mboga kwa kuandika au kutuma sauti: "Nataka magunia 3 za nyanya kesho"\n2. Kuangalia bei: "Niambie bei za leo"\n3. Kuripoti tatizo: "TATIZO"`;
      quickReplies = [
        { title: 'Agiza Nyanya (2 Magunia)', payload: 'order_nyanya_2' },
        { title: 'Agiza Sukuma Wiki', payload: 'order_sukuma' },
        { title: 'Angalia Bei za Leo', payload: 'check_prices' }
      ];
      break;
    }
  }

  // Record agent reply
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
    appName: 'Soko Smart',
    version: '1.0.0',
    geminiEnabled: Boolean(geminiApiKey),
    neighbourhood: 'Makadara, Nairobi',
    time: new Date().toISOString()
  });
});

// --- Meta WhatsApp Webhook ---
// Verification endpoint
app.get('/api/webhook/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'soko_smart_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('WhatsApp Webhook verified successfully.');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification token mismatch' });
  }
});

// WhatsApp incoming messages endpoint
app.post('/api/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    // Standard Meta Cloud API payload extraction
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
                incomingText = 'Nataka magunia mawili ya nyanya na gunia moja ya viazi kesho'; // Transcribed fallback
              }

              if (incomingText) {
                await processVendorMessage(`+${from}`, incomingText);
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
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// --- Chat Simulation Endpoint (Used by WhatsApp Phone Simulator) ---
app.post('/api/chat/message', async (req: Request, res: Response) => {
  try {
    const { phone, text } = req.body;
    if (!phone || !text) {
      return res.status(400).json({ error: 'phone and text are required' });
    }

    const result = await processVendorMessage(phone, text);
    res.json(result);
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Internal chat processing error' });
  }
});

app.get('/api/chat/session/:phone', (req: Request, res: Response) => {
  const phone = req.params.phone;
  const session = getOrCreateSession(phone);
  res.json(session);
});

// --- Direct NLU Parser API ---
app.post('/api/nlu/parse', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    const parsed = await parseVendorMessageWithAI(text);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'NLU parsing failed' });
  }
});

// --- Speech-to-Text / Audio Transcriber ---
app.post('/api/speech/transcribe', async (req: Request, res: Response) => {
  try {
    const { sampleId, audioBase64 } = req.body;

    // Preset audio sample transcripts in Swahili / Sheng
    const PRESET_AUDIO_TRANSCRIPTS: Record<string, { transcription: string; detectedLanguage: string; note: string }> = {
      sample_sarah_nyanya: {
        transcription: 'Niaje Soko Smart, nataka magunia tatu za nyanya na debe tano za viazi kesho asubuhi budget yangu ni 2400 per gunia.',
        detectedLanguage: 'sheng',
        note: 'Swahili/Sheng code-switching captured accurately with Kenyan market vocabulary.'
      },
      sample_wambui_sukuma: {
        transcription: 'Habari ya jioni. Kesho asubuhi nahitaji sukuma wiki kilo arobaini na vitunguu gunia moja ya kilo hamsini.',
        detectedLanguage: 'swahili',
        note: 'Pure Swahili dialect from Maringo market Mama Mboga.'
      },
      sample_achieng_tatizo: {
        transcription: 'Hallow Soko Smart, TATIZO. Gunia moja ya nyanya niliyopokea asubuhi imeharibika nusu kwa sababu ya joto.',
        detectedLanguage: 'swahili',
        note: 'Dispute alert with keyword TATIZO.'
      }
    };

    if (sampleId && PRESET_AUDIO_TRANSCRIPTS[sampleId]) {
      const selected = PRESET_AUDIO_TRANSCRIPTS[sampleId];
      const parsedNlu = await parseVendorMessageWithAI(selected.transcription);
      return res.json({
        ...selected,
        nlu: parsedNlu
      });
    }

    // Dynamic browser recording transcription via Gemini if audio provided
    if (audioBase64 && ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              text: 'Transcribe this East African voice note accurately. The speaker is speaking Swahili, Sheng, or English. Return only the transcription text.'
            },
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: audioBase64
              }
            }
          ]
        });
        const transcription = response.text?.trim() || 'Nataka magunia mawili ya nyanya kesho';
        const parsedNlu = await parseVendorMessageWithAI(transcription);
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

    // Default fallback voice note
    const fallbackText = 'Niaje Soko Smart, nipatie magunia mawili ya nyanya safi kesho asubuhi.';
    const parsedNlu = await parseVendorMessageWithAI(fallbackText);
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

// --- Demand Orders & Clustering ---
app.get('/api/demand/clusters', (_req: Request, res: Response) => {
  res.json({
    clusters,
    orders,
    cooperatives,
    vendors
  });
});

app.post('/api/demand/orders', (req: Request, res: Response) => {
  const { vendorId, produceId, rawQuantity, rawUnit, targetPricePerUnitKsh, ward } = req.body;

  const vendor = vendors.find(v => v.id === vendorId) || vendors[0];
  const produce = produceCatalog.find(p => p.id === produceId) || produceCatalog[0];

  const unitFactor = produce.supportedUnits.find(u => u.unit === rawUnit)?.factorToKg || 60;
  const normalizedQtyKg = rawQuantity * unitFactor;

  const newOrder: DemandOrder = {
    id: `ord-${Date.now().toString().slice(-4)}`,
    vendorId: vendor.id,
    vendorName: vendor.name,
    phone: vendor.phone,
    ward: ward || vendor.ward,
    produceId: produce.id,
    produceName: produce.name,
    rawQuantity: Number(rawQuantity),
    rawUnit: rawUnit || 'gunia',
    normalizedQtyKg,
    targetPricePerUnitKsh: Number(targetPricePerUnitKsh) || produce.benchmarkPriceKshPerKg * unitFactor,
    deliveryDate: '2026-09-28',
    createdAt: new Date().toISOString(),
    status: 'open'
  };

  orders.unshift(newOrder);

  // Re-cluster for this produce
  let matchedCluster = clusters.find(c => c.produceId === produce.id && c.status === 'open');
  if (!matchedCluster) {
    matchedCluster = {
      id: `cluster-makadara-${produce.id}-${Date.now().toString().slice(-4)}`,
      neighbourhood: 'Makadara Corridor (Hamza, Maringo, Viwandani)',
      produceId: produce.id,
      produceName: produce.name,
      totalQuantityKg: 0,
      unitSummary: '',
      vendorCount: 0,
      orderIds: [],
      vendorBreakdown: [],
      moqKg: produce.moqKg,
      moqMet: false,
      benchmarkPricePerKg: produce.benchmarkPriceKshPerKg,
      targetPriceCeilingPerKg: produce.guardrailMaxKshPerKg,
      status: 'open',
      cutoffTime: '18:00 EAT Today',
      deliveryDate: '2026-09-28'
    };
    clusters.unshift(matchedCluster);
  }

  newOrder.clusterId = matchedCluster.id;
  matchedCluster.orderIds.push(newOrder.id);
  matchedCluster.vendorCount += 1;
  matchedCluster.totalQuantityKg += normalizedQtyKg;
  matchedCluster.moqMet = matchedCluster.totalQuantityKg >= matchedCluster.moqKg;
  matchedCluster.unitSummary = `${Math.round(matchedCluster.totalQuantityKg / unitFactor)} ${rawUnit} (~${matchedCluster.totalQuantityKg} kg)`;

  matchedCluster.vendorBreakdown.push({
    vendorId: vendor.id,
    vendorName: vendor.name,
    phone: vendor.phone,
    quantityKg: normalizedQtyKg,
    rawDisplay: `${rawQuantity} ${rawUnit}`,
    allocatedAmountKsh: Math.round(normalizedQtyKg * produce.benchmarkPriceKshPerKg)
  });

  res.status(201).json({
    order: newOrder,
    cluster: matchedCluster
  });
});

// Force lock cluster and advance to negotiation
app.post('/api/demand/clusters/:id/lock', (req: Request, res: Response) => {
  const cluster = clusters.find(c => c.id === req.params.id);
  if (!cluster) {
    return res.status(404).json({ error: 'Cluster not found' });
  }

  cluster.status = 'negotiating';

  // Assign best matching cooperative
  const matchedCoop = cooperatives.find(co => co.availableProduce.includes(cluster.produceId)) || cooperatives[0];
  cluster.cooperativeId = matchedCoop.id;
  cluster.cooperativeName = matchedCoop.name;

  // Initialize negotiation session if not present
  if (!negotiationSessions[cluster.id]) {
    const produce = produceCatalog.find(p => p.id === cluster.produceId) || produceCatalog[0];
    const initialAsk = Math.round(produce.benchmarkPriceKshPerKg * 1.08);
    const initialCounter = produce.benchmarkPriceKshPerKg;

    negotiationSessions[cluster.id] = {
      id: `neg-${cluster.id}`,
      clusterId: cluster.id,
      cooperativeId: matchedCoop.id,
      cooperativeName: matchedCoop.name,
      produceName: cluster.produceName,
      totalKg: cluster.totalQuantityKg,
      status: 'in_progress',
      guardrails: {
        minPricePerKg: produce.guardrailMinKshPerKg,
        maxPricePerKg: produce.guardrailMaxKshPerKg,
        requiredDeliveryDate: cluster.deliveryDate,
        paymentSplit: '50% on agreement, 50% upon delivery inspection'
      },
      initialAskPricePerKg: initialAsk,
      currentCounterPricePerKg: initialCounter,
      transcript: [
        {
          id: `nm-${Date.now()}-1`,
          sender: 'agent',
          senderName: 'Soko Smart Coordinator',
          message: `Habari ${matchedCoop.name}. Muungano wa Mama Mboga Makadara una oda ya pamoja ya kilo ${cluster.totalQuantityKg} za ${cluster.produceName}. Tunalipa 50% escrow mara moja na kupokea asubuhi 06:30 AM. Bei yetu ya ununuzi ni KSh ${initialCounter} kwa kilo.`,
          priceOfferPerKg: initialCounter,
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  res.json({ cluster, negotiation: negotiationSessions[cluster.id] });
});

// --- Cooperative Negotiation Engine ---
app.get('/api/negotiation/:clusterId', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }
  res.json(session);
});

app.post('/api/negotiation/:clusterId/coop-reply', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  const { proposedPricePerKg, message } = req.body;
  const offeredPrice = Number(proposedPricePerKg);

  // Log coop message
  session.transcript.push({
    id: `nm-${Date.now()}`,
    sender: 'cooperative',
    senderName: session.cooperativeName,
    message: message || `Bei yetu ni KSh ${offeredPrice}/kg kwa sababu ya gharama za mafuta na usafiri.`,
    priceOfferPerKg: offeredPrice,
    timestamp: new Date().toISOString()
  });

  // Check platform guardrails!
  if (offeredPrice > session.guardrails.maxPricePerKg) {
    // VIOLATION: Exceeds platform ceiling -> Escalate to Human Ops!
    session.status = 'escalated_to_ops';
    session.escalationReason = `Bei iliyoombwa na mkulima (KSh ${offeredPrice}/kg) imevuka kikomo cha juu cha jukwaa (KSh ${session.guardrails.maxPricePerKg}/kg). Inahitaji idhini ya afisa wa ununuzi.`;

    session.transcript.push({
      id: `nm-${Date.now()}-esc`,
      sender: 'agent',
      senderName: 'Soko Smart Safety Guardrail',
      message: `[KIKOMO KIMEKIUKWA] Bei ya KSh ${offeredPrice}/kg inazidi kiwango cha juu (KSh ${session.guardrails.maxPricePerKg}/kg). Mazungumzo yamesitishwa kwa ukaguzi wa Afisa wa Ununuzi (Human-in-the-Loop).`,
      timestamp: new Date().toISOString(),
      isEscalationTrigger: true
    });

    return res.json({ session, escalated: true });
  }

  // If within guardrails: Agent accepts or makes tight counter-offer
  if (offeredPrice <= session.currentCounterPricePerKg + 1) {
    session.status = 'agreed';
    session.agreedPricePerKg = offeredPrice;

    session.transcript.push({
      id: `nm-${Date.now()}-agree`,
      sender: 'agent',
      senderName: 'Soko Smart AI Agent',
      message: `Tumekubaliana kwa KSh ${offeredPrice}/kg! Tunatayarisha Mkataba wa Kielektroniki (Micro-Agreement) na kutuma kwa pande zote mbili mara moja.`,
      priceOfferPerKg: offeredPrice,
      timestamp: new Date().toISOString()
    });

    // Update cluster
    const cluster = clusters.find(c => c.id === session.clusterId);
    if (cluster) {
      cluster.status = 'agreement_drafted';
      cluster.negotiatedPricePerKg = offeredPrice;
    }
  } else {
    // Counter-offer halfway between agent target and coop offer
    const counter = Math.min(session.guardrails.maxPricePerKg, Math.round((session.currentCounterPricePerKg + offeredPrice) / 2));
    session.currentCounterPricePerKg = counter;

    session.transcript.push({
      id: `nm-${Date.now()}-counter`,
      sender: 'agent',
      senderName: 'Soko Smart AI Agent',
      message: `Tunaelewa gharama za usafiri, lakini wamama wananunua kiasi kikubwa cha kilo ${session.totalKg}. Tunaweza kufanya KSh ${counter}/kg ikiwa mtashusha kabla ya 06:30 AM. Je, hii inafaa?`,
      priceOfferPerKg: counter,
      timestamp: new Date().toISOString()
    });
  }

  res.json({ session, escalated: false });
});

// Human-in-the-loop override endpoint
app.post('/api/negotiation/:clusterId/human-override', (req: Request, res: Response) => {
  const session = negotiationSessions[req.params.clusterId];
  if (!session) {
    return res.status(404).json({ error: 'Negotiation session not found' });
  }

  const { action, approvedPricePerKg, notes } = req.body;
  if (action === 'approve') {
    const finalPrice = Number(approvedPricePerKg) || session.guardrails.maxPricePerKg;
    session.status = 'agreed';
    session.agreedPricePerKg = finalPrice;
    session.opsApproved = true;

    session.transcript.push({
      id: `nm-${Date.now()}-ops`,
      sender: 'human_ops',
      senderName: 'Human Operations Lead (Makadara)',
      message: `[IDHINI YA BINADAMU / OPS OVERRIDE]: Bei ya KSh ${finalPrice}/kg imeidhinishwa. Maelezo: ${notes || 'Kupanda kwa bei kote Nairobi kutokana na mvua.'}`,
      priceOfferPerKg: finalPrice,
      timestamp: new Date().toISOString()
    });

    const cluster = clusters.find(c => c.id === session.clusterId);
    if (cluster) {
      cluster.status = 'agreement_drafted';
      cluster.negotiatedPricePerKg = finalPrice;
    }
  } else {
    session.status = 'rejected';
    session.transcript.push({
      id: `nm-${Date.now()}-ops-rej`,
      sender: 'human_ops',
      senderName: 'Human Operations Lead (Makadara)',
      message: `[IMEKATALIWA]: Ofa ya mkulima imekataliwa. Tunahamisha oda kwa chama mbadala cha wakulima.`,
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

  const coop = cooperatives.find(co => co.id === cluster.cooperativeId) || cooperatives[0];
  const agreedPrice = cluster.negotiatedPricePerKg || cluster.benchmarkPricePerKg;
  const totalValue = cluster.totalQuantityKg * agreedPrice;
  const contractNum = `SS-MKD-${Date.now().toString().slice(-6)}`;

  const swahiliAgreement = `MAKUBALIANO YA KIPINDI YA UTOAJI MAZAO (SOKO SMART)
Nambari ya Mkataba: ${contractNum}
Tarehe: ${new Date().toLocaleDateString('en-GB')}

Pande Zinazohusika:
1. Chama cha Wakulima: ${coop.name} (${coop.phone})
2. Muungano wa Mama Mboga Makadara (Wafanyabiashara ${cluster.vendorCount})

Maelezo ya Agizo:
- Zao: ${cluster.produceName}
- Jumla ya Uzani: Kilo ${cluster.totalQuantityKg.toLocaleString()} (${cluster.unitSummary})
- Bei Iliyokubaliwa: KSh ${agreedPrice} kwa kila kilo
- Thamani Kamili: KSh ${totalValue.toLocaleString()}

Muda na Mahali pa Kuwasilisha:
- Tarehe ya Kufikishwa: ${cluster.deliveryDate} kabla ya saa 12:30 Asubuhi (06:30 AM EAT)
- Eneo la Kushusha: Makadara Central Produce Dropoff Shed (Hamza Market, Jogoo Road)

Masharti ya Malipo na Ukaguzi:
- Asilimia 50 (KSh ${(totalValue * 0.5).toLocaleString()}) inalipwa na kuzuiliwa kwenye akaunti ya Soko Smart Escrow kupitia M-PESA.
- Asilimia 50 inayobaki inatolewa kwa mkulima mara moja baada ya wawakilishi wa Mama Mboga kukagua uzani na ubora.
- Ikitokea upungufu wa uzani au mboga kuharibika njiani, Mama Mboga anatuma "TATIZO" na picha kabla ya saa 2:30 Asubuhi kwa fidia au marejesho.

Uthibitisho:
Mkulima na kila Mama Mboga anathibitisha kwa kutuma neno "NDIYO" au "YES" kwenye WhatsApp ya Soko Smart.`;

  const englishAgreement = `SOKO SMART MICRO-DELIVERY PRODUCE AGREEMENT
Agreement Reference: ${contractNum}
Date of Issuance: ${new Date().toLocaleDateString('en-GB')}

Parties:
1. Supplier Cooperative: ${coop.name} (${coop.phone})
2. Buyer Cluster: Makadara Mama Mboga Pool (${cluster.vendorCount} Vendors)

Order Specification:
- Produce: ${cluster.produceName} (Standard Grade A)
- Total Pooled Volume: ${cluster.totalQuantityKg.toLocaleString()} kg (${cluster.unitSummary})
- Agreed Farm-Gate Bulk Price: KSh ${agreedPrice}.00 per kg
- Total Agreement Consideration: KSh ${totalValue.toLocaleString()}.00

Logistics & Delivery Schedule:
- Delivery Window: ${cluster.deliveryDate}, strictly before 06:30 AM EAT
- Drop-off Staging Hub: Makadara Central Produce Dropoff Shed (Adjacent Hamza Market, Jogoo Road)

Settlement & Inspection Terms:
- 50% mobilization advance (KSh ${(totalValue * 0.5).toLocaleString()}.00) held securely in Soko Smart Escrow via individual vendor M-PESA STK pushes.
- 50% balance released instantly to the cooperative via Daraja B2B upon physical delivery inspection and scale sign-off.
- In event of spoilage or weight variance exceeding 3%, vendor alerts via "TATIZO" within 2 hours of delivery for automated proportional refund.

Consent:
Confirmed digitally via WhatsApp reply "NDIYO" / "YES" by both cooperative dispatch and pool members.`;

  const vendorConfirmations: Record<string, { confirmed: boolean; channel: 'whatsapp' | 'sms' }> = {};
  cluster.vendorBreakdown.forEach(vb => {
    vendorConfirmations[vb.vendorId] = { confirmed: false, channel: 'whatsapp' };
  });

  const newAgreement: MicroAgreement = {
    id: `AGR-${contractNum}`,
    contractNumber: contractNum,
    clusterId: cluster.id,
    cooperativeId: coop.id,
    cooperativeName: coop.name,
    cooperativePhone: coop.phone,
    produceName: cluster.produceName,
    totalQuantityKg: cluster.totalQuantityKg,
    pricePerKgKsh: agreedPrice,
    totalContractValueKsh: totalValue,
    deliveryDate: `${cluster.deliveryDate} kabla ya 06:30 AM EAT`,
    deliveryLocation: 'Makadara Central Produce Dropoff Shed (Hamza Market, Jogoo Road)',
    qualityTerms: 'Bidhaa safi ya shamba ya Daraja A (Firm, Grade A, unblemished, weight verified on calibrated digital scales).',
    paymentTerms: '50% STK Push deposit to Escrow, 50% Daraja B2B payment on delivery signoff.',
    disputePolicy: 'Tuma neno "TATIZO" ndani ya saa 2 kurejeshewa pesa au kuletewa mbadala mara moja.',
    swahiliText: swahiliAgreement,
    englishText: englishAgreement,
    status: 'pending_confirmation',
    vendorConfirmations,
    coopConfirmed: true,
    coopConfirmedTimestamp: new Date().toISOString(),
    digitalVerificationHash: `sha256-${Date.now().toString(16)}-mkd`,
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

app.get('/api/agreements/:id', (req: Request, res: Response) => {
  const agreement = agreements.find(a => a.id === req.params.id);
  if (!agreement) {
    return res.status(404).json({ error: 'Agreement not found' });
  }
  res.json(agreement);
});

// One-tap / one-word agreement confirmation endpoint
app.post('/api/agreements/:id/confirm', (req: Request, res: Response) => {
  const agreement = agreements.find(a => a.id === req.params.id);
  if (!agreement) {
    return res.status(404).json({ error: 'Agreement not found' });
  }

  const { vendorId, role } = req.body;

  if (role === 'cooperative') {
    agreement.coopConfirmed = true;
    agreement.coopConfirmedTimestamp = new Date().toISOString();
  } else if (vendorId) {
    agreement.vendorConfirmations[vendorId] = {
      confirmed: true,
      timestamp: new Date().toISOString(),
      channel: 'whatsapp'
    };
  }

  const allVendorsConfirmed = Object.values(agreement.vendorConfirmations).every(v => v.confirmed);
  if (allVendorsConfirmed && agreement.coopConfirmed) {
    agreement.status = 'confirmed_by_all';

    // Update cluster status
    const cluster = clusters.find(c => c.id === agreement.clusterId);
    if (cluster) {
      cluster.status = 'stk_sent';
    }
  }

  res.json(agreement);
});

// --- M-PESA Daraja Integration & Double-Entry Ledger ---

// STK Push Dispatcher
app.post('/api/mpesa/stkpush', async (req: Request, res: Response) => {
  try {
    const { vendorId, phone, amountKsh, purpose, agreementId } = req.body;
    const cleanPhone = (phone || '254712345678').replace('+', '');
    const amount = Number(amountKsh) || 1000;
    const checkoutReqId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newTx: MpesaTransaction = {
      id: `tx-${Date.now().toString().slice(-5)}`,
      checkoutRequestId: checkoutReqId,
      merchantRequestId: `MR-${Date.now().toString().slice(-6)}`,
      vendorId,
      vendorPhone: cleanPhone,
      amount,
      purpose: purpose || 'vendor_pool_collection',
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
      promptText: `Do you want to pay KSh ${amount.toLocaleString()} to SOKO SMART TILL 174379 for Makadara Produce Pool? Enter M-PESA PIN:`
    });
  } catch (error) {
    res.status(500).json({ error: 'STK Push failed to dispatch' });
  }
});

// STK Push PIN Simulation & Webhook Execution
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

  // Simulate PIN verification
  if (pin && pin.length >= 4) {
    tx.status = 'completed';
    tx.resultCode = 0;
    tx.resultDesc = 'The service request is processed successfully.';
    tx.mpesaReceiptNumber = `QKD${Date.now().toString().slice(-6)}NY`;

    // Add to double-entry ledger!
    const newLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'MAMA_MBOGA_COLLECTION',
      debitAccount: 'MPESA_SETTLEMENT_SUSPENSE',
      creditAccount: 'ESCROW_MAKADARA_NYANYA_01',
      amountKsh: tx.amount,
      referenceId: tx.mpesaReceiptNumber,
      description: `M-PESA STK Push received from ${tx.vendorPhone} for agreement #${tx.referenceAgreementId || 'SS-MKD'}`
    };
    ledger.unshift(newLedgerEntry);

    // Also record platform commission (2.5%)
    const commission = Math.round(tx.amount * 0.025);
    ledger.unshift({
      id: `ledg-comm-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'COMMISSION_FEE',
      debitAccount: 'ESCROW_MAKADARA_NYANYA_01',
      creditAccount: 'SOKO_SMART_REVENUE',
      amountKsh: commission,
      referenceId: `FEE-${tx.mpesaReceiptNumber}`,
      description: `Platform 2.5% coordination fee for order ${tx.referenceAgreementId || ''}`
    });

    return res.json({ success: true, tx, ledgerEntry: newLedgerEntry });
  }

  res.status(400).json({ error: 'Invalid PIN provided' });
});

// Daraja Webhook Callback Receiver
app.post('/api/mpesa/callback', (req: Request, res: Response) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (callbackData) {
      const checkoutReqId = callbackData.CheckoutRequestID;
      const resultCode = callbackData.ResultCode;
      const resultDesc = callbackData.ResultDesc;

      const tx = mpesaTransactions.find(t => t.checkoutRequestId === checkoutReqId);
      if (tx) {
        tx.resultCode = resultCode;
        tx.resultDesc = resultDesc;
        if (resultCode === 0) {
          tx.status = 'completed';
          const items = callbackData.CallbackMetadata?.Item || [];
          const receiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber');
          if (receiptItem) {
            tx.mpesaReceiptNumber = receiptItem.Value;
          }
        } else {
          tx.status = 'failed';
        }
      }
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Callback processing error' });
  }
});

// Ledger endpoint
app.get('/api/ledger', (_req: Request, res: Response) => {
  const totalCollections = ledger
    .filter(l => l.transactionType === 'MAMA_MBOGA_COLLECTION')
    .reduce((sum, l) => sum + l.amountKsh, 0);

  const totalPayouts = ledger
    .filter(l => l.transactionType === 'COOPERATIVE_PAYOUT')
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

// Release Co-op Payout from Ops console
app.post('/api/ledger/payout-coop', (req: Request, res: Response) => {
  const { cooperativeId, amountKsh, agreementId } = req.body;
  const coop = cooperatives.find(c => c.id === cooperativeId) || cooperatives[0];
  const amount = Number(amountKsh) || 10000;

  const payoutReceipt = `B2B${Date.now().toString().slice(-6)}`;
  const newLedgerEntry: LedgerEntry = {
    id: `ledg-pay-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    transactionType: 'COOPERATIVE_PAYOUT',
    debitAccount: 'ESCROW_MAKADARA_NYANYA_01',
    creditAccount: `COOP_SETTLEMENT_${coop.mpesaPaybill}`,
    amountKsh: amount,
    referenceId: payoutReceipt,
    description: `Daraja B2B Paybill payment released to ${coop.name} (Paybill ${coop.mpesaPaybill}) for contract #${agreementId || 'SS-MKD'}`
  };

  ledger.unshift(newLedgerEntry);

  mpesaTransactions.unshift({
    id: `tx-payout-${Date.now().toString().slice(-4)}`,
    checkoutRequestId: `B2B_REQ_${Date.now()}`,
    merchantRequestId: `MR_PAY_${Date.now()}`,
    vendorPhone: coop.phone,
    amount,
    purpose: 'coop_final_payout',
    status: 'completed',
    mpesaReceiptNumber: payoutReceipt,
    resultCode: 0,
    resultDesc: 'B2B Paybill disbursement settled',
    timestamp: new Date().toISOString(),
    referenceAgreementId: agreementId
  });

  res.json({ success: true, ledgerEntry: newLedgerEntry });
});

// --- Disputes Desk ---
app.get('/api/disputes', (_req: Request, res: Response) => {
  res.json(disputes);
});

app.post('/api/disputes', (req: Request, res: Response) => {
  const { vendorId, description, produceName, claimedAmountKsh, issueType } = req.body;
  const vendor = vendors.find(v => v.id === vendorId) || vendors[0];

  const newDispute: DisputeTicket = {
    id: `disp-${Date.now().toString().slice(-4)}`,
    orderId: 'ord-today',
    clusterId: 'cluster-makadara-nyanya-01',
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorPhone: vendor.phone,
    produceName: produceName || 'Nyanya',
    issueType: issueType || 'rotten_produce',
    description: description || 'Mboga ilikuwa imeoza au uzani ulikuwa pungufu.',
    claimedAmountKsh: Number(claimedAmountKsh) || 350,
    status: 'open',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  };

  disputes.unshift(newDispute);
  res.status(201).json(newDispute);
});

app.post('/api/disputes/:id/resolve', (req: Request, res: Response) => {
  const dispute = disputes.find(d => d.id === req.params.id);
  if (!dispute) {
    return res.status(404).json({ error: 'Dispute not found' });
  }

  const { action, resolutionNotes, refundAmountKsh } = req.body;
  dispute.status = action === 'refund' ? 'approved_refund' : action === 'replace' ? 'replacement_issued' : 'rejected';
  dispute.resolutionNotes = resolutionNotes || 'Imeidhinishwa na Msimamizi wa Ops wa Makadara.';

  if (action === 'refund') {
    const refundAmount = Number(refundAmountKsh) || dispute.claimedAmountKsh;
    // Issue refund ledger transaction
    ledger.unshift({
      id: `ledg-ref-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      transactionType: 'DISPUTE_REFUND',
      debitAccount: 'ESCROW_MAKADARA_NYANYA_01',
      creditAccount: `VENDOR_${dispute.vendorPhone}`,
      amountKsh: refundAmount,
      referenceId: `REF-${dispute.id}`,
      description: `M-PESA B2C Refund sent to ${dispute.vendorName} for verified dispute #${dispute.id}`
    });
  }

  res.json(dispute);
});

// --- Produce Ontology & Guardrails Config ---
app.get('/api/ontology', (_req: Request, res: Response) => {
  res.json(produceCatalog);
});

app.put('/api/ontology/:id', (req: Request, res: Response) => {
  const itemIndex = produceCatalog.findIndex(p => p.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Produce item not found' });
  }

  produceCatalog[itemIndex] = {
    ...produceCatalog[itemIndex],
    ...req.body
  };

  res.json(produceCatalog[itemIndex]);
});

// --- Reputation Scores ---
app.get('/api/reputation', (_req: Request, res: Response) => {
  res.json({
    vendors: vendors.map(v => ({
      id: v.id,
      name: v.name,
      ward: v.ward,
      phone: v.phone,
      ...v.reputationScore
    })),
    cooperatives: cooperatives.map(c => ({
      id: c.id,
      name: c.name,
      region: c.region,
      rating: c.rating,
      minLotSizeKg: c.minLotSizeKg
    }))
  });
});

// ==========================================
// 4. FRONTEND SERVING (Vite Dev / Dist Prod)
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` Soko Smart Engine Running on http://0.0.0.0:${PORT}`);
    console.log(` Target Corridor: Makadara, Nairobi (Hamza, Maringo, Viwandani)`);
    console.log(` Gemini API: ${geminiApiKey ? 'CONNECTED (@google/genai)' : 'STANDBY (Using Rule-based NLU)'}`);
    console.log(` WhatsApp Webhook: POST /api/webhook/whatsapp`);
    console.log(` Daraja M-PESA STK: Active in Sandbox Mode`);
    console.log(`======================================================\n`);
  });
}

startServer();
