import {
  ProduceItem,
  MamaMbogaVendor,
  CooperativeSupplier,
  DemandOrder,
  DemandCluster,
  MicroAgreement,
  LedgerEntry,
  DisputeTicket
} from '../types';

export const INITIAL_PRODUCE_CATALOG: ProduceItem[] = [
  {
    id: 'prod-nyanya',
    name: 'Tomatoes',
    swahiliName: 'Nyanya',
    synonyms: ['nyanya', 'tomato', 'tomatoes', 'machungwa ya mboga', 'pomodoro'],
    category: 'fruits_tomatoes',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (Crate/Bag)', factorToKg: 60, description: 'Standard 60kg wooden crate/bag' },
      { unit: 'tenga', label: 'Tenga (Large Crate)', factorToKg: 75, description: 'Large farm crate (75kg)' },
      { unit: 'debe', label: 'Debe (Bucket/Tin)', factorToKg: 15, description: 'Approx 15kg tin' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: 'Exact 1kg weight' }
    ],
    moqKg: 600, // 10 magunia
    benchmarkPriceKshPerKg: 42,
    guardrailMinKshPerKg: 35,
    guardrailMaxKshPerKg: 48,
    typicalShelfLifeDays: 5
  },
  {
    id: 'prod-sukuma',
    name: 'Collard Greens (Sukuma Wiki)',
    swahiliName: 'Sukuma Wiki',
    synonyms: ['sukuma', 'sukuma wiki', 'kales', 'collard greens', 'mboga ya wiki'],
    category: 'leafy_greens',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (Sack)', factorToKg: 70, description: 'Ventilated 70kg burlap sack' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: 'Exact 1kg bundle' },
      { unit: 'fungu', label: 'Fungu (Batch)', factorToKg: 2, description: 'Wholesale tied batch (~2kg)' }
    ],
    moqKg: 350, // 5 magunia
    benchmarkPriceKshPerKg: 22,
    guardrailMinKshPerKg: 18,
    guardrailMaxKshPerKg: 28,
    typicalShelfLifeDays: 3
  },
  {
    id: 'prod-vitunguu',
    name: 'Red Onions',
    swahiliName: 'Vitunguu Maji',
    synonyms: ['vitunguu', 'vitunguu maji', 'onions', 'red onions', 'tunguu'],
    category: 'onions_garlic',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (Net Bag)', factorToKg: 50, description: 'Standard 50kg mesh net bag' },
      { unit: 'net', label: 'Net (Small)', factorToKg: 10, description: '10kg market net' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: 'Exact 1kg' }
    ],
    moqKg: 400, // 8 magunia
    benchmarkPriceKshPerKg: 55,
    guardrailMinKshPerKg: 48,
    guardrailMaxKshPerKg: 64,
    typicalShelfLifeDays: 21
  },
  {
    id: 'prod-viazi',
    name: 'Potatoes (Irish)',
    swahiliName: 'Viazi / Waru',
    synonyms: ['viazi', 'waru', 'potatoes', 'irish potatoes', 'viazi mviringo', 'mbatata'],
    category: 'root_vegetables',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (Bag)', factorToKg: 90, description: 'Extended 90kg farm bag' },
      { unit: 'debe', label: 'Debe', factorToKg: 16, description: 'Standard 16kg metal/plastic tin' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: 'Exact 1kg weight' }
    ],
    moqKg: 900, // 10 magunia
    benchmarkPriceKshPerKg: 36,
    guardrailMinKshPerKg: 30,
    guardrailMaxKshPerKg: 44,
    typicalShelfLifeDays: 30
  },
  {
    id: 'prod-managu',
    name: 'African Nightshade (Managu)',
    swahiliName: 'Managu',
    synonyms: ['managu', 'sucha', 'mboga ya kienyeji', 'osuga', 'nightshade'],
    category: 'leafy_greens',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (Net Sack)', factorToKg: 40, description: 'Breathable 40kg sack' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: 'Clean leafy 1kg' }
    ],
    moqKg: 200,
    benchmarkPriceKshPerKg: 48,
    guardrailMinKshPerKg: 40,
    guardrailMaxKshPerKg: 58,
    typicalShelfLifeDays: 2
  },
  {
    id: 'prod-kunde',
    name: 'Cowpea Leaves (Kunde)',
    swahiliName: 'Kunde',
    synonyms: ['kunde', 'cowpea leaves', 'likhubi'],
    category: 'leafy_greens',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia', factorToKg: 45, description: 'Standard 45kg bag' },
      { unit: 'kilo', label: 'Kilogram', factorToKg: 1, description: '1kg bundle' }
    ],
    moqKg: 180,
    benchmarkPriceKshPerKg: 38,
    guardrailMinKshPerKg: 32,
    guardrailMaxKshPerKg: 46,
    typicalShelfLifeDays: 3
  }
];

export const INITIAL_VENDORS: MamaMbogaVendor[] = [
  {
    id: 'vendor-sarah',
    name: 'Mama Sarah Wanjiku',
    phone: '+254712345678',
    ward: 'Makadara - Hamza',
    stallLocation: 'Hamza Market Shed 14B, Jogoo Road',
    preferredLanguage: 'sheng',
    reputationScore: {
      fulfillmentRate: 98,
      onTimeRate: 96,
      disputeRate: 2,
      totalOrders: 42,
      rating: 4.9
    },
    mpesaNumber: '254712345678',
    onboarded: true
  },
  {
    id: 'vendor-wambui',
    name: 'Mama Wambui Kamau',
    phone: '+254722987654',
    ward: 'Makadara - Maringo',
    stallLocation: 'Maringo Bus Stage Stall 3',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 95,
      onTimeRate: 92,
      disputeRate: 4,
      totalOrders: 36,
      rating: 4.8
    },
    mpesaNumber: '254722987654',
    onboarded: true
  },
  {
    id: 'vendor-achieng',
    name: 'Mama Achieng Otieno',
    phone: '+254733456789',
    ward: 'Makadara - Viwandani',
    stallLocation: 'Viwandani Bridge Kiosk A7',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 92,
      onTimeRate: 90,
      disputeRate: 5,
      totalOrders: 28,
      rating: 4.7
    },
    mpesaNumber: '254733456789',
    onboarded: true
  },
  {
    id: 'vendor-jane',
    name: 'Mama Jane Mwangi',
    phone: '+254799112233',
    ward: 'Makadara - Harambee',
    stallLocation: 'Harambee Junction Open Table',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 94,
      onTimeRate: 95,
      disputeRate: 3,
      totalOrders: 19,
      rating: 4.75
    },
    mpesaNumber: '254799112233',
    onboarded: true
  }
];

export const INITIAL_COOPERATIVES: CooperativeSupplier[] = [
  {
    id: 'coop-kinangop',
    name: 'Kinangop Highland Farmers Co-op',
    region: 'Kinangop, Nyandarua County',
    contactPerson: 'David Kiarie (Chairperson)',
    phone: '+254720112233',
    mpesaPaybill: '654321',
    rating: 4.9,
    minLotSizeKg: 500,
    availableProduce: ['prod-viazi', 'prod-sukuma'],
    priceList: {
      'prod-viazi': { pricePerKg: 34, availableQtyKg: 4500, grade: 'Grade 1 Shangi' },
      'prod-sukuma': { pricePerKg: 20, availableQtyKg: 2200, grade: 'Fresh Field Grade A' }
    }
  },
  {
    id: 'coop-naivasha',
    name: 'Naivasha Horticultural Producers',
    region: 'South Lake, Naivasha, Nakuru County',
    contactPerson: 'Grace Chemutai (Sales Lead)',
    phone: '+254721445566',
    mpesaPaybill: '789123',
    rating: 4.85,
    minLotSizeKg: 400,
    availableProduce: ['prod-nyanya', 'prod-vitunguu'],
    priceList: {
      'prod-nyanya': { pricePerKg: 39, availableQtyKg: 3800, grade: 'Anna F1 Greenhouse Firm' },
      'prod-vitunguu': { pricePerKg: 51, availableQtyKg: 3200, grade: 'Red Creole Medium' }
    }
  },
  {
    id: 'coop-limuru',
    name: 'Limuru Greens Smallholder Alliance',
    region: 'Tigoni / Limuru, Kiambu County',
    contactPerson: 'Peter Njoroge (Dispatch Manager)',
    phone: '+254722778899',
    mpesaPaybill: '890456',
    rating: 4.75,
    minLotSizeKg: 250,
    availableProduce: ['prod-sukuma', 'prod-managu', 'prod-kunde'],
    priceList: {
      'prod-sukuma': { pricePerKg: 21, availableQtyKg: 1800, grade: 'Organic Tender Grade A' },
      'prod-managu': { pricePerKg: 44, availableQtyKg: 950, grade: 'Fresh Picked Mornings' },
      'prod-kunde': { pricePerKg: 35, availableQtyKg: 800, grade: 'Crisp Grade 1' }
    }
  }
];

export const INITIAL_ORDERS: DemandOrder[] = [
  {
    id: 'ord-101',
    vendorId: 'vendor-sarah',
    vendorName: 'Mama Sarah Wanjiku',
    phone: '+254712345678',
    ward: 'Makadara - Hamza',
    produceId: 'prod-nyanya',
    produceName: 'Nyanya',
    rawQuantity: 3,
    rawUnit: 'gunia',
    normalizedQtyKg: 180,
    targetPricePerUnitKsh: 2400,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T06:15:00Z',
    status: 'clustered',
    clusterId: 'cluster-makadara-nyanya-01',
    notes: 'Free-text voice note: "Niaje Soko Smart, nataka magunia tatu za nyanya kesho morning."'
  },
  {
    id: 'ord-102',
    vendorId: 'vendor-wambui',
    vendorName: 'Mama Wambui Kamau',
    phone: '+254722987654',
    ward: 'Makadara - Maringo',
    produceId: 'prod-nyanya',
    produceName: 'Nyanya',
    rawQuantity: 4,
    rawUnit: 'gunia',
    normalizedQtyKg: 240,
    targetPricePerUnitKsh: 2450,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T06:30:00Z',
    status: 'clustered',
    clusterId: 'cluster-makadara-nyanya-01'
  },
  {
    id: 'ord-103',
    vendorId: 'vendor-achieng',
    vendorName: 'Mama Achieng Otieno',
    phone: '+254733456789',
    ward: 'Makadara - Viwandani',
    produceId: 'prod-nyanya',
    produceName: 'Nyanya',
    rawQuantity: 3,
    rawUnit: 'gunia',
    normalizedQtyKg: 180,
    targetPricePerUnitKsh: 2400,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T06:45:00Z',
    status: 'clustered',
    clusterId: 'cluster-makadara-nyanya-01'
  },
  {
    id: 'ord-104',
    vendorId: 'vendor-jane',
    vendorName: 'Mama Jane Mwangi',
    phone: '+254799112233',
    ward: 'Makadara - Harambee',
    produceId: 'prod-sukuma',
    produceName: 'Sukuma Wiki',
    rawQuantity: 5,
    rawUnit: 'gunia',
    normalizedQtyKg: 350,
    targetPricePerUnitKsh: 1450,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T07:10:00Z',
    status: 'clustered',
    clusterId: 'cluster-makadara-sukuma-01'
  }
];

export const INITIAL_CLUSTERS: DemandCluster[] = [
  {
    id: 'cluster-makadara-nyanya-01',
    neighbourhood: 'Makadara (Hamza, Maringo, Viwandani)',
    produceId: 'prod-nyanya',
    produceName: 'Tomatoes (Nyanya)',
    totalQuantityKg: 600,
    unitSummary: '10 magunia (600 kg)',
    vendorCount: 3,
    orderIds: ['ord-101', 'ord-102', 'ord-103'],
    vendorBreakdown: [
      {
        vendorId: 'vendor-sarah',
        vendorName: 'Mama Sarah Wanjiku',
        phone: '+254712345678',
        quantityKg: 180,
        rawDisplay: '3 magunia',
        allocatedAmountKsh: 7020
      },
      {
        vendorId: 'vendor-wambui',
        vendorName: 'Mama Wambui Kamau',
        phone: '+254722987654',
        quantityKg: 240,
        rawDisplay: '4 magunia',
        allocatedAmountKsh: 9360
      },
      {
        vendorId: 'vendor-achieng',
        vendorName: 'Mama Achieng Otieno',
        phone: '+254733456789',
        quantityKg: 180,
        rawDisplay: '3 magunia',
        allocatedAmountKsh: 7020
      }
    ],
    moqKg: 600,
    moqMet: true,
    benchmarkPricePerKg: 42,
    targetPriceCeilingPerKg: 40,
    status: 'agreement_drafted',
    cooperativeId: 'coop-naivasha',
    cooperativeName: 'Naivasha Horticultural Producers',
    negotiatedPricePerKg: 39,
    cutoffTime: '18:00 EAT Today',
    deliveryDate: '2026-09-28',
    microAgreementId: 'AGR-MKD-2026-0928-01'
  },
  {
    id: 'cluster-makadara-sukuma-01',
    neighbourhood: 'Makadara (Harambee, Hamza)',
    produceId: 'prod-sukuma',
    produceName: 'Collard Greens (Sukuma Wiki)',
    totalQuantityKg: 350,
    unitSummary: '5 magunia (350 kg)',
    vendorCount: 1,
    orderIds: ['ord-104'],
    vendorBreakdown: [
      {
        vendorId: 'vendor-jane',
        vendorName: 'Mama Jane Mwangi',
        phone: '+254799112233',
        quantityKg: 350,
        rawDisplay: '5 magunia',
        allocatedAmountKsh: 7350
      }
    ],
    moqKg: 350,
    moqMet: true,
    benchmarkPricePerKg: 22,
    targetPriceCeilingPerKg: 21,
    status: 'negotiating',
    cooperativeId: 'coop-limuru',
    cooperativeName: 'Limuru Greens Smallholder Alliance',
    negotiatedPricePerKg: 21,
    cutoffTime: '18:00 EAT Today',
    deliveryDate: '2026-09-28'
  }
];

export const INITIAL_AGREEMENTS: MicroAgreement[] = [
  {
    id: 'AGR-MKD-2026-0928-01',
    contractNumber: 'SS-MKD-260928-001',
    clusterId: 'cluster-makadara-nyanya-01',
    cooperativeId: 'coop-naivasha',
    cooperativeName: 'Naivasha Horticultural Producers',
    cooperativePhone: '+254721445566',
    produceName: 'Nyanya (Anna F1 Greenhouse Grade A)',
    totalQuantityKg: 600,
    pricePerKgKsh: 39,
    totalContractValueKsh: 23400,
    deliveryDate: 'Monday, 28 Sept 2026 kabla ya saa 12:30 Asubuhi (Before 06:30 AM EAT)',
    deliveryLocation: 'Makadara Central Produce Dropoff Shed (Near Hamza Market Jogoo Rd)',
    qualityTerms: 'Nyanya ngumu zisizoiva sana au kuoza (Firm, fresh Grade A, not overripe or crushed). Kupima uzani kwa mizani rasmi.',
    paymentTerms: 'Malipo ya 50% kupitia M-PESA STK Push wakati wa kukubaliana, 50% iliyobaki ikithibitishwa asubuhi baada ya kukagua bidhaa.',
    disputePolicy: 'Upungufu au uharibifu unaripotiwa ndani ya saa 2 kwa kutuma ujumbe "TATIZO" pamoja na picha. Rejesho la pesa la papo hapo au mbadala.',
    swahiliText: `MAKUBALIANO YA KIPINDI YA UTOAJI MAZAO (SOKO SMART)
Nambari ya Mkataba: SS-MKD-260928-001
Tarehe: 27/09/2026

Pande Zinazohusika:
1. Chama cha Wakulima: Naivasha Horticultural Producers (+254721445566)
2. Muungano wa Mama Mboga Makadara (Wafanyabiashara 3: Mama Sarah, Mama Wambui, Mama Achieng)

Maelezo ya Agizo:
- Zao: Nyanya Safi (Anna F1 Grade A)
- Jumla ya Uzani: Kilo 600 (Magunia 10 ya kilo 60)
- Bei Iliyokubaliwa: KSh 39 kwa kila kilo (KSh 2,340 kwa gunia)
- Thamani Kamili: KSh 23,400

Muda na Mahali pa Kuwasilisha:
- Tarehe ya Kufikishwa: 28/09/2026 kabla ya saa 12:30 Asubuhi (06:30 AM EAT)
- Eneo la Kushusha: Hamza Market Central Dropoff Shed, Jogoo Road, Makadara

Masharti ya Malipo na Ukaguzi:
- Asilimia 50 (KSh 11,700) inalipwa na kuzuiliwa kwenye akaunti ya Soko Smart Escrow kupitia M-PESA.
- Asilimia 50 inayobaki inatolewa kwa mkulima mara moja baada ya wawakilishi wa Mama Mboga kukagua uzani na ubora.
- Ikitokea upungufu wa uzani au mboga kuharibika njiani, Mama Mboga anatuma "TATIZO" na picha kabla ya saa 2:30 Asubuhi kwa fidia au marejesho.

Uthibitisho:
Mkulima na kila Mama Mboga anathibitisha kwa kutuma neno "NDIYO" au "YES" kwenye WhatsApp ya Soko Smart.`,
    englishText: `SOKO SMART MICRO-DELIVERY PRODUCE AGREEMENT
Agreement Reference: SS-MKD-260928-001
Date of Issuance: September 27, 2026

Parties:
1. Supplier Cooperative: Naivasha Horticultural Producers (+254721445566)
2. Buyer Cluster: Makadara Mama Mboga Pool (3 Vendors: Mama Sarah, Mama Wambui, Mama Achieng)

Order Specification:
- Produce: Fresh Greenhouse Firm Tomatoes (Anna F1 Grade A)
- Total Pooled Volume: 600 kg (10 crates/sacks of 60 kg each)
- Agreed Farm-Gate Bulk Price: KSh 39.00 per kg (KSh 2,340 per 60kg crate)
- Total Agreement Consideration: KSh 23,400.00

Logistics & Delivery Schedule:
- Delivery Window: September 28, 2026, strictly before 06:30 AM EAT
- Drop-off Staging Hub: Makadara Central Produce Dropoff Shed (Adjacent Hamza Market, Jogoo Road)

Settlement & Inspection Terms:
- 50% mobilization advance (KSh 11,700.00) held securely in Soko Smart Escrow via individual vendor M-PESA STK pushes.
- 50% balance released instantly to the cooperative via Daraja B2B upon physical delivery inspection and scale sign-off.
- In event of spoilage or weight variance exceeding 3%, vendor alerts via "TATIZO" within 2 hours of delivery for automated proportional refund.

Consent:
Confirmed digitally via WhatsApp reply "NDIYO" / "YES" by both cooperative dispatch and pool members.`,
    status: 'pending_confirmation',
    vendorConfirmations: {
      'vendor-sarah': { confirmed: true, timestamp: '2026-09-27T08:12:00Z', channel: 'whatsapp' },
      'vendor-wambui': { confirmed: true, timestamp: '2026-09-27T08:15:30Z', channel: 'whatsapp' },
      'vendor-achieng': { confirmed: false, channel: 'whatsapp' }
    },
    coopConfirmed: true,
    coopConfirmedTimestamp: '2026-09-27T08:05:00Z',
    digitalVerificationHash: 'sha256-e9c84b11f32a0d84c62b9a714f32e9d2a01',
    createdAt: '2026-09-27T07:45:00Z'
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'ledg-001',
    timestamp: '2026-09-27T08:12:15Z',
    transactionType: 'MAMA_MBOGA_COLLECTION',
    debitAccount: 'MPESA_SETTLEMENT_SUSPENSE',
    creditAccount: 'ESCROW_MAKADARA_NYANYA_01',
    amountKsh: 3510, // 50% of Mama Sarah's KSh 7,020 order
    referenceId: 'STK-QKZ84291',
    description: 'Mama Sarah (Hamza) 50% deposit for 3 magunia Nyanya'
  },
  {
    id: 'ledg-002',
    timestamp: '2026-09-27T08:15:45Z',
    transactionType: 'MAMA_MBOGA_COLLECTION',
    debitAccount: 'MPESA_SETTLEMENT_SUSPENSE',
    creditAccount: 'ESCROW_MAKADARA_NYANYA_01',
    amountKsh: 4680, // 50% of Mama Wambui's KSh 9,360 order
    referenceId: 'STK-RPL19482',
    description: 'Mama Wambui (Maringo) 50% deposit for 4 magunia Nyanya'
  }
];

export const INITIAL_DISPUTES: DisputeTicket[] = [
  {
    id: 'disp-201',
    orderId: 'ord-098-yesterday',
    clusterId: 'cluster-makadara-sukuma-prev',
    vendorId: 'vendor-sarah',
    vendorName: 'Mama Sarah Wanjiku',
    vendorPhone: '+254712345678',
    produceName: 'Sukuma Wiki',
    issueType: 'rotten_produce',
    description: 'Gunia moja ilikuwa imelowa maji ya mvua kutoka chini na majani yalikuwa yameoza kwa ndani kama kilo 12.',
    claimedAmountKsh: 264,
    status: 'open',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
    createdAt: '2026-09-26T07:15:00Z',
    resolutionNotes: 'Awaiting ops agent verification of weight slip from Hamza dropoff point.'
  }
];
