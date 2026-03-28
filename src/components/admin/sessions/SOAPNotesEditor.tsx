import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sessionNoteSchema,
  type SessionNoteInput,
} from "@/lib/schemas/session.schema";
import {
  useSessionNotes,
  useUpsertSessionNote,
} from "@/hooks/useSessions";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BodyMap } from "./BodyMap";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { BodyMapMarker } from "@/lib/types/database.types";

interface SOAPNotesEditorProps {
  sessionId: string;
  readOnly?: boolean;
}

export function SOAPNotesEditor({
  sessionId,
  readOnly = false,
}: SOAPNotesEditorProps) {
  const { data: existingNote, isLoading } = useSessionNotes(sessionId);
  const upsertNote = useUpsertSessionNote();

  const form = useForm<SessionNoteInput>({
    resolver: zodResolver(sessionNoteSchema),
    defaultValues: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      body_map_data: [],
    },
  });

  useEffect(() => {
    if (existingNote) {
      form.reset({
        subjective: existingNote.subjective ?? "",
        objective: existingNote.objective ?? "",
        assessment: existingNote.assessment ?? "",
        plan: existingNote.plan ?? "",
        body_map_data: existingNote.body_map_data ?? [],
      });
    }
  }, [existingNote, form]);

  async function onSubmit(data: SessionNoteInput) {
    try {
      await upsertNote.mutateAsync({ sessionId, data });
      toast.success("Notas guardadas com sucesso");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao guardar notas"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notas da Sessão (SOAP)</CardTitle>
            <CardDescription>
              Registe as observações clínicas desta sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion
              type="multiple"
              defaultValue={["subjective", "objective", "assessment", "plan", "bodymap"]}
              className="space-y-2"
            >
              <AccordionItem value="subjective">
                <AccordionTrigger className="text-sm font-medium">
                  S — Subjetivo
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="subjective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Queixa do cliente, nível de dor (0-10), alterações
                          desde a última sessão
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="O que o cliente reporta..."
                            rows={3}
                            readOnly={readOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="objective">
                <AccordionTrigger className="text-sm font-medium">
                  O — Objetivo
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Técnicas aplicadas, áreas trabalhadas,
                          pressão/duração, observações clínicas
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="O que foi observado e aplicado..."
                            rows={3}
                            readOnly={readOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="assessment">
                <AccordionTrigger className="text-sm font-medium">
                  A — Avaliação
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="assessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Impressão clínica, progresso, resposta ao
                          tratamento
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Avaliação e progresso..."
                            rows={3}
                            readOnly={readOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plan">
                <AccordionTrigger className="text-sm font-medium">
                  P — Plano
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Próximos passos, cuidados em casa, frequência
                          recomendada, referências
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Plano de follow-up..."
                            rows={3}
                            readOnly={readOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bodymap">
                <AccordionTrigger className="text-sm font-medium">
                  Mapa Corporal
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="body_map_data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Clique nas zonas do corpo para marcar
                          dor/desconforto
                        </FormLabel>
                        <FormControl>
                          <BodyMap
                            value={field.value as BodyMapMarker[]}
                            onChange={field.onChange}
                            readOnly={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={upsertNote.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {upsertNote.isPending ? "A guardar..." : "Guardar Notas"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
