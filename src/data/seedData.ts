import {
  ProductItem,
  BusinessOwner,
  WholesaleSupplier,
  DemandOrder,
  DemandCluster,
  MicroAgreement,
  LedgerEntry,
  DisputeTicket,
  TradeCategoryConfig
} from '../types';

export const TRADE_CATEGORIES: TradeCategoryConfig[] = [
  {
    id: 'hardware',
    name: 'Hardware & Construction',
    swahiliName: 'Vifaa vya Ujenzi na Hardware',
    icon: 'Hammer',
    description: 'Cement, iron sheets (mabati), nails, timber, plumbing pipes, paint',
    cadence: 'weekly',
    sampleNeeds: ['Mifuko 20 ya saruji simiti Bamburi', 'Mabati 15 ya gauge 30', 'Misumari ya inchi 3 kilo 10']
  },
  {
    id: 'salon_beauty',
    name: 'Salon & Cosmetics',
    swahiliName: 'Saluni na Vipodozi',
    icon: 'Sparkles',
    description: 'Braids, weave lines, shampoos, relaxers, hair oils, clipper blades',
    cadence: 'twice_weekly',
    sampleNeeds: ['Carton 2 za Darling Braids', 'Jerrican 5L shampoo', 'Boksi ya relaxer tubs 12']
  },
  {
    id: 'produce_kiosk',
    name: 'Mama Mboga / Fresh Produce',
    swahiliName: 'Kiosk ya Mboga na Matunda',
    icon: 'Apple',
    description: 'Tomatoes, onions, potatoes, sukuma wiki, kienyeji greens',
    cadence: 'daily',
    sampleNeeds: ['Magunia 3 ya nyanya', 'Gunia 1 ya vitunguu', 'Madebe 5 ya viazi']
  },
  {
    id: 'tailoring_textiles',
    name: 'Tailoring & Textiles',
    swahiliName: 'Washonaji na Vitambaa',
    icon: 'Scissors',
    description: 'Ankara fabric rolls, kanga, sewing threads, zippers, lining, elastic',
    cadence: 'weekly',
    sampleNeeds: ['Roli 3 za kitambaa cha kanga', 'Boksi 1 ya uzi mweusi na mweupe', 'Zips dazeni 5']
  },
  {
    id: 'kibanda_food',
    name: 'Food Kiosk & Kibanda',
    swahiliName: 'Hoteli na Kibanda cha Chakula',
    icon: 'Utensils',
    description: 'Cooking oil jerricans, maize flour bundles, sugar, wheat flour, gas refill',
    cadence: 'daily',
    sampleNeeds: ['Jerrican 20L mafuta ya kupikia', 'Bundle 3 za unga wa ugali 2kg x 12', 'Gunia 50kg sukari']
  },
  {
    id: 'boda_parts',
    name: 'Boda Boda Spares',
    swahiliName: 'Vipuri vya Piki Piki na Boda',
    icon: 'Bike',
    description: '4T Engine oil, spark plugs, brake pads, tube sizes 3.00-17, drive chains',
    cadence: 'weekly',
    sampleNeeds: ['Carton 2 za engine oil 4T 1L', 'Brake pads pairs 20', 'Tubes 15 za 3.00-17']
  }
];

export const INITIAL_PRODUCT_CATALOG: ProductItem[] = [
  // --- Hardware ---
  {
    id: 'prod-cement-bamburi',
    category: 'hardware',
    name: 'Bamburi Nguvu Cement 32.5R (50kg)',
    swahiliName: 'Saruji / Simiti ya Bamburi (Mfuko 50kg)',
    synonyms: ['saruji', 'simiti', 'cement', 'bamburi', 'nguvu', 'mifuko ya saruji'],
    brandOrGrade: 'Bamburi Nguvu 32.5R',
    defaultUnit: 'mfuko',
    supportedUnits: [
      { unit: 'mfuko', label: 'Mfuko (50kg Bag)', multiplierToBase: 1, description: 'Standard 50kg woven bag' },
      { unit: 'pallet', label: 'Pallet (40 Bags)', multiplierToBase: 40, description: 'Wholesale pallet (2 Tonnes)' }
    ],
    moqBaseUnit: 30, // 30 bags minimum
    benchmarkPriceKsh: 680,
    guardrailMinKsh: 630,
    guardrailMaxKsh: 720,
    rollingWindowDays: 3,
    storageGuidelines: 'Dry pallet staging, strictly elevated from bare concrete ground.'
  },
  {
    id: 'prod-mabati-g30',
    category: 'hardware',
    name: 'Corrugated Iron Sheets G30 (2.5m)',
    swahiliName: 'Mabati ya Kuezeka (Gauge 30 - Futi 8 / 2.5m)',
    synonyms: ['mabati', 'iron sheets', 'iron sheet', 'bati', 'corrugated iron', 'gauge 30'],
    brandOrGrade: 'Mabati Rolling Mills (MRM) Standard',
    defaultUnit: 'bati',
    supportedUnits: [
      { unit: 'bati', label: 'Bati Moja (Single Sheet)', multiplierToBase: 1, description: 'Single 2.5m G30 corrugated sheet' },
      { unit: 'dazeni', label: 'Dazeni (12 Sheets)', multiplierToBase: 12, description: 'Wholesale bundle of 12 sheets' }
    ],
    moqBaseUnit: 24, // 2 dazeni minimum
    benchmarkPriceKsh: 780,
    guardrailMinKsh: 720,
    guardrailMaxKsh: 830,
    rollingWindowDays: 4,
    storageGuidelines: 'Flat covered rack, protected from rain and acid soil.'
  },
  {
    id: 'prod-nails-wire',
    category: 'hardware',
    name: 'Common Wire Nails (3-inch / 4-inch)',
    swahiliName: 'Misumari ya Kawaida ya Mbao (Inchi 3 & 4)',
    synonyms: ['misumari', 'nails', 'wire nails', 'msumari', 'misumari ya mbao'],
    brandOrGrade: 'Devki Heavy Wire Nails',
    defaultUnit: 'kilo',
    supportedUnits: [
      { unit: 'kilo', label: 'Kilo (1kg)', multiplierToBase: 1, description: 'Individual 1kg bundle' },
      { unit: 'boksi', label: 'Boksi (50kg Box)', multiplierToBase: 50, description: 'Heavy mill wooden carton' }
    ],
    moqBaseUnit: 50, // 1 box
    benchmarkPriceKsh: 135,
    guardrailMinKsh: 115,
    guardrailMaxKsh: 155,
    rollingWindowDays: 7
  },

  // --- Salon & Cosmetics ---
  {
    id: 'prod-darling-braids',
    category: 'salon_beauty',
    name: 'Darling Abuja / Classic Braids (Color #1 / #2)',
    swahiliName: 'Nywele za Kusuka / Braids za Darling',
    synonyms: ['braids', 'darling', 'abuja braids', 'nywele', 'yaki', 'lines', 'kusuka'],
    brandOrGrade: 'Darling Kenya Original Seal',
    defaultUnit: 'bundle',
    supportedUnits: [
      { unit: 'bundle', label: 'Bundle Moja (Single Pack)', multiplierToBase: 1, description: 'Single retail pack' },
      { unit: 'carton', label: 'Carton (48 Bundles)', multiplierToBase: 48, description: 'Wholesale factory master carton' }
    ],
    moqBaseUnit: 48, // 1 carton
    benchmarkPriceKsh: 110,
    guardrailMinKsh: 95,
    guardrailMaxKsh: 130,
    rollingWindowDays: 2,
    storageGuidelines: 'Keep dry, factory tamper-evident seal intact.'
  },
  {
    id: 'prod-salon-shampoo',
    category: 'salon_beauty',
    name: 'Salon Pro Conditioning Herbal Shampoo (5 Litres)',
    swahiliName: 'Shampoo ya Saluni Lita 5 (Herbal & Protein)',
    synonyms: ['shampoo', 'shampu', 'sabuni ya nywele', 'conditioner', 'hair wash'],
    brandOrGrade: 'Mikalla Salon Professional Grade',
    defaultUnit: 'jerrican',
    supportedUnits: [
      { unit: 'jerrican', label: 'Jerrican Lita 5', multiplierToBase: 1, description: '5-litre heavy duty container' },
      { unit: 'carton', label: 'Carton (4 Jerricans)', multiplierToBase: 4, description: 'Case of 4x5L' }
    ],
    moqBaseUnit: 8, // 8 jerricans
    benchmarkPriceKsh: 650,
    guardrailMinKsh: 580,
    guardrailMaxKsh: 720,
    rollingWindowDays: 5
  },

  // --- Tailoring & Textiles ---
  {
    id: 'prod-kanga-fabric',
    category: 'tailoring_textiles',
    name: 'African Print Fabric / Kanga Rolls (6 Yards / Roll)',
    swahiliName: 'Kitambaa cha Kanga na Vitenge (Yadi 6 kwa Roli)',
    synonyms: ['kitambaa', 'kanga', 'vitenge', 'ankara', 'fabric', 'roll', 'vitambaa'],
    brandOrGrade: 'Eastleigh Supreme Wax Print 100% Cotton',
    defaultUnit: 'roll',
    supportedUnits: [
      { unit: 'roll', label: 'Roli (6 Yards Piece)', multiplierToBase: 1, description: 'Single 6-yard piece' },
      { unit: 'bale', label: 'Bale (20 Rolls)', multiplierToBase: 20, description: 'Importer wrapped bundle' }
    ],
    moqBaseUnit: 20, // 1 bale
    benchmarkPriceKsh: 950,
    guardrailMinKsh: 850,
    guardrailMaxKsh: 1100,
    rollingWindowDays: 5
  },
  {
    id: 'prod-sewing-thread',
    category: 'tailoring_textiles',
    name: 'High-Tensile Industrial Sewing Thread Cones (5,000 Yards)',
    swahiliName: 'Koni za Uzi wa Kushona (Uzi wa Mashine)',
    synonyms: ['uzi', 'thread', 'uzi wa mashine', 'koni za uzi', 'sewing thread'],
    brandOrGrade: 'Coats Astra Heavy Duty Spun Polyester',
    defaultUnit: 'cone',
    supportedUnits: [
      { unit: 'cone', label: 'Koni 1 (Single Cone)', multiplierToBase: 1, description: '5,000 yard cone' },
      { unit: 'boksi', label: 'Boksi (12 Cones Assorted)', multiplierToBase: 12, description: 'Standard 12 cone trade box' }
    ],
    moqBaseUnit: 24, // 2 boxes
    benchmarkPriceKsh: 120,
    guardrailMinKsh: 100,
    guardrailMaxKsh: 140,
    rollingWindowDays: 7
  },

  // --- Produce / Mama Mboga ---
  {
    id: 'prod-nyanya',
    category: 'produce_kiosk',
    name: 'Firm Grade A Tomatoes (60kg Crate)',
    swahiliName: 'Nyanya Safi za Shamba (Gunia/Tenga la Kilo 60)',
    synonyms: ['nyanya', 'tomato', 'tomatoes', 'machungwa ya mboga'],
    brandOrGrade: 'Anna F1 Greenhouse Firm',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia / Crate (60kg)', multiplierToBase: 1, description: '60kg wooden farm crate' },
      { unit: 'debe', label: 'Debe (15kg)', multiplierToBase: 0.25, description: 'Approx 15kg bucket' }
    ],
    moqBaseUnit: 10, // 10 crates (600 kg)
    benchmarkPriceKsh: 2400, // per 60kg
    guardrailMinKsh: 2100,
    guardrailMaxKsh: 2700,
    rollingWindowDays: 1,
    storageGuidelines: 'Morning delivery before 06:30 AM, well-ventilated crates.'
  },
  {
    id: 'prod-vitunguu',
    category: 'produce_kiosk',
    name: 'Red Bulb Onions (50kg Net Bag)',
    swahiliName: 'Vitunguu Maji Vyekundu (Gunia la Kilo 50)',
    synonyms: ['vitunguu', 'onions', 'vitunguu maji', 'tunguu'],
    brandOrGrade: 'Red Creole Medium Cured',
    defaultUnit: 'gunia',
    supportedUnits: [
      { unit: 'gunia', label: 'Gunia (50kg Net)', multiplierToBase: 1, description: '50kg mesh net' },
      { unit: 'net', label: 'Net Ndogo (10kg)', multiplierToBase: 0.2, description: '10kg net bundle' }
    ],
    moqBaseUnit: 8, // 8 bags (400kg)
    benchmarkPriceKsh: 2750,
    guardrailMinKsh: 2400,
    guardrailMaxKsh: 3100,
    rollingWindowDays: 2
  },

  // --- Kibanda & Food Kiosk ---
  {
    id: 'prod-cooking-oil',
    category: 'kibanda_food',
    name: 'Refined Vegetable Cooking Oil (20 Litre Jerrican)',
    swahiliName: 'Mafuta Safi ya Kupikia (Mkebe / Jerrican Lita 20)',
    synonyms: ['mafuta', 'cooking oil', 'mafuta ya kupikia', 'jerrican ya mafuta', 'elianto', 'golden fry'],
    brandOrGrade: 'Bidco Golden Fry / Pwani Life Refined',
    defaultUnit: 'jerrican',
    supportedUnits: [
      { unit: 'jerrican', label: 'Jerrican Lita 20', multiplierToBase: 1, description: '20L factory sealed yellow container' }
    ],
    moqBaseUnit: 10, // 10 jerricans
    benchmarkPriceKsh: 4400,
    guardrailMinKsh: 4100,
    guardrailMaxKsh: 4750,
    rollingWindowDays: 2
  },
  {
    id: 'prod-unga-maize',
    category: 'kibanda_food',
    name: 'Fortified Maize Meal Unga (Bundle of 12 x 2kg)',
    swahiliName: 'Unga wa Ugali (Bale / Bundle ya Pakiti 12 za Kilo 2)',
    synonyms: ['unga', 'unga wa ugali', 'maize flour', 'sembe', 'jogoo', 'hostess'],
    brandOrGrade: 'Grade 1 Sifted Maize Meal',
    defaultUnit: 'bundle',
    supportedUnits: [
      { unit: 'bundle', label: 'Bundle (12 x 2kg = 24kg)', multiplierToBase: 1, description: 'Mill factory wrapped bale' }
    ],
    moqBaseUnit: 15, // 15 bundles
    benchmarkPriceKsh: 1650,
    guardrailMinKsh: 1500,
    guardrailMaxKsh: 1800,
    rollingWindowDays: 3
  }
];

export const INITIAL_BUSINESS_OWNERS: BusinessOwner[] = [
  {
    id: 'biz-hardware-kamau',
    businessName: 'Kamau Hardwares & Builders Depot',
    ownerName: 'John Kamau',
    category: 'hardware',
    phone: '+254712998877',
    ward: 'Makadara - Hamza',
    locationDesc: 'Jogoo Road Opposite Hamza Bus Stage',
    preferredLanguage: 'sheng',
    reputationScore: {
      fulfillmentRate: 98,
      onTimeRate: 96,
      disputeRate: 2,
      totalOrders: 28,
      rating: 4.9
    },
    mpesaNumber: '254712998877',
    onboarded: true,
    typicalNeeds: ['Saruji Bamburi', 'Mabati G30', 'Misumari']
  },
  {
    id: 'biz-salon-wanjiru',
    businessName: 'Neema Executive Beauty & Hair Salon',
    ownerName: 'Grace Wanjiru',
    category: 'salon_beauty',
    phone: '+254722334455',
    ward: 'Makadara - Maringo',
    locationDesc: 'Maringo Shopping Arcade Floor 1',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 96,
      onTimeRate: 94,
      disputeRate: 3,
      totalOrders: 34,
      rating: 4.85
    },
    mpesaNumber: '254722334455',
    onboarded: true,
    typicalNeeds: ['Darling Abuja Braids', 'Herbal Shampoo 5L', 'Relaxer kits']
  },
  {
    id: 'biz-produce-sarah',
    businessName: 'Mama Sarah Fresh Greens',
    ownerName: 'Mama Sarah Wanjiku',
    category: 'produce_kiosk',
    phone: '+254712345678',
    ward: 'Makadara - Hamza',
    locationDesc: 'Hamza Market Shed 14B',
    preferredLanguage: 'sheng',
    reputationScore: {
      fulfillmentRate: 98,
      onTimeRate: 97,
      disputeRate: 2,
      totalOrders: 42,
      rating: 4.9
    },
    mpesaNumber: '254712345678',
    onboarded: true,
    typicalNeeds: ['Nyanya', 'Vitunguu', 'Viazi', 'Sukuma Wiki']
  },
  {
    id: 'biz-tailor-achieng',
    businessName: 'Achieng Designer & Afro-Tailoring Hub',
    ownerName: 'Mercy Achieng',
    category: 'tailoring_textiles',
    phone: '+254733667788',
    ward: 'Makadara - Viwandani',
    locationDesc: 'Viwandani Bridge Plaza Stall 9',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 94,
      onTimeRate: 92,
      disputeRate: 4,
      totalOrders: 19,
      rating: 4.75
    },
    mpesaNumber: '254733667788',
    onboarded: true,
    typicalNeeds: ['Kitambaa cha kanga', 'Uzi wa mashine', 'Zips']
  },
  {
    id: 'biz-kibanda-mwangi',
    businessName: 'Mama Mwangi Hot Dishes & Chapati Point',
    ownerName: 'Jane Mwangi',
    category: 'kibanda_food',
    phone: '+254799112233',
    ward: 'Makadara - Harambee',
    locationDesc: 'Harambee Junction Kiosk A1',
    preferredLanguage: 'swahili',
    reputationScore: {
      fulfillmentRate: 95,
      onTimeRate: 93,
      disputeRate: 3,
      totalOrders: 26,
      rating: 4.8
    },
    mpesaNumber: '254799112233',
    onboarded: true,
    typicalNeeds: ['Mafuta ya kupikia 20L', 'Unga wa ugali bundles', 'Sukari']
  }
];

export const INITIAL_SUPPLIERS: WholesaleSupplier[] = [
  {
    id: 'supp-hardware-devki',
    name: 'Devki & Bamburi Regional Industrial Depot',
    category: 'hardware',
    supplierType: 'wholesale_depot',
    region: 'Commercial Street, Industrial Area, Nairobi',
    contactPerson: 'Karan Patel (Commercial Dispatch)',
    phone: '+254720889900',
    mpesaPaybill: '400200',
    rating: 4.9,
    minLotSize: 30,
    availableProducts: ['prod-cement-bamburi', 'prod-mabati-g30', 'prod-nails-wire'],
    priceList: {
      'prod-cement-bamburi': { pricePerUnit: 660, availableQty: 1200, gradeOrSpec: 'Nguvu 32.5R Fresh Bagged' },
      'prod-mabati-g30': { pricePerUnit: 760, availableQty: 650, gradeOrSpec: 'MRM G30 Full Zinc Galvanized' },
      'prod-nails-wire': { pricePerUnit: 125, availableQty: 2500, gradeOrSpec: 'Heavy 3-inch/4-inch Clean' }
    }
  },
  {
    id: 'supp-salon-darling',
    name: 'Darling Kenya & East Africa Master Wholesaler',
    category: 'salon_beauty',
    supplierType: 'manufacturer',
    region: 'River Road Cosmetics Hub / Ruaraka, Nairobi',
    contactPerson: 'Cynthia Muthoni (Key Accounts)',
    phone: '+254721776655',
    mpesaPaybill: '500300',
    rating: 4.88,
    minLotSize: 48,
    availableProducts: ['prod-darling-braids', 'prod-salon-shampoo'],
    priceList: {
      'prod-darling-braids': { pricePerUnit: 102, availableQty: 3500, gradeOrSpec: 'Original Fiber Color #1 #2 #4' },
      'prod-salon-shampoo': { pricePerUnit: 600, availableQty: 400, gradeOrSpec: 'Mikalla Herbal 5L Factory Batch' }
    }
  },
  {
    id: 'supp-textiles-eastleigh',
    name: 'Eastleigh Central Wax Prints & Textiles Wholesalers',
    category: 'tailoring_textiles',
    supplierType: 'import_distributor',
    region: '1st Avenue Mall, Eastleigh, Nairobi',
    contactPerson: 'Abdi Hassan (Wholesale Manager)',
    phone: '+254722554433',
    mpesaPaybill: '600400',
    rating: 4.82,
    minLotSize: 20,
    availableProducts: ['prod-kanga-fabric', 'prod-sewing-thread'],
    priceList: {
      'prod-kanga-fabric': { pricePerUnit: 890, availableQty: 450, gradeOrSpec: 'Cotton Wax Supreme 6-yard' },
      'prod-sewing-thread': { pricePerUnit: 108, availableQty: 1800, gradeOrSpec: 'Coats Astra 5000Y Cones' }
    }
  },
  {
    id: 'supp-produce-naivasha',
    name: 'Naivasha Horticultural Farmers Alliance',
    category: 'produce_kiosk',
    supplierType: 'farm_cooperative',
    region: 'South Lake, Naivasha, Nakuru County',
    contactPerson: 'Grace Chemutai (Sales Lead)',
    phone: '+254721445566',
    mpesaPaybill: '789123',
    rating: 4.85,
    minLotSize: 10,
    availableProducts: ['prod-nyanya', 'prod-vitunguu'],
    priceList: {
      'prod-nyanya': { pricePerUnit: 2340, availableQty: 120, gradeOrSpec: 'Anna F1 Greenhouse Firm 60kg crate' },
      'prod-vitunguu': { pricePerUnit: 2600, availableQty: 95, gradeOrSpec: 'Red Creole Medium Cured 50kg bag' }
    }
  },
  {
    id: 'supp-food-bidco',
    name: 'Industrial Area Edible Oils & Food Distributors',
    category: 'kibanda_food',
    supplierType: 'wholesale_depot',
    region: 'Enterprise Road, Industrial Area, Nairobi',
    contactPerson: 'Patrick Ochieng (Depot Supervisor)',
    phone: '+254723990011',
    mpesaPaybill: '800500',
    rating: 4.86,
    minLotSize: 10,
    availableProducts: ['prod-cooking-oil', 'prod-unga-maize'],
    priceList: {
      'prod-cooking-oil': { pricePerUnit: 4250, availableQty: 320, gradeOrSpec: 'Refined 20L Factory Sealed' },
      'prod-unga-maize': { pricePerUnit: 1580, availableQty: 500, gradeOrSpec: 'Grade 1 Sifted 12x2kg Bundle' }
    }
  }
];

export const INITIAL_ORDERS: DemandOrder[] = [
  // Hardware Cluster Orders
  {
    id: 'ord-hw-01',
    businessId: 'biz-hardware-kamau',
    businessName: 'Kamau Hardwares & Builders Depot',
    ownerName: 'John Kamau',
    category: 'hardware',
    phone: '+254712998877',
    ward: 'Makadara - Hamza',
    productId: 'prod-cement-bamburi',
    productName: 'Bamburi Nguvu Cement 32.5R (50kg)',
    rawQuantity: 20,
    rawUnit: 'mfuko',
    normalizedBaseQty: 20,
    targetPricePerUnitKsh: 670,
    brandPreference: 'Bamburi Nguvu',
    deliveryDate: '2026-09-29',
    createdAt: '2026-09-27T06:10:00Z',
    status: 'clustered',
    clusterId: 'cluster-hardware-makadara-01',
    notes: 'Free-text voice: "Nahitaji mifuko 20 ya saruji Bamburi kesho asubuhi Hamza."'
  },
  {
    id: 'ord-hw-02',
    businessId: 'biz-hardware-kamau',
    businessName: 'Hamza Fundi & Masonry Pool',
    ownerName: 'Fundi Peter Omwamba',
    category: 'hardware',
    phone: '+254720331122',
    ward: 'Makadara - Hamza',
    productId: 'prod-cement-bamburi',
    productName: 'Bamburi Nguvu Cement 32.5R (50kg)',
    rawQuantity: 15,
    rawUnit: 'mfuko',
    normalizedBaseQty: 15,
    targetPricePerUnitKsh: 670,
    brandPreference: 'Bamburi Nguvu',
    deliveryDate: '2026-09-29',
    createdAt: '2026-09-27T06:35:00Z',
    status: 'clustered',
    clusterId: 'cluster-hardware-makadara-01'
  },

  // Salon Cluster Orders
  {
    id: 'ord-sl-01',
    businessId: 'biz-salon-wanjiru',
    businessName: 'Neema Executive Beauty & Hair Salon',
    ownerName: 'Grace Wanjiru',
    category: 'salon_beauty',
    phone: '+254722334455',
    ward: 'Makadara - Maringo',
    productId: 'prod-darling-braids',
    productName: 'Darling Abuja / Classic Braids (Color #1 / #2)',
    rawQuantity: 1,
    rawUnit: 'carton',
    normalizedBaseQty: 48,
    targetPricePerUnitKsh: 105,
    brandPreference: 'Darling Abuja Original',
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T07:15:00Z',
    status: 'clustered',
    clusterId: 'cluster-salon-makadara-01',
    notes: 'Text: "Nahitaji carton 1 ya Darling Abuja braids rangi nyeusi #1."'
  },

  // Mama Mboga Fresh Produce Cluster Orders
  {
    id: 'ord-pr-01',
    businessId: 'biz-produce-sarah',
    businessName: 'Mama Sarah Fresh Greens',
    ownerName: 'Mama Sarah Wanjiku',
    category: 'produce_kiosk',
    phone: '+254712345678',
    ward: 'Makadara - Hamza',
    productId: 'prod-nyanya',
    productName: 'Firm Grade A Tomatoes (60kg Crate)',
    rawQuantity: 4,
    rawUnit: 'gunia',
    normalizedBaseQty: 4,
    targetPricePerUnitKsh: 2350,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T07:40:00Z',
    status: 'clustered',
    clusterId: 'cluster-produce-makadara-01'
  },
  {
    id: 'ord-pr-02',
    businessId: 'biz-kibanda-mwangi',
    businessName: 'Mama Mwangi Hot Dishes & Chapati Point',
    ownerName: 'Jane Mwangi',
    category: 'produce_kiosk',
    phone: '+254799112233',
    ward: 'Makadara - Harambee',
    productId: 'prod-nyanya',
    productName: 'Firm Grade A Tomatoes (60kg Crate)',
    rawQuantity: 6,
    rawUnit: 'gunia',
    normalizedBaseQty: 6,
    targetPricePerUnitKsh: 2350,
    deliveryDate: '2026-09-28',
    createdAt: '2026-09-27T07:55:00Z',
    status: 'clustered',
    clusterId: 'cluster-produce-makadara-01'
  }
];

export const INITIAL_CLUSTERS: DemandCluster[] = [
  {
    id: 'cluster-hardware-makadara-01',
    category: 'hardware',
    neighbourhood: 'Makadara & Jogoo Road Corridor',
    productId: 'prod-cement-bamburi',
    productName: 'Bamburi Nguvu Cement 32.5R (50kg)',
    totalQuantityBase: 35,
    unitSummary: '35 mifuko (1.75 Tonnes)',
    businessCount: 2,
    orderIds: ['ord-hw-01', 'ord-hw-02'],
    businessBreakdown: [
      {
        businessId: 'biz-hardware-kamau',
        businessName: 'Kamau Hardwares Depot',
        ownerName: 'John Kamau',
        phone: '+254712998877',
        quantityBase: 20,
        rawDisplay: '20 mifuko (50kg)',
        allocatedAmountKsh: 13200
      },
      {
        businessId: 'biz-hardware-kamau',
        businessName: 'Hamza Fundi Pool',
        ownerName: 'Fundi Peter Omwamba',
        phone: '+254720331122',
        quantityBase: 15,
        rawDisplay: '15 mifuko (50kg)',
        allocatedAmountKsh: 9900
      }
    ],
    moqBase: 30,
    moqMet: true,
    benchmarkPricePerUnit: 680,
    targetPriceCeilingPerUnit: 670,
    status: 'agreement_drafted',
    supplierId: 'supp-hardware-devki',
    supplierName: 'Devki & Bamburi Regional Industrial Depot',
    negotiatedPricePerUnit: 660,
    cutoffTime: '17:00 EAT Today',
    deliveryDate: '2026-09-29',
    microAgreementId: 'AGR-SK254-HW-2026-001'
  },
  {
    id: 'cluster-salon-makadara-01',
    category: 'salon_beauty',
    neighbourhood: 'Makadara (Maringo & Hamza)',
    productId: 'prod-darling-braids',
    productName: 'Darling Abuja / Classic Braids (Color #1 / #2)',
    totalQuantityBase: 48,
    unitSummary: '1 master carton (48 bundles)',
    businessCount: 1,
    orderIds: ['ord-sl-01'],
    businessBreakdown: [
      {
        businessId: 'biz-salon-wanjiru',
        businessName: 'Neema Beauty Salon',
        ownerName: 'Grace Wanjiru',
        phone: '+254722334455',
        quantityBase: 48,
        rawDisplay: '1 carton (48 bundles)',
        allocatedAmountKsh: 4896
      }
    ],
    moqBase: 48,
    moqMet: true,
    benchmarkPricePerUnit: 110,
    targetPriceCeilingPerUnit: 105,
    status: 'negotiating',
    supplierId: 'supp-salon-darling',
    supplierName: 'Darling Kenya Master Wholesaler',
    negotiatedPricePerUnit: 102,
    cutoffTime: '18:00 EAT Today',
    deliveryDate: '2026-09-28'
  },
  {
    id: 'cluster-produce-makadara-01',
    category: 'produce_kiosk',
    neighbourhood: 'Makadara Corridor (Hamza & Harambee)',
    productId: 'prod-nyanya',
    productName: 'Firm Grade A Tomatoes (60kg Crate)',
    totalQuantityBase: 10,
    unitSummary: '10 wooden crates (~600 kg)',
    businessCount: 2,
    orderIds: ['ord-pr-01', 'ord-pr-02'],
    businessBreakdown: [
      {
        businessId: 'biz-produce-sarah',
        businessName: 'Mama Sarah Fresh Greens',
        ownerName: 'Mama Sarah Wanjiku',
        phone: '+254712345678',
        quantityBase: 4,
        rawDisplay: '4 magunia (240kg)',
        allocatedAmountKsh: 9360
      },
      {
        businessId: 'biz-kibanda-mwangi',
        businessName: 'Mama Mwangi Hot Dishes',
        ownerName: 'Jane Mwangi',
        phone: '+254799112233',
        quantityBase: 6,
        rawDisplay: '6 magunia (360kg)',
        allocatedAmountKsh: 14040
      }
    ],
    moqBase: 10,
    moqMet: true,
    benchmarkPricePerUnit: 2400,
    targetPriceCeilingPerUnit: 2350,
    status: 'open',
    supplierId: 'supp-produce-naivasha',
    supplierName: 'Naivasha Horticultural Farmers Alliance',
    negotiatedPricePerUnit: 2340,
    cutoffTime: '18:00 EAT Today',
    deliveryDate: '2026-09-28'
  }
];

export const INITIAL_AGREEMENTS: MicroAgreement[] = [
  {
    id: 'AGR-SK254-HW-2026-001',
    contractNumber: 'SK254-MKD-HW-260929-01',
    category: 'hardware',
    clusterId: 'cluster-hardware-makadara-01',
    supplierId: 'supp-hardware-devki',
    supplierName: 'Devki & Bamburi Regional Industrial Depot',
    supplierPhone: '+254720889900',
    productName: 'Bamburi Nguvu Cement 32.5R (50kg Bags)',
    totalQuantityBase: 35,
    pricePerUnitKsh: 660,
    totalContractValueKsh: 23100,
    deliveryDate: 'Tuesday, 29 Sept 2026 kabla ya saa 08:00 AM (Strictly morning)',
    deliveryLocation: 'Hamza Central Hardware Offloading Bay (Jogoo Road, Makadara)',
    qualityTerms: 'Mifuko halisi ya kiwanda ya Bamburi Nguvu 32.5R, isiyo na unyevu au kuganda (Fresh factory packed, free of moisture or caking). Tarehe ya kutengenezwa ndani ya siku 21 zilizopita.',
    paymentTerms: '50% (KSh 11,550) inalipwa na kuzuiliwa kwenye Soko Smart Escrow kupitia M-PESA STK Push. 50% iliyobaki inatolewa kwa msambazaji mara tu lori linaposhusha na kukaguliwa.',
    disputePolicy: 'Mfuko uliotoboka au ulioganda unaripotiwa ndani ya saa 3 kwa kutuma "TATIZO". Rejesho la pesa la papo hapo au kuletewa mbadala ndani ya saa 6.',
    swahiliText: `MKATABA WA UNUNUZI WA PAMOJA WA VIFAA VYA UJENZI (SOKO SMART)
Nambari ya Mkataba: SK254-MKD-HW-260929-01
Tarehe: 27/09/2026

Pande Zinazohusika:
1. Msambazaji Mkuu wa Kiwanda: Devki & Bamburi Regional Industrial Depot (+254720889900)
2. Muungano wa Wauzaji wa Hardware Makadara (Wafanyabiashara 2: Kamau Hardwares & Hamza Fundi Pool)

Ufafanuzi wa Bidhaa:
- Bidhaa: Saruji halisi ya Bamburi Nguvu 32.5R (Mifuko 50kg)
- Jumla ya Idadi Iliyokusanywa: Mifuko 35 (Tani 1.75)
- Bei ya Jumla ya Kiwanda: KSh 660 kwa kila mfuko
- Thamani Kamili ya Mkataba: KSh 23,100

Mahali na Ratiba ya Kushusha:
- Tarehe ya Kufikishwa: 29/09/2026 kabla ya saa 08:00 Asubuhi
- Eneo la Kushusha: Hamza Central Hardware Offloading Bay, Jogoo Road, Makadara

Masharti ya Malipo na Escrow:
- Malipo ya asilimia 50 (KSh 11,550) yanazuiliwa kwenye akaunti salama ya Soko Smart Escrow kupitia M-PESA STK Push.
- Asilimia 50 inayobaki inatolewa kwa msambazaji papo hapo baada ya kupakua na kuhakiki ubora na uzani wa kila mfuko.

Uthibitisho:
Pande zote zinathibitisha kidijitali kwa kutuma neno "NDIYO" au "YES" kwenye WhatsApp ya Soko Smart.`,
    englishText: `SOKO SMART B2B BULK PURCHASE AGREEMENT - HARDWARE SECTOR
Agreement Reference: SK254-MKD-HW-260929-01
Date of Issuance: September 27, 2026

Parties:
1. Supplier / Wholesale Depot: Devki & Bamburi Regional Industrial Depot (+254720889900)
2. Buyer Cluster: Makadara Hardware & Builders Pool (2 Traders: Kamau Hardwares & Hamza Fundi Pool)

Specification:
- Product: Authentic Bamburi Nguvu Cement 32.5R (50kg Bags)
- Aggregated Volume: 35 Bags (1.75 Metric Tonnes)
- Agreed Wholesale Bulk Rate: KSh 660.00 per 50kg bag
- Total Agreement Value: KSh 23,100.00

Staging & Logistics:
- Delivery Window: September 29, 2026, strictly before 08:00 AM EAT
- Delivery Bay: Hamza Central Hardware Offloading Bay, Jogoo Road, Makadara

Settlement & Escrow Terms:
- 50% mobilization advance (KSh 11,550.00) held in Soko Smart Escrow via individual trader M-PESA STK pushes.
- 50% balance released instantly via Daraja B2B upon offload verification.
- Damaged, torn, or caked bags reported within 3 hours via keyword "TATIZO" for immediate proportional credit.

Consent:
Formally verified via single-word WhatsApp reply "NDIYO" / "YES" by both wholesale dispatch and cluster merchants.`,
    status: 'pending_confirmation',
    businessConfirmations: {
      'biz-hardware-kamau': { confirmed: true, timestamp: '2026-09-27T08:20:00Z', channel: 'whatsapp' },
      'fundi-omwamba': { confirmed: false, channel: 'whatsapp' }
    },
    supplierConfirmed: true,
    supplierConfirmedTimestamp: '2026-09-27T08:10:00Z',
    digitalVerificationHash: 'sha256-sk254-hw-bamburi-99812',
    createdAt: '2026-09-27T08:00:00Z'
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'ledg-001',
    timestamp: '2026-09-27T08:20:15Z',
    transactionType: 'TRADER_COLLECTION',
    debitAccount: 'MPESA_SETTLEMENT_SUSPENSE',
    creditAccount: 'ESCROW_HARDWARE_MAKADARA_01',
    amountKsh: 6600, // 50% deposit from Kamau Hardwares (10 bags out of 20)
    referenceId: 'STK-HW-99120',
    description: 'John Kamau (Kamau Hardwares) 50% escrow deposit for 20 bags Bamburi Cement'
  }
];

export const INITIAL_DISPUTES: DisputeTicket[] = [
  {
    id: 'disp-hw-101',
    orderId: 'ord-prev-hw',
    clusterId: 'cluster-hw-prev',
    category: 'hardware',
    businessId: 'biz-hardware-kamau',
    businessName: 'Kamau Hardwares & Builders Depot',
    phone: '+254712998877',
    productName: 'Mabati Gauge 30',
    issueType: 'damaged_item',
    description: 'Mabati 3 yalikuwa yamepondoka kona wakati wa kuteremsha kutoka kwa lori la msambazaji.',
    claimedAmountKsh: 2280,
    status: 'open',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60',
    createdAt: '2026-09-26T09:30:00Z',
    resolutionNotes: 'Awaiting depot manager replacement signoff for 3 bent sheets.'
  }
];
