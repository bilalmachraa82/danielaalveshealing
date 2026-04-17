import type { ClientTimelineEvent } from "../types/database.types.js";

const SESSION_ACTION_LABELS: Record<string, string> = {
  created: "Sessão criada",
  confirmed: "Sessão confirmada",
  rescheduled: "Sessão remarcada",
  cancelled: "Sessão cancelada",
  completed: "Sessão concluída",
  no_show: "Não comparência registada",
  reminder_reset: "Reminder pré-sessão reajustado",
};

const EMAIL_TYPE_LABELS: Record<string, string> = {
  anamnesis: "Anamnese enviada",
  intake_healing: "Questionário Healing Touch enviado",
  intake_immersion: "Questionário Pura Radiância enviado",
  satisfaction: "Questionário de satisfação enviado",
  review_request: "Pedido de review enviado",
  reminder: "Reminder enviado",
  pre_session_reminder: "Reminder pré-sessão enviado",
  post_session_checkin: "Check-in pós-sessão enviado",
  rebooking: "Convite de rebooking enviado",
  reactivation: "Reativação enviada",
};

export function buildClientTimeline(events: ClientTimelineEvent[]) {
  return [...events]
    .filter((event) => Boolean(event.occurred_at))
    .sort(
      (left, right) =>
        new Date(right.occurred_at).getTime() -
        new Date(left.occurred_at).getTime()
    );
}

export function getSessionActionTimelineTitle(action: string) {
  return SESSION_ACTION_LABELS[action] ?? "Atualização de sessão";
}

export function getEmailTimelineTitle(emailType: string) {
  return EMAIL_TYPE_LABELS[emailType] ?? "Comunicação enviada";
}
