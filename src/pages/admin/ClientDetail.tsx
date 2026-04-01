import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Sparkles,
} from "lucide-react";

import WellnessProgress from "@/components/admin/clients/WellnessProgress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClient, useClientTags, useClientTimeline } from "@/hooks/useClients";
import { useSessions } from "@/hooks/useSessions";

const SERVICE_LABELS: Record<string, string> = {
  healing_wellness: "Healing Touch",
  pura_radiancia: "Pura Radiância",
  pure_earth_love: "Pure Earth Love",
  home_harmony: "Home Harmony",
  other: "Outro",
};

const TIMELINE_BADGE_LABELS: Record<string, string> = {
  session: "Sessão",
  form: "Formulário",
  communication: "Comunicação",
  consent: "Consentimento",
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return format(new Date(value), "d MMM yyyy, HH:mm", {
    locale: pt,
  });
}

function formatChannelSummary(label: string, value: boolean | undefined) {
  return `${label}: ${value ? "sim" : "não"}`;
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useClient(id);
  const { data: tags } = useClientTags(id);
  const { data: timeline } = useClientTimeline(id);
  const { data: sessions } = useSessions({ client_id: id });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Button asChild className="mt-4">
          <Link to="/admin/clientes">Voltar</Link>
        </Button>
      </div>
    );
  }

  const communicationPreferences = [
    formatChannelSummary("Email de serviço", client.service_consent_email),
    formatChannelSummary("SMS de serviço", client.service_consent_sms),
    formatChannelSummary("WhatsApp de serviço", client.service_consent_whatsapp),
  ];

  const marketingPreferences = [
    formatChannelSummary("Email marketing", client.marketing_consent_email),
    formatChannelSummary("SMS marketing", client.marketing_consent_sms),
    formatChannelSummary("WhatsApp marketing", client.marketing_consent_whatsapp),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-semibold">
              {client.first_name} {client.last_name ?? ""}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde{" "}
              {format(new Date(client.created_at), "MMMM yyyy", {
                locale: pt,
              })}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/admin/clientes/${id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {client.city}
                    {client.country ? `, ${client.country}` : ""}
                  </span>
                </div>
              )}
              {client.date_of_birth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(client.date_of_birth), "d MMMM yyyy", {
                      locale: pt,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perfil de Comunicação</CardTitle>
              <CardDescription>
                Preferências para idioma, canal e mensagens de serviço.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>
                  Idioma preferido:{" "}
                  <strong>{client.preferred_language === "en" ? "EN" : "PT"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span>
                  Canal preferido:{" "}
                  <strong>{client.preferred_channel ?? "email"}</strong>
                </span>
              </div>
              <div>
                <p className="font-medium">Canais de serviço</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {communicationPreferences.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-medium">Canais de marketing</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {marketingPreferences.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consentimentos</CardTitle>
              <CardDescription>
                Estado atual e registos principais de consentimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">RGPD</span>
                <Badge variant={client.consent_data_processing ? "default" : "outline"}>
                  {client.consent_data_processing ? "Aceite" : "Em falta"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Dados de saúde</span>
                <Badge variant={client.consent_health_data ? "default" : "outline"}>
                  {client.consent_health_data ? "Aceite" : "Em falta"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Marketing</span>
                <Badge variant={client.consent_marketing ? "default" : "outline"}>
                  {client.consent_marketing ? "Aceite" : "Não"}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Versão: {client.consent_version ?? "2026-04"}</p>
                <p>Consentimento RGPD: {formatDateTime(client.consent_given_at)}</p>
                <p>
                  Consentimento saúde: {formatDateTime(client.consent_health_data_at)}
                </p>
                <p>Última atualização: {formatDateTime(client.consent_updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {client.profession && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profissão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{client.profession}</p>
              </CardContent>
            </Card>
          )}

          {tags && tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      color: tag.color ?? undefined,
                      borderColor: tag.color ?? undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 md:col-span-2">
          <WellnessProgress clientId={id} />

          <Card>
            <CardHeader>
              <CardTitle>Timeline do Cliente</CardTitle>
              <CardDescription>
                Sessões, formulários, comunicações e consentimentos numa vista única.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!timeline || timeline.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Ainda não existe histórico detalhado para este cliente.
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {TIMELINE_BADGE_LABELS[event.type] ?? event.type}
                            </Badge>
                            {event.channel && (
                              <Badge variant="secondary">{event.channel}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{formatDateTime(event.occurred_at)}</p>
                          {event.status && <p className="mt-1 uppercase">{event.status}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sessões</CardTitle>
                <CardDescription>
                  Histórico de sessões deste cliente
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link to={`/admin/sessoes/nova?client_id=${client.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Sessão
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!sessions || sessions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma sessão registada
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      to={`/admin/sessoes/${session.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {SERVICE_LABELS[session.service_type] ?? session.service_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.scheduled_at), "d MMMM yyyy, HH:mm", {
                            locale: pt,
                          })}
                        </p>
                      </div>
                      <Badge variant="outline">{session.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
