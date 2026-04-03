import { format } from "date-fns";
import { pt, enGB } from "date-fns/locale";
import type {
  ClientKind,
  ClientGender,
  ExtendedServiceType,
  PreferredLanguage,
} from "./types";

const SERVICE_LABELS: Record<
  ExtendedServiceType,
  Record<PreferredLanguage, string>
> = {
  healing_wellness: {
    pt: "Sessão Healing Touch",
    en: "Healing Touch Session",
  },
  pura_radiancia: {
    pt: "Imersão Pura Radiância",
    en: "Pura Radiance Immersion",
  },
  pure_earth_love: {
    pt: "Pure Earth Love",
    en: "Pure Earth Love",
  },
  home_harmony: {
    pt: "Home Harmony",
    en: "Home Harmony",
  },
  other: {
    pt: "Sessão",
    en: "Session",
  },
};

function getWelcomeBackLine(
  language: PreferredLanguage,
  gender?: ClientGender | null
) {
  if (language === "en") {
    return "It will be lovely to welcome you back.";
  }

  if (gender === "female") return "Que bom voltar a recebê-la.";
  if (gender === "male") return "Que bom voltar a recebê-lo.";
  return "Que bom voltar a recebê-la(o).";
}

export function getLocalizedServiceLabel(
  serviceType: ExtendedServiceType | string,
  language: PreferredLanguage
) {
  return SERVICE_LABELS[serviceType as ExtendedServiceType]?.[language] ??
    SERVICE_LABELS.other[language];
}

export function formatSessionDateForLanguage(
  isoString: string,
  language: PreferredLanguage
) {
  const date = new Date(isoString);
  if (language === "en") {
    return format(date, "d MMMM, HH:mm", { locale: enGB });
  }
  return format(date, "d 'de' MMMM, HH:mm", { locale: pt });
}

export function buildBookingWhatsAppCopy(input: {
  clientName: string;
  preferredLanguage: PreferredLanguage;
  clientKind: ClientKind;
  serviceLabel: string;
  formattedDate: string;
  prepareUrl: string;
  gender?: ClientGender | null;
}) {
  if (input.preferredLanguage === "en") {
    if (input.clientKind === "new") {
      return [
        `Hello ${input.clientName}!`,
        "",
        `Welcome to Daniela Alves Healing & Harmony.`,
        `Your ${input.serviceLabel} is booked for ${input.formattedDate}.`,
        "",
        `Please complete this short preparation form:`,
        input.prepareUrl,
      ].join("\n");
    }

    return [
      `Hello ${input.clientName}!`,
      "",
      `${getWelcomeBackLine("en", input.gender)}`,
      `Your ${input.serviceLabel} is booked for ${input.formattedDate}.`,
      "",
      `Please complete your short check-in here:`,
      input.prepareUrl,
    ].join("\n");
  }

  if (input.clientKind === "new") {
    return [
      `Olá ${input.clientName}!`,
      "",
      "Bem-vinda(o) ao espaço Daniela Alves Healing & Wellness.",
      `A sua ${input.serviceLabel} está agendada para ${input.formattedDate}.`,
      "",
      "Peço-lhe que preencha este breve formulário de preparação:",
      input.prepareUrl,
    ].join("\n");
  }

  return [
    `Olá ${input.clientName}!`,
    "",
    getWelcomeBackLine("pt", input.gender),
    `A sua ${input.serviceLabel} está agendada para ${input.formattedDate}.`,
    "",
    "Peço-lhe que preencha este breve check-in aqui:",
    input.prepareUrl,
  ].join("\n");
}

export function buildPreparationEmailContent(input: {
  firstName: string;
  preferredLanguage: PreferredLanguage;
  clientKind: ClientKind;
  serviceLabel: string;
  prepareUrl: string;
}) {
  if (input.preferredLanguage === "en") {
    return {
      title:
        input.clientKind === "new"
          ? "Preparation For Your Session"
          : "A Quick Check-In Before Your Session",
      subject:
        input.clientKind === "new"
          ? "Preparation for your session — Daniela Alves"
          : "A quick check-in before your session — Daniela Alves",
      paragraphs:
        input.clientKind === "new"
          ? [
              `Hello ${input.firstName},`,
              `Your ${input.serviceLabel} is almost here.`,
              "Please complete this short preparation form so Daniela can tailor the experience to you with care.",
            ]
          : [
              `Hello ${input.firstName},`,
              "It will be lovely to welcome you back soon.",
              "Please complete this short check-in so Daniela can prepare the session around how you are feeling now.",
            ],
      ctaText:
        input.clientKind === "new"
          ? "Complete Preparation Form"
          : "Complete Quick Check-In",
      ctaUrl: input.prepareUrl,
    };
  }

  return {
    title:
      input.clientKind === "new"
        ? "Preparação Para A Sua Sessão"
        : "Check-In Rápido Antes Da Sua Sessão",
    subject:
      input.clientKind === "new"
        ? "Preparação para a sua sessão — Daniela Alves"
        : "Check-in rápido antes da sua sessão — Daniela Alves",
    paragraphs:
      input.clientKind === "new"
        ? [
            `Olá ${input.firstName},`,
            `A sua ${input.serviceLabel} está a aproximar-se.`,
            "Peço-lhe que preencha este breve formulário de preparação para que a Daniela possa personalizar a experiência com todo o cuidado.",
          ]
        : [
            `Olá ${input.firstName},`,
            "Que bom voltar a recebê-la(o) em breve.",
            "Peço-lhe que preencha este breve check-in para que a Daniela prepare a sessão de acordo com a forma como se sente neste momento.",
          ],
    ctaText:
      input.clientKind === "new"
        ? "Preencher Preparação"
        : "Preencher Check-In",
    ctaUrl: input.prepareUrl,
  };
}

export function buildAnamnesisEmailContent(input: {
  firstName: string;
  preferredLanguage: PreferredLanguage;
  anamnesisUrl: string;
}) {
  if (input.preferredLanguage === "en") {
    return {
      title: "Your Health Form",
      subject: "Health Form before your session — Daniela Alves",
      paragraphs: [
        `Hello ${input.firstName},`,
        "Before your first session, please complete this health form so Daniela can understand your needs with care and prepare a safe, tailored experience.",
        "It only takes a few minutes and helps make your session more aligned with you.",
      ],
      ctaText: "Complete Health Form",
      ctaUrl: input.anamnesisUrl,
    };
  }

  return {
    title: "A Sua Ficha de Saúde",
    subject: "Ficha de saúde antes da sua sessão — Daniela Alves",
    paragraphs: [
      `Olá ${input.firstName},`,
      "Antes da sua primeira sessão, peço-lhe que preencha esta ficha de saúde para que a Daniela possa compreender as suas necessidades com todo o cuidado e preparar uma experiência segura e personalizada.",
      "Demora apenas alguns minutos e ajuda a alinhar a sessão consigo.",
    ],
    ctaText: "Preencher Ficha de Saúde",
    ctaUrl: input.anamnesisUrl,
  };
}

export function buildPreSessionReminderEmailContent(input: {
  firstName: string;
  preferredLanguage: PreferredLanguage;
  serviceLabel: string;
  formattedDate: string;
  manageUrl?: string;
}) {
  if (input.preferredLanguage === "en") {
    return {
      title: "A Gentle Reminder For Tomorrow",
      subject: "A reminder for your upcoming session — Daniela Alves",
      paragraphs: [
        `Hello ${input.firstName},`,
        `This is a gentle reminder of your ${input.serviceLabel} on ${input.formattedDate}.`,
        "If you need to make any adjustment, Daniela can support you from the app workflow.",
      ],
      ctaText: input.manageUrl ? "Manage Session" : undefined,
      ctaUrl: input.manageUrl,
    };
  }

  return {
    title: "Um Lembrete Suave Para Amanhã",
    subject: "Lembrete da sua próxima sessão — Daniela Alves",
    paragraphs: [
      `Olá ${input.firstName},`,
      `Este é um lembrete suave da sua ${input.serviceLabel} em ${input.formattedDate}.`,
      "Se precisar de algum ajuste, a Daniela poderá apoiar a gestão da marcação a partir do fluxo da app.",
    ],
    ctaText: input.manageUrl ? "Gerir Marcação" : undefined,
    ctaUrl: input.manageUrl,
  };
}
