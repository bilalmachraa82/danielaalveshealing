import { useParams, Link } from "react-router-dom";
import { useClient, useClientTags } from "@/hooks/useClients";
import { useSessions } from "@/hooks/useSessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import WellnessProgress from "@/components/admin/clients/WellnessProgress";

const SERVICE_LABELS: Record<string, string> = {
  healing_wellness: "Healing Touch",
  pura_radiancia: "Pura Radiância",
  pure_earth_love: "Pure Earth Love",
  other: "Outro",
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useClient(id);
  const { data: tags } = useClientTags(id);
  const { data: sessions } = useSessions({ client_id: id });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Button asChild className="mt-4">
          <Link to="/admin/clientes">Voltar</Link>
        </Button>
      </div>
    );
  }

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
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${client.email}`}
                    className="hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${client.phone}`}
                    className="hover:underline"
                  >
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
                    {format(
                      new Date(client.date_of_birth),
                      "d MMMM yyyy",
                      { locale: pt }
                    )}
                  </span>
                </div>
              )}
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
                      backgroundColor: tag.color
                        ? `${tag.color}20`
                        : undefined,
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
                <p className="text-sm whitespace-pre-wrap">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <WellnessProgress clientId={id} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sessões</CardTitle>
                <CardDescription>
                  Histórico de sessões deste cliente
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link
                  to={`/admin/sessoes/nova?client_id=${client.id}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Sessão
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!sessions || sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma sessão registada
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      to={`/admin/sessoes/${session.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {SERVICE_LABELS[session.service_type] ??
                            session.service_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(session.scheduled_at),
                            "d MMMM yyyy, HH:mm",
                            { locale: pt }
                          )}
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
