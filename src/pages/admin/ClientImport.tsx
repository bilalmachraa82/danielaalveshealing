import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Upload, Plus, Trash2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useClients } from "@/hooks/useClients";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedClient {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  profession?: string;
  notes?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

interface QuickEntry {
  id: string;
  first_name: string;
  phone: string;
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

const CSV_HEADERS = ["nome", "apelido", "email", "telefone", "data_nascimento", "profissao", "notas"];

function downloadTemplate() {
  const sample = [
    CSV_HEADERS.join(","),
    "Maria,Silva,maria@email.com,+351912345678,1985-03-15,Professora,Cliente recomendada",
  ].join("\n");

  const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_clientes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): ParsedClient[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const cols = parseCsvLine(line);
    return {
      first_name: cols[0] ?? "",
      last_name: cols[1] ?? undefined,
      email: cols[2] ?? undefined,
      phone: cols[3] ?? undefined,
      date_of_birth: cols[4] ?? undefined,
      profession: cols[5] ?? undefined,
      notes: cols[6] ?? undefined,
    };
  }).filter((c) => c.first_name.trim() !== "");
}

// ---------------------------------------------------------------------------
// Tab 1: CSV Upload
// ---------------------------------------------------------------------------

function CsvUploadTab() {
  const [preview, setPreview] = useState<ParsedClient[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const clients = parseCsv(text);
      setPreview(clients);
      setResult(null);
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setIsImporting(true);

    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: preview }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setPreview([]);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      if (data.imported > 0) {
        toast.success(`${data.imported} cliente(s) importado(s) com sucesso`);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao importar");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Descarregar template CSV
        </Button>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Arraste o ficheiro CSV ou clique para selecionar</p>
        <p className="text-xs text-muted-foreground mt-1">Apenas ficheiros .csv</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Selecionar ficheiro CSV"
        />
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Pré-visualização — {preview.length} cliente(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Apelido</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 10).map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.first_name}</TableCell>
                      <TableCell>{c.last_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                      <TableCell>{c.phone ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {preview.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-2">
                        + {preview.length - 10} mais...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {preview.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={isImporting} className="min-h-[44px]">
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? "A importar..." : `Importar ${preview.length} cliente(s)`}
          </Button>
        </div>
      )}

      {/* Result summary */}
      {result && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" className="gap-1">
                {result.imported} importado(s)
              </Badge>
              {result.skipped > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {result.skipped} ignorado(s) (duplicados)
                </Badge>
              )}
              {result.errors.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  {result.errors.length} erro(s)
                </Badge>
              )}
            </div>
            {result.errors.length > 0 && (
              <ul className="text-sm text-destructive space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>Linha {e.row}: {e.error}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Quick Entry
// ---------------------------------------------------------------------------

function QuickEntryTab() {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [entries, setEntries] = useState<QuickEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleAdd = () => {
    const name = firstName.trim();
    if (!name) {
      toast.error("Nome é obrigatório");
      return;
    }
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), first_name: name, phone: phone.trim() },
    ]);
    setFirstName("");
    setPhone("");
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveAll = async () => {
    if (entries.length === 0) return;
    setIsSaving(true);

    const results = await Promise.allSettled(
      entries.map((entry) =>
        fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: entry.first_name,
            phone: entry.phone || null,
            source: "manual",
          }),
        }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    queryClient.invalidateQueries({ queryKey: ["clients"] });
    setEntries([]);
    setIsSaving(false);

    if (succeeded > 0) {
      toast.success(`${succeeded} cliente(s) guardado(s)`);
    }
    if (failed > 0) {
      toast.error(`${failed} cliente(s) falharam`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adicionar cliente</CardTitle>
          <CardDescription>Preencha o nome e telefone e clique em Adicionar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Nome *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="min-h-[44px]"
              aria-label="Nome do cliente"
            />
            <Input
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="min-h-[44px]"
              aria-label="Telefone do cliente"
            />
            <Button onClick={handleAdd} className="min-h-[44px] shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              A adicionar — {entries.length} cliente(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between px-6 py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium">{entry.first_name}</p>
                    {entry.phone && (
                      <p className="text-xs text-muted-foreground">{entry.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(entry.id)}
                    aria-label={`Remover ${entry.first_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {entries.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} disabled={isSaving} className="min-h-[44px]">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "A guardar..." : `Guardar ${entries.length} cliente(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Invite Clients
// ---------------------------------------------------------------------------

function InviteClientsTab() {
  const { data: clients = [], isLoading } = useClients();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  // Clients without completed anamnesis (no consent_given_at)
  const pendingClients = clients.filter(
    (c: { consent_given_at?: string | null; email?: string | null; phone?: string | null }) =>
      !c.consent_given_at && (c.email || c.phone)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === pendingClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingClients.map((c: { id: string }) => c.id)));
    }
  };

  const buildWhatsAppLink = (client: { id: string; first_name: string; phone?: string | null }) => {
    const token = btoa(`${client.id}-invite`);
    const link = `${window.location.origin}/anamnese/${token}`;
    const message = encodeURIComponent(
      `Olá ${client.first_name}! Por favor preencha a sua ficha de anamnese: ${link}`
    );
    const phone = client.phone?.replace(/\D/g, "") ?? "";
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleSendInvites = async () => {
    if (selectedIds.size === 0) return;
    setIsSending(true);

    const selected = pendingClients.filter((c: { id: string }) => selectedIds.has(c.id));
    let opened = 0;

    for (const client of selected) {
      if (client.phone) {
        window.open(buildWhatsAppLink(client), "_blank");
        opened++;
        // Small delay to avoid popup blocker
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setIsSending(false);
    if (opened > 0) {
      toast.success(`${opened} convite(s) abertos no WhatsApp`);
      setSelectedIds(new Set());
    } else {
      toast.info("Nenhum cliente com telefone para enviar WhatsApp");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clientes sem ficha de anamnese</CardTitle>
          <CardDescription>
            {pendingClients.length} cliente(s) ainda não preencheram a ficha de anamnese
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pendingClients.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-8 text-center">
              Todos os clientes já preencheram a sua ficha de anamnese.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === pendingClients.length && pendingClients.length > 0}
                      onCheckedChange={toggleAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                  <TableHead className="w-10 text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingClients.map((client: {
                  id: string;
                  first_name: string;
                  last_name?: string | null;
                  email?: string | null;
                  phone?: string | null;
                }) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(client.id)}
                        onCheckedChange={() => toggleSelect(client.id)}
                        aria-label={`Selecionar ${client.first_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">
                        {client.first_name} {client.last_name ?? ""}
                      </p>
                      {client.email && (
                        <p className="text-xs text-muted-foreground sm:hidden">{client.email}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {client.phone ?? client.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {client.phone && (
                        <a
                          href={buildWhatsAppLink(client)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-accent"
                          aria-label={`WhatsApp para ${client.first_name}`}
                        >
                          <Send className="h-4 w-4 text-primary" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSendInvites} disabled={isSending} className="min-h-[44px]">
            <Send className="h-4 w-4 mr-2" />
            {isSending
              ? "A abrir WhatsApp..."
              : `Enviar convite a ${selectedIds.size} cliente(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ClientImport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/clientes" aria-label="Voltar à lista de clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">Importar Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Importe múltiplos clientes via CSV, adição rápida ou convite por WhatsApp
          </p>
        </div>
      </div>

      <Tabs defaultValue="csv">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="csv" className="flex-1 sm:flex-none">Upload CSV</TabsTrigger>
          <TabsTrigger value="quick" className="flex-1 sm:flex-none">Entrada Rápida</TabsTrigger>
          <TabsTrigger value="invite" className="flex-1 sm:flex-none">Convidar Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-6">
          <CsvUploadTab />
        </TabsContent>

        <TabsContent value="quick" className="mt-6">
          <QuickEntryTab />
        </TabsContent>

        <TabsContent value="invite" className="mt-6">
          <InviteClientsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
