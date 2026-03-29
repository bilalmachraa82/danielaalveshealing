import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClients } from "@/hooks/useClients";
import { useCreateSession } from "@/hooks/useSessions";
import {
  createSessionSchema,
  type CreateSessionInput,
} from "@/lib/schemas/session.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

async function sendForms(
  clientId: string,
  sessionId: string,
  serviceType: string
): Promise<void> {
  const response = await fetch("/api/forms/emails/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      session_id: sessionId,
      service_type: serviceType,
      send_anamnesis: true,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao enviar emails: ${response.status}`);
  }
}

const SERVICE_OPTIONS = [
  { value: "healing_wellness", label: "Sessão Healing Touch", price: 15000 },
  { value: "pura_radiancia", label: "Imersão Pura Radiância", price: 45000 },
  { value: "pure_earth_love", label: "Pure Earth Love", price: 8000 },
  { value: "other", label: "Outro", price: null },
];

export default function SessionCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get("client_id") ?? "";
  const { data: clients } = useClients();
  const createSession = useCreateSession();
  const [sendEmails, setSendEmails] = useState(true);

  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      client_id: preselectedClientId,
      scheduled_at: "",
      duration_minutes: 120,
      service_type: "healing_wellness",
      price_cents: 12200,
      notes: "",
    },
  });

  function handleServiceChange(value: string) {
    form.setValue("service_type", value as CreateSessionInput["service_type"]);
    const option = SERVICE_OPTIONS.find((o) => o.value === value);
    if (option?.price != null) {
      form.setValue("price_cents", option.price);
    }
    if (value === "pura_radiancia") {
      form.setValue("duration_minutes", 180);
    } else {
      form.setValue("duration_minutes", 120);
    }
  }

  async function onSubmit(data: CreateSessionInput) {
    try {
      const session = await createSession.mutateAsync(data);

      if (sendEmails) {
        try {
          await sendForms(session.client_id, session.id, session.service_type);
          toast.success("Sessão criada e questionários enviados!");
        } catch (emailError: unknown) {
          // Session was created successfully; email failure is non-fatal
          toast.success("Sessão criada!");
          toast.error(
            emailError instanceof Error
              ? emailError.message
              : "Erro ao enviar questionários por email"
          );
        }
      } else {
        toast.success("Sessão criada!");
      }

      navigate("/admin/sessoes");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar sessão"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/sessoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">Nova Sessão</h1>
          <p className="text-muted-foreground">
            Agendar uma nova sessão para um cliente
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Sessão</CardTitle>
              <CardDescription>
                Selecione o cliente e os detalhes da marcação
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Cliente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cliente..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name ?? ""}{" "}
                            {client.email
                              ? `(${client.email})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Serviço *</FormLabel>
                    <Select
                      onValueChange={handleServiceChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduled_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_cents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={
                          field.value != null
                            ? (field.value / 100).toFixed(2)
                            : ""
                        }
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(
                            isNaN(val) ? undefined : Math.round(val * 100)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Notas pré-sessão..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground">
              <Checkbox
                checked={sendEmails}
                onCheckedChange={(checked) => setSendEmails(checked === true)}
                id="send-emails-checkbox"
                aria-label="Enviar questionários por email após criar"
              />
              <span>Enviar questionários por email após criar</span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" type="button" asChild>
                <Link to="/admin/sessoes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={createSession.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createSession.isPending ? "A guardar..." : "Agendar Sessão"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
