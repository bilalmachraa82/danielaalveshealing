export interface ServiceConfig {
  readonly id: string;
  readonly namePt: string;
  readonly nameEn: string;
  readonly descriptionPt: string;
  readonly descriptionEn: string;
  readonly priceCents: number;
  readonly priceDisplay: string;
  readonly durationMinutes: number;
  readonly calendarColorId: string;
  readonly whatsappMessagePt: string;
  readonly whatsappMessageEn: string;
}

export interface TherapistConfig {
  readonly name: string;
  readonly tagline: string;
  readonly fullBusinessName: string;
  readonly email: string;
  readonly phone: string;
  readonly phoneFormatted: string;
  readonly whatsappBase: string;
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly postal: string;
    readonly country: string;
    readonly full: string;
    readonly mapsUrl: string;
  };
  readonly parking: {
    readonly pt: string;
    readonly en: string;
  };
  readonly entryInstructions: {
    readonly pt: string;
    readonly en: string;
  };
  readonly preparationTips: {
    readonly pt: string;
    readonly en: string;
  };
  readonly colors: {
    readonly primary: string;
    readonly primaryHover: string;
    readonly secondary: string;
    readonly background: string;
  };
  readonly fonts: {
    readonly heading: string;
    readonly body: string;
  };
  readonly logo: {
    readonly src: string;
    readonly alt: string;
  };
  readonly quotes: {
    readonly main: {
      readonly pt: string;
      readonly en: string;
    };
    readonly author: string;
  };
  readonly socialLinks: {
    readonly instagram: string;
    readonly youtube: string;
    readonly googleReview: string;
  };
  readonly services: readonly ServiceConfig[];
  readonly localStoragePrefix: string;
}

export const DEFAULT_CONFIG: TherapistConfig = {
  name: "Daniela Alves",
  tagline: "Beyond the Body",
  fullBusinessName: "Daniela Alves — Beyond the Body",
  email: "daniela@danielaalveshealing.com",
  phone: "351914173445",
  phoneFormatted: "+351 914 173 445",
  whatsappBase: "https://wa.me/351914173445",
  address: {
    street: "R. do Regueiro do Tanque 3",
    city: "Fontanelas, São João das Lampas",
    postal: "2705-415 Sintra",
    country: "Portugal",
    full: "R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra",
    mapsUrl:
      "https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+S%C3%A3o+Jo%C3%A3o+das+Lampas,+2705-415+Sintra",
  },
  parking: {
    pt: "Parque da Aguda (indicado na chegada).",
    en: "Parque da Aguda (signposted on arrival).",
  },
  entryInstructions: {
    pt: "Entre pelo portão, não toque na campainha. Siga o caminho até à casa de madeira.",
    en: "Enter through the gate, no need to ring the doorbell. Follow the path to the wooden house.",
  },
  preparationTips: {
    pt: "Sem perfume no dia da sessão. Refeição leve nas 24h anteriores. Mantenha-se hidratada e evite estimulantes (café, álcool). Não há chuveiro disponível.",
    en: "No perfume on the day of the session. Light meals in the 24 hours before. Stay hydrated and avoid stimulants (coffee, alcohol). No shower available.",
  },
  colors: {
    primary: "#96568A",
    primaryHover: "#7D4873",
    secondary: "#B48D53",
    background: "#F6F5EE",
  },
  fonts: {
    heading: "Quincy CF",
    body: "Museo Sans",
  },
  logo: {
    src: "/images/logo.webp",
    alt: "Daniela Alves - Terapeuta Holística em Sintra",
  },
  quotes: {
    main: {
      pt: "Quando o corpo relaxa e harmoniza, o Ser cria condições para regressar à sua mais genuína Expressão.",
      en: "When the body relaxes and harmonises, the Being creates the conditions to return to its most genuine Expression.",
    },
    author: "Daniela Alves",
  },
  socialLinks: {
    instagram: "https://www.instagram.com/danielaalves_healing/",
    youtube:
      "https://www.youtube.com/@danielaalves-healingwellness",
    googleReview: "https://g.page/r/danielaalveshealing/review",
  },
  services: [
    {
      id: "healing_wellness",
      namePt: "Sessão Healing Touch",
      nameEn: "Healing Touch Session",
      descriptionPt:
        "Sessão terapêutica personalizada para promover um equilíbrio e bem-estar profundos.",
      descriptionEn:
        "Personalized therapeutic session to promote deep balance and well-being.",
      priceCents: 15000,
      priceDisplay: "150€",
      durationMinutes: 120,
      calendarColorId: "3",
      whatsappMessagePt:
        "Olá Daniela, gostaria de agendar uma Sessão Healing Touch.",
      whatsappMessageEn:
        "Hello Daniela, I would like to book a Healing Touch Session.",
    },
    {
      id: "pura_radiancia",
      namePt: "Imersão Pura Radiância",
      nameEn: "Pura Radiance Immersion",
      descriptionPt:
        "Uma experiência exclusiva de pura nutrição e cuidado, com mais tempo para Relaxar, Recentrar e Reconectar.",
      descriptionEn:
        "An exclusive experience of pure nourishment and care, with more time to Relax, Recenter and Reconnect.",
      priceCents: 45000,
      priceDisplay: "450€",
      durationMinutes: 360,
      calendarColorId: "5",
      whatsappMessagePt:
        "Olá Daniela, gostaria de saber mais sobre a Imersão Pura Radiância.",
      whatsappMessageEn:
        "Hello Daniela, I would like to know more about the Pure Radiance Immersion.",
    },
    {
      id: "pure_earth_love",
      namePt: "Pure Earth Love",
      nameEn: "Pure Earth Love",
      descriptionPt:
        "Produtos de Aromaterapia exclusivos e personalizados. Este é Puro Amor da Terra para si!",
      descriptionEn:
        "Exclusive and personalized Aromatherapy products. This is Pure Earth Love for you!",
      priceCents: 8000,
      priceDisplay: "80€",
      durationMinutes: 90,
      calendarColorId: "10",
      whatsappMessagePt:
        "Olá Daniela, gostaria de saber mais sobre os produtos Pure Earth Love.",
      whatsappMessageEn:
        "Hello Daniela, I would like to know more about Pure Earth Love products.",
    },
    {
      id: "home_harmony",
      namePt: "Home Harmony",
      nameEn: "Home Harmony",
      descriptionPt:
        "Harmonização energética de espaços para promover bem-estar e equilíbrio no seu lar ou local de trabalho.",
      descriptionEn:
        "Energetic space harmonization to promote well-being and balance in your home or workplace.",
      priceCents: 0,
      priceDisplay: "Sob consulta",
      durationMinutes: 180,
      calendarColorId: "7",
      whatsappMessagePt:
        "Olá Daniela, gostaria de agendar uma Sessão Descoberta para o Home Harmony.",
      whatsappMessageEn:
        "Hello Daniela, I would like to book a Discovery Session for Home Harmony.",
    },
    {
      id: "other",
      namePt: "Sessão",
      nameEn: "Session",
      descriptionPt: "Sessão terapêutica personalizada.",
      descriptionEn: "Personalized therapeutic session.",
      priceCents: 0,
      priceDisplay: "Sessão",
      durationMinutes: 120,
      calendarColorId: "8",
      whatsappMessagePt:
        "Olá Daniela, gostaria de agendar uma sessão.",
      whatsappMessageEn:
        "Hello Daniela, I would like to book a session.",
    },
  ],
  localStoragePrefix: "daniela-crm",
} as const;
