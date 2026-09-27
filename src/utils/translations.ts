import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  appSubline: string;
  tabs: {
    whatsapp: string;
    clustering: string;
    negotiation: string;
    agreements: string;
    mpesa: string;
    disputes: string;
    ontology: string;
    login: string;
  };
  auth: {
    title: string;
    subtitle: string;
    loginForIdentity: string;
    switchIdentity: string;
    chooseProfile: string;
    enterPhone: string;
    enterPin: string;
    loginButton: string;
    registerNew: string;
    registerTitle: string;
    registerDesc: string;
    fullName: string;
    businessName: string;
    tradeCategory: string;
    countyWard: string;
    locationDesc: string;
    phoneLabel: string;
    nationalIdLabel: string;
    typicalNeedsLabel: string;
    registerSubmit: string;
    cancel: string;
    quickProfiles: string;
    phonePinLogin: string;
    newTraderRegister: string;
    activeSession: string;
    verifiedBadge: string;
    traderCardTitle: string;
    reputationFulfillment: string;
    reputationRating: string;
    disputeRate: string;
    escrowSafety: string;
    logoutButton: string;
    sendOtp: string;
    verifyOtp: string;
    loginSuccess: string;
    registeredSuccess: string;
  };
  languagePref: {
    title: string;
    subtitle: string;
    chooseLabel: string;
    savedAlert: string;
    options: {
      swahili: {
        name: string;
        badge: string;
        desc: string;
        preview: string;
      };
      sheng: {
        name: string;
        badge: string;
        desc: string;
        preview: string;
      };
      english: {
        name: string;
        badge: string;
        desc: string;
        preview: string;
      };
      mixed: {
        name: string;
        badge: string;
        desc: string;
        preview: string;
      };
    };
  };
  common: {
    verified: string;
    changeLanguage: string;
    loggedInAs: string;
    switchUser: string;
    currency: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  swahili: {
    appName: 'Soko Smart',
    appTagline: 'Mratibu wa Ununuzi wa Pamoja',
    appSubline: 'Kuunganisha mahitaji ya wafanyabiashara wadogo kote Kenya · Swahili · Sheng · English',
    tabs: {
      whatsapp: 'WhatsApp / SMS Chat',
      clustering: 'Mkusanyiko wa Oda za Pamoja',
      negotiation: 'Majadiliano na Wasambazaji',
      agreements: 'Mikataba ya Kisheria ya Pamoja',
      mpesa: 'M-PESA & Hazina ya Escrow',
      disputes: 'Dawati la Malalamiko ("TATIZO")',
      ontology: 'Ufafanuzi wa Bidhaa & Bei za Kiwanda',
      login: 'Kuingia & Utambulisho wa Mfanyabiashara'
    },
    auth: {
      title: 'Kitambulisho & Kuingia kwa Mfanyabiashara',
      subtitle: 'Ingia ili kuthibitisha utambulisho wako, kusimamia maagizo, na kuweka mapendeleo ya lugha',
      loginForIdentity: 'Ingia kwa Utambulisho',
      switchIdentity: 'Badilisha Mfanyabiashara',
      chooseProfile: 'Chagua Wasifu Uliothibitishwa',
      enterPhone: 'Nambari ya Simu (M-PESA)',
      enterPin: 'PIN ya Siri ya Soko Smart (Namba 4)',
      loginButton: 'Ingia Kwenye Akaunti',
      registerNew: 'Sajili Mfanyabiashara Mpya',
      registerTitle: 'Fomu ya Usajili wa Biashara Mpya',
      registerDesc: 'Jiunge na mtandao wa ununuzi wa pamoja wa jumla kwa bei ya kiwanda',
      fullName: 'Jina Kamili la Mmiliki',
      businessName: 'Jina la Biashara au Duka',
      tradeCategory: 'Aina ya Biashara',
      countyWard: 'Mtaa au Soko (Ward / Market)',
      locationDesc: 'Mahali Lilipo Duka (Stall / Mtaa)',
      phoneLabel: 'Nambari ya Simu (+254...)',
      nationalIdLabel: 'Nambari ya Kitambulisho cha Taifa (ID)',
      typicalNeedsLabel: 'Bidhaa Unazohitaji Mara kwa Mara (Tenganisha kwa mkato)',
      registerSubmit: 'Kamilisha Usajili na Uingie',
      cancel: 'Ghairi',
      quickProfiles: 'Chagua Mfanyabiashara Moja kwa Moja',
      phonePinLogin: 'Ingia kwa Simu & PIN',
      newTraderRegister: 'Usajili Mpya',
      activeSession: 'Kikao Kilicho Wazi',
      verifiedBadge: 'Imethibitishwa na Soko Smart',
      traderCardTitle: 'Kitambulisho cha Dijitali cha Mfanyabiashara',
      reputationFulfillment: 'Kiwango cha Kukamilisha Oda',
      reputationRating: 'Alama ya Uaminifu',
      disputeRate: 'Kiwango cha Malalamiko',
      escrowSafety: 'Malipo Salama ya Escrow',
      logoutButton: 'Ondoka / Badilisha Mtumiaji',
      sendOtp: 'Tuma Nambari ya Uthibitisho (OTP)',
      verifyOtp: 'Thibitisha Namba na Uingie',
      loginSuccess: 'Umefanikiwa kuingia kama',
      registeredSuccess: 'Usajili umefaulu! Umekaribishwa Soko Smart'
    },
    languagePref: {
      title: 'Mapendeleo ya Lugha',
      subtitle: 'Chagua lugha utakayotumia kwenye mfumo na mawasiliano ya WhatsApp/SMS',
      chooseLabel: 'Chagua lugha unayopendelea:',
      savedAlert: 'Mapendeleo ya lugha yamehifadhiwa!',
      options: {
        swahili: {
          name: 'Kiswahili Sanifu',
          badge: 'Rasmi & Mkataba',
          desc: 'Lugha rasmi ya Kiswahili inayoeleweka kote Afrika Mashariki kwa makubaliano ya wazi.',
          preview: 'Habari John Kamau! Agizo lako la mifuko 20 ya saruji limeunganishwa na bei imeshuka hadi KSh 660.'
        },
        sheng: {
          name: 'Sheng ya Mtaa',
          badge: 'Mtaani Nairobi',
          desc: 'Mchanganyiko wa Sheng inayotumiwa na vijana, boda boda, na wafanyabiashara wa mtaani.',
          preview: 'Niaje John Kamau! Mzigo wako wa saruji mifuko 20 umeshikana na mabeste wa Makadara, bei imeshuka fiti hadi KSh 660.'
        },
        english: {
          name: 'English (Commercial)',
          badge: 'Standard B2B',
          desc: 'Formal commercial language for structured invoices, purchase orders, and legal agreements.',
          preview: 'Hello John Kamau! Your pooled order for 20 bags of cement has been consolidated at KSh 660 per bag.'
        },
        mixed: {
          name: 'Kiswahili + English (Mixed)',
          badge: 'Kenyan Everyday',
          desc: 'Lugha ya kawaida ya kila siku inayochanganya Kiswahili na English (Code-switching ya soko).',
          preview: 'Habari John! Your order ya mifuko 20 ya cement imekuwa pooled na suppliers wamekubali KSh 660.'
        }
      }
    },
    common: {
      verified: 'Imethibitishwa',
      changeLanguage: 'Badilisha Lugha',
      loggedInAs: 'Umeingia kama',
      switchUser: 'Badilisha',
      currency: 'KSh'
    }
  },

  sheng: {
    appName: 'Soko Smart',
    appTagline: 'Coordination ya Ganji & Mzigo',
    appSubline: 'Kuunganisha ma-hustler wote Kenya kuchota mzigo wa jumla kwa bei ya kiwanda',
    tabs: {
      whatsapp: 'WhatsApp & Chora Mzigo',
      clustering: 'Kuchanganya Oda za Mtaa',
      negotiation: 'Bargain na Ma-Supplier',
      agreements: 'Mkataba & Signatures',
      mpesa: 'M-PESA & Escrow ya Ganji',
      disputes: 'Tatizo Desk ("TATIZO")',
      ontology: 'Katalogi & Bei za Kiwanda',
      login: 'Identity & Ku-log In'
    },
    auth: {
      title: 'Identity ya Biashara & Ku-Log In',
      subtitle: 'Ingia kwa account yako uweze ku-manage ma-order, kusign agreements, na kuchagua lugha ya mtaa',
      loginForIdentity: 'Log In kwa Identity',
      switchIdentity: 'Badilisha Msee',
      chooseProfile: 'Chukua Profile Iliyosetiwa',
      enterPhone: 'Namba ya Safaricom / M-PESA',
      enterPin: 'Secret PIN ya Base (Namba 4)',
      loginButton: 'Ingia Ndani',
      registerNew: 'Sajili Biashara / Hustle Mpya',
      registerTitle: 'Fomu ya Ku-register Hustle Mpya',
      registerDesc: 'Jiunge na mabeste wa mtaa ununue stock kwa bei ya chini ya factory',
      fullName: 'Jina Lako Kamili (Owner)',
      businessName: 'Jina ya Duka / Base',
      tradeCategory: 'Aina ya Hustle / Bizna',
      countyWard: 'Mtaa au Base (Ward / Market)',
      locationDesc: 'Stall number au landmark ya duka',
      phoneLabel: 'Namba ya Simu (+254...)',
      nationalIdLabel: 'Namba ya Kitambulisho (ID)',
      typicalNeedsLabel: 'Vitu unachotanga mara kwa mara (Weka koma)',
      registerSubmit: 'Maliza Registration na Uingie Ndani',
      cancel: 'Acha Tu',
      quickProfiles: 'Select Profile Moja kwa Moja',
      phonePinLogin: 'Log In na Simu & PIN',
      newTraderRegister: 'Usajili wa Msee Mpya',
      activeSession: 'Session Iko Live',
      verifiedBadge: 'Verified Hustler wa Soko Smart',
      traderCardTitle: 'Digital Identity Card ya Biashara',
      reputationFulfillment: 'Rate ya Kuleta Mzigo Safi',
      reputationRating: 'Nyota za Uaminifu',
      disputeRate: 'Kesi za Tatizo',
      escrowSafety: 'Ganji Iko Safe kwa Escrow',
      logoutButton: 'Toka / Change Profile',
      sendOtp: 'Tuma Namba ya OTP',
      verifyOtp: 'Verify na Uingie',
      loginSuccess: 'Uko ndani kama',
      registeredSuccess: 'Usajili imepita safi! Karibu Soko Smart'
    },
    languagePref: {
      title: 'Kuchagua Lugha ya Mtaa',
      subtitle: 'Chagua namna unataka Soko Smart ikuchapie kwa WhatsApp na hapa kwa app',
      chooseLabel: 'Chagua vile unataka kuchapiwa:',
      savedAlert: 'Lugha imesetiwa poa!',
      options: {
        swahili: {
          name: 'Kiswahili Sanifu',
          badge: 'Rasmi',
          desc: 'Lugha safi ya kuelewana kwa mikataba ya kibiashara.',
          preview: 'Habari John Kamau! Agizo lako la saruji mifuko 20 limewekwa pamoja kwa KSh 660.'
        },
        sheng: {
          name: 'Sheng ya Mtaa',
          badge: 'Ya Mtaa Tu',
          desc: 'Slang ya Nairobi, boda boda na mabeste wa sokoni kwa machapiano ya haraka.',
          preview: 'Niaje John Kamau! Mzigo wako wa saruji mifuko 20 umeshikana fiti na mabeste wa Makadara, tumegongana bei ya KSh 660.'
        },
        english: {
          name: 'English (Commercial)',
          badge: 'Official',
          desc: 'Formal English for commercial quotes and supply legal sheets.',
          preview: 'Hello John Kamau! Your pooled order for 20 cement bags is confirmed at KSh 660 each.'
        },
        mixed: {
          name: 'Kiswahili + English (Mixed)',
          badge: 'Soko Mix',
          desc: 'Mchanganyiko wa kawaida ya soko: Kiswahili na English pamoja.',
          preview: 'Niaje John! Your order ya mifuko 20 ya cement imeshikana na price imedrop to KSh 660.'
        }
      }
    },
    common: {
      verified: 'Verified',
      changeLanguage: 'Badilisha Lugha',
      loggedInAs: 'Umeingia kama',
      switchUser: 'Badilisha',
      currency: 'KSh'
    }
  },

  english: {
    appName: 'Soko Smart',
    appTagline: 'Agentic B2B Coordination Platform',
    appSubline: 'Trade-agnostic demand pooling for Kenyan small businesses · Swahili · Sheng · English',
    tabs: {
      whatsapp: 'WhatsApp / SMS Chat',
      clustering: 'Multi-Trade Clustering',
      negotiation: 'Supplier Negotiation',
      agreements: 'Bilingual Agreements',
      mpesa: 'M-PESA & Escrow',
      disputes: 'Disputes ("TATIZO")',
      ontology: 'Trade Ontologies & Bands',
      login: 'Login & Trader Identity'
    },
    auth: {
      title: 'Trader Identity & Authentication',
      subtitle: 'Log in to verify your merchant identity, review pooled orders, and adjust language preferences',
      loginForIdentity: 'Log In for Identity',
      switchIdentity: 'Switch Merchant',
      chooseProfile: 'Select Verified Profile',
      enterPhone: 'Mobile Phone Number (M-PESA)',
      enterPin: '4-Digit Security PIN',
      loginButton: 'Sign In to Account',
      registerNew: 'Register New Merchant',
      registerTitle: 'New Merchant Onboarding',
      registerDesc: 'Join thousands of Kenyan retail merchants pooling bulk factory purchases',
      fullName: 'Owner Full Name',
      businessName: 'Business / Enterprise Name',
      tradeCategory: 'Primary Trade Category',
      countyWard: 'Ward / Market Location',
      locationDesc: 'Stall / Shop Location Description',
      phoneLabel: 'Phone Number (+254...)',
      nationalIdLabel: 'National ID Number',
      typicalNeedsLabel: 'Regular Inventory Needs (comma-separated)',
      registerSubmit: 'Complete Registration & Sign In',
      cancel: 'Cancel',
      quickProfiles: 'Quick Select Verified Trader',
      phonePinLogin: 'Phone & PIN Login',
      newTraderRegister: 'New Registration',
      activeSession: 'Active Identity Session',
      verifiedBadge: 'Soko Smart Verified Trader',
      traderCardTitle: 'Digital Merchant Identity Card',
      reputationFulfillment: 'Fulfillment Reliability',
      reputationRating: 'Trust Rating',
      disputeRate: 'Dispute Rate',
      escrowSafety: 'Protected Escrow Ledger',
      logoutButton: 'Log Out / Switch Account',
      sendOtp: 'Send OTP Verification Code',
      verifyOtp: 'Verify Code & Sign In',
      loginSuccess: 'Successfully authenticated as',
      registeredSuccess: 'Merchant registered successfully! Welcome to Soko Smart'
    },
    languagePref: {
      title: 'Language Preferences',
      subtitle: 'Select your preferred language for the interface and automated WhatsApp / SMS interactions',
      chooseLabel: 'Choose your default communication language:',
      savedAlert: 'Language preferences updated successfully!',
      options: {
        swahili: {
          name: 'Kiswahili Sanifu',
          badge: 'Standard Swahili',
          desc: 'Clear, formal Swahili recognized throughout East Africa for commercial contracts.',
          preview: 'Habari John Kamau! Agizo lako la mifuko 20 ya saruji limeunganishwa na bei imeshuka hadi KSh 660.'
        },
        sheng: {
          name: 'Sheng ya Mtaa',
          badge: 'Nairobi Slang',
          desc: 'Dynamic Nairobi urban vernacular common among market vendors, boda riders, and mechanics.',
          preview: 'Niaje John Kamau! Mzigo wako wa saruji mifuko 20 umeshikana na mabeste wa Makadara, bei imeshuka hadi KSh 660.'
        },
        english: {
          name: 'English (Commercial)',
          badge: 'Standard B2B',
          desc: 'Formal commercial language for invoices, purchase agreements, and legal verification.',
          preview: 'Hello John Kamau! Your pooled order for 20 bags of cement has been consolidated at KSh 660 per bag.'
        },
        mixed: {
          name: 'Kiswahili + English (Mixed)',
          badge: 'Everyday Kenyan',
          desc: 'Natural Kenyan code-switching blending Kiswahili and English widely used in retail markets.',
          preview: 'Habari John! Your order ya mifuko 20 ya cement imekuwa pooled na suppliers wamekubali KSh 660.'
        }
      }
    },
    common: {
      verified: 'Verified',
      changeLanguage: 'Change Language',
      loggedInAs: 'Signed in as',
      switchUser: 'Switch',
      currency: 'KSh'
    }
  },

  mixed: {
    appName: 'Soko Smart',
    appTagline: 'Mratibu wa Bulk Orders & Escrow',
    appSubline: 'Demand pooling ya biashara ndogo kote Kenya · Swahili · Sheng · English',
    tabs: {
      whatsapp: 'WhatsApp & SMS Chat',
      clustering: 'Multi-Trade Clustering',
      negotiation: 'Supplier Negotiation',
      agreements: 'Bilingual Micro-Agreements',
      mpesa: 'M-PESA & Escrow',
      disputes: 'Dispute Desk ("TATIZO")',
      ontology: 'Catalog & Trade Ontologies',
      login: 'Log In & Identity ya Biashara'
    },
    auth: {
      title: 'Trader Identity & Log In Portal',
      subtitle: 'Ingia for identity verification, manage orders zako, na update language preferences',
      loginForIdentity: 'Log In for Identity',
      switchIdentity: 'Switch Biashara',
      chooseProfile: 'Chagua Verified Profile',
      enterPhone: 'Phone Number (M-PESA)',
      enterPin: '4-Digit Security PIN ya Duka',
      loginButton: 'Sign In / Ingia',
      registerNew: 'Register Biashara Mpya',
      registerTitle: 'New Merchant Registration Form',
      registerDesc: 'Join other traders kupata wholesale prices direct kutoka factories',
      fullName: 'Owner Full Name',
      businessName: 'Business / Shop Name',
      tradeCategory: 'Trade Category / Biashara',
      countyWard: 'Ward au Market Location',
      locationDesc: 'Stall au Shop Location Description',
      phoneLabel: 'Phone Number (+254...)',
      nationalIdLabel: 'National ID Number',
      typicalNeedsLabel: 'Regular Items unanunuanga (Comma-separated)',
      registerSubmit: 'Submit Registration & Log In',
      cancel: 'Cancel / Ghairi',
      quickProfiles: 'Quick Select Verified Trader',
      phonePinLogin: 'Log In na Phone & PIN',
      newTraderRegister: 'New Trader Register',
      activeSession: 'Active Identity Session',
      verifiedBadge: 'Soko Smart Verified Trader',
      traderCardTitle: 'Digital Trader Identity Card',
      reputationFulfillment: 'Fulfillment Rate',
      reputationRating: 'Trust Rating / Nyota',
      disputeRate: 'Dispute Rate',
      escrowSafety: 'Protected Escrow Balance',
      logoutButton: 'Log Out / Switch Account',
      sendOtp: 'Send OTP Code',
      verifyOtp: 'Verify Code & Sign In',
      loginSuccess: 'Successfully logged in kama',
      registeredSuccess: 'Registration imekamilika! Karibu Soko Smart'
    },
    languagePref: {
      title: 'Language Preferences / Chaguo la Lugha',
      subtitle: 'Set language preference yako for app interface na automated WhatsApp bot messages',
      chooseLabel: 'Select preferred communication language:',
      savedAlert: 'Language preferences updated!',
      options: {
        swahili: {
          name: 'Kiswahili Sanifu',
          badge: 'Rasmi',
          desc: 'Kiswahili sanifu kwa makubaliano na maelewano rasmi ya kibiashara.',
          preview: 'Habari John Kamau! Agizo lako la mifuko 20 ya saruji limeunganishwa na bei imeshuka hadi KSh 660.'
        },
        sheng: {
          name: 'Sheng ya Mtaa',
          badge: 'Nairobi Slang',
          desc: 'Sheng ya mtaa for fast updates na connection ya base.',
          preview: 'Niaje John Kamau! Mzigo wako wa saruji mifuko 20 umeshikana na mabeste, bei imedrop hadi KSh 660.'
        },
        english: {
          name: 'English (Commercial)',
          badge: 'B2B Standard',
          desc: 'Formal commercial language for invoices, order sheets, and agreements.',
          preview: 'Hello John Kamau! Your pooled order for 20 bags of cement has been consolidated at KSh 660 per bag.'
        },
        mixed: {
          name: 'Kiswahili + English (Mixed)',
          badge: 'Market Favorite',
          desc: 'Everyday Kenyan combination ya Kiswahili na English for comfortable communication.',
          preview: 'Habari John! Your order ya mifuko 20 ya cement imekuwa pooled na suppliers wamekubali KSh 660.'
        }
      }
    },
    common: {
      verified: 'Verified',
      changeLanguage: 'Change Language',
      loggedInAs: 'Logged in as',
      switchUser: 'Switch',
      currency: 'KSh'
    }
  }
};

export function getTranslations(lang: Language): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.english;
}
