import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-fetch";
import { useTags } from "@/hooks/useClients";
import { useEmailLog } from "@/hooks/useDashboard";
import { useTherapist } from "@/lib/config/therapist-context";
import { DEFAULT_CONFIG } from "@/lib/config/therapist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Tag, Mail, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import type { Tag as TagType } from "@/lib/types/database.types";

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  status: "Estado",
  service: "Serviço",
  segment: "Segmento",
  custom: "Personalizada",
};

const CATEGORY_ORDER: TagType["category"][] = [
  "status",
  "service",
  "segment",
  "custom",
];

const EMAIL_TYPE_LABELS: Record<string, string> = {
  anamnesis: "Anamnese",
  intake_healing: "Intake Healing",
  intake_immersion: "Intake Imersão",
  satisfaction: "Satisfação",
  review_request: "Pedido de Review",
  reminder: "Lembrete",
  pre_session_reminder: "Reminder Pré-Sessão",
  post_session_checkin: "Check-In Pós-Sessão",
  rebooking: "Reagendamento",
  reactivation: "Reativação",
};

const EMAIL_STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  sent: {
    label: "Enviado",
    icon: <Mail className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-800",
  },
  delivered: {
    label: "Entregue",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-100 text-green-800",
  },
  opened: {
    label: "Aberto",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-emerald-100 text-emerald-800",
  },
  bounced: {
    label: "Devolvido",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-100 text-red-800",
  },
  failed: {
    label: "Falhou",
    icon: <AlertCircle className="h-3 w-3" />,
    className: "bg-red-100 text-red-800",
  },
};

const PRESET_COLORS = [
  DEFAULT_CONFIG.colors.primary, // primary purple
  "#B8860B", // dark goldenrod
  "#2E7D32", // green
  "#1565C0", // blue
  "#C62828", // red
  "#6A1B9A", // deep purple
  "#00695C", // teal
  "#E65100", // orange
  "#4E342E", // brown
  "#37474F", // blue-grey
];

// ─── Add Tag Dialog ──────────────────────────────────────────────────────────

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; category: string; color: string }) => void;
  isPending: boolean;
}

function AddTagDialog({ open, onOpenChange, onSubmit, isPending }: AddTagDialogProps) {
  const config = useTherapist();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("custom");
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, color });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName("");
      setCategory("custom");
      setColor(PRESET_COLORS[0]);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Etiqueta</DialogTitle>
            <DialogDescription>
              Crie uma nova etiqueta para organizar os seus clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Nome</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: VIP, Gravidez, Lisboa..."
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tag-category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="tag-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "white" : "transparent",
                      boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                    }}
                    aria-label={`Cor ${c}`}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-14 cursor-pointer p-0 border rounded"
                  aria-label="Cor personalizada"
                />
                <span className="text-xs text-muted-foreground">Ou escolha uma cor personalizada</span>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-1.5">
              <Label>Pré-visualização</Label>
              <div>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${color}20`, color }}
                  className="text-sm font-medium border"
                >
                  {name || "Nome da etiqueta"}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              style={{ backgroundColor: config.colors.primary }}
              className="text-white hover:opacity-90"
            >
              {isPending ? "A criar..." : "Criar Etiqueta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tag Group ───────────────────────────────────────────────────────────────

interface TagGroupProps {
  category: TagType["category"];
  tags: TagType[];
}

function TagGroup({ category, tags }: TagGroupProps) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {CATEGORY_LABELS[category]}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            style={
              tag.color
                ? { backgroundColor: `${tag.color}20`, color: tag.color }
                : undefined
            }
            className="text-sm font-medium"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Settings() {
  const config = useTherapist();
  const [addTagOpen, setAddTagOpen] = useState(false);
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: emailLog, isLoading: emailLoading } = useEmailLog();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; category: string; color: string }) =>
      adminFetch<{ id: string; name: string }>("/api/tags", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setAddTagOpen(false);
      toast({ title: "Etiqueta criada com sucesso" });
    },
    onError: (err: unknown) => {
      toast({
        title: "Erro ao criar etiqueta",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const tagsByCategory = CATEGORY_ORDER.reduce<Record<string, TagType[]>>(
    (acc, cat) => {
      acc[cat] = (tags ?? []).filter((t) => t.category === cat);
      return acc;
    },
    {}
  );

  const totalTags = tags?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie o perfil, etiquetas e preferências do sistema.
        </p>
      </div>

      {/* Grid: 1 col mobile / 2 cols tablet+ */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

        {/* Profile section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" style={{ color: config.colors.primary }} />
              Perfil
            </CardTitle>
            <CardDescription>
              Informação da conta — apenas leitura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
                style={{ backgroundColor: config.colors.primary }}
                aria-hidden="true"
              >
                DA
              </div>
              <div>
                <p className="font-semibold text-base">Daniela Alves</p>
                <p className="text-sm text-muted-foreground">Administradora</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Nome
                </Label>
                <p className="text-sm font-medium">Daniela Alves</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <p className="text-sm font-medium">daniela@danielaalves.pt</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Função
                </Label>
                <p className="text-sm font-medium">Terapeuta / Administradora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: config.colors.primary }} />
              Últimos Emails Enviados
            </CardTitle>
            <CardDescription>Os 10 emails mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {emailLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !emailLog || emailLog.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum email enviado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {emailLog.map((entry) => {
                  const statusConfig =
                    EMAIL_STATUS_CONFIG[entry.status] ?? EMAIL_STATUS_CONFIG.sent;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.client_name.trim()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {EMAIL_TYPE_LABELS[entry.email_type] ?? entry.email_type}
                          {" · "}
                          {format(new Date(entry.sent_at), "d MMM, HH:mm", {
                            locale: pt,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`flex items-center gap-1 ml-2 flex-shrink-0 ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags management — full width on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" style={{ color: config.colors.primary }} />
                  Etiquetas
                </CardTitle>
                <CardDescription>
                  {totalTags > 0
                    ? `${totalTags} etiqueta(s) — organizadas por categoria`
                    : "Gerencie as etiquetas para classificar clientes"}
                </CardDescription>
              </div>
              <Button
                onClick={() => setAddTagOpen(true)}
                size="sm"
                style={{ backgroundColor: config.colors.primary }}
                className="text-white hover:opacity-90 flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nova Etiqueta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tagsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !tags || tags.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Tag className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Ainda não existem etiquetas. Crie a primeira.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddTagOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Criar Etiqueta
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {CATEGORY_ORDER.map((cat) => (
                  <TagGroup
                    key={cat}
                    category={cat}
                    tags={tagsByCategory[cat] ?? []}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add tag dialog */}
      <AddTagDialog
        open={addTagOpen}
        onOpenChange={setAddTagOpen}
        onSubmit={(data) => createTagMutation.mutate(data)}
        isPending={createTagMutation.isPending}
      />
    </div>
  );
}
