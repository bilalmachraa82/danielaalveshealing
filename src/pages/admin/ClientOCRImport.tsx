import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  ScanLine,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  ImagePlus,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImageTag = "anamnese_p1" | "anamnese_p2" | "notas_sessao";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mediaType: string;
  tag: ImageTag;
}

interface HealthItem {
  has: boolean;
  details: string;
}

interface LifestyleItem {
  answer: string;
}

interface ExtractedClient {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  profession: string | null;
  phone: string | null;
  email: string | null;
}

interface ExtractedSession {
  date: string;
  raw_text: string;
  treatments: string[];
  body_areas: string[];
  emotional_themes: string[];
  supplements_florals: string[];
  observations: string;
  follow_up: string;
}

interface ExtractedData {
  client: ExtractedClient;
  health_general: Record<string, HealthItem>;
  lifestyle: Record<string, LifestyleItem>;
  body_map_notes: string;
  pain_trigger: HealthItem;
  massage_experience: HealthItem;
  session_objectives: string;
  declaration_date: string | null;
  sessions: ExtractedSession[];
}

interface SaveResult {
  client_id: string;
  anamnesis_id: string | null;
  sessions_created: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (increased for PDFs)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB for images
const MAX_DIMENSION = 1568; // Claude's internal limit

const HEALTH_LABELS: Record<string, string> = {
  medicacao: "Medicacao",
  cirurgias: "Cirurgias",
  acidentes_fracturas_proteses: "Acidentes / Fracturas / Proteses",
  doenca_cronica: "Doenca cronica",
  diabetes: "Diabetes",
  sintomas_cardiacos: "Sintomas cardiacos",
  hipertensao_hipotensao: "Hipertensao / Hipotensao",
  varizes_retencao_liquidos: "Varizes / Retencao de liquidos",
  sintomas_respiratorios: "Sintomas respiratorios",
  alergias_sensibilidades: "Alergias / Sensibilidades",
  sintomas_pele: "Sintomas de pele",
  sintomas_musculo_esqueleticos: "Sintomas musculo-esqueleticos",
  sintomas_sistema_nervoso: "Sintomas do sistema nervoso",
  sintomas_digestivos: "Sintomas digestivos",
  boca_tratamentos: "Boca / Tratamentos dentarios",
  gravidez_filhos_hormonal: "Gravidez / Filhos / Hormonal",
  nascimento_amamentacao: "Nascimento / Amamentacao",
};

const LIFESTYLE_LABELS: Record<string, string> = {
  ingestao_liquidos: "Ingestao de liquidos",
  alimentacao_alcool: "Alimentacao e alcool",
  tabaco_drogas: "Tabaco e drogas",
  actividade_fisica: "Actividade fisica",
  qualidade_sono: "Qualidade do sono",
  ciclo_menstrual: "Ciclo menstrual",
  sexualidade: "Sexualidade",
  funcionamento_intestinal: "Funcionamento intestinal",
};

const TAG_LABELS: Record<ImageTag, string> = {
  anamnese_p1: "Anamnese (pag 1)",
  anamnese_p2: "Anamnese (pag 2)",
  notas_sessao: "Notas de sessao",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resizeImageToBase64(
  file: File,
  maxDim: number
): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const quality = mediaType === "image/jpeg" ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(mediaType, quality);
        const base64 = dataUrl.split(",")[1];

        resolve({ base64, mediaType });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function readFileAsBase64(
  file: File
): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mediaType: "application/pdf" });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function emptyExtracted(): ExtractedData {
  const healthGeneral: Record<string, HealthItem> = {};
  for (const key of Object.keys(HEALTH_LABELS)) {
    healthGeneral[key] = { has: false, details: "" };
  }
  const lifestyle: Record<string, LifestyleItem> = {};
  for (const key of Object.keys(LIFESTYLE_LABELS)) {
    lifestyle[key] = { answer: "" };
  }

  return {
    client: {
      first_name: "",
      last_name: "",
      date_of_birth: null,
      height_cm: null,
      weight_kg: null,
      profession: null,
      phone: null,
      email: null,
    },
    health_general: healthGeneral,
    lifestyle,
    body_map_notes: "",
    pain_trigger: { has: false, details: "" },
    massage_experience: { has: false, details: "" },
    session_objectives: "",
    declaration_date: null,
    sessions: [],
  };
}

// ---------------------------------------------------------------------------
// Step 1: Upload Photos
// ---------------------------------------------------------------------------

interface Step1Props {
  images: UploadedImage[];
  onAddImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onTagImage: (id: string, tag: ImageTag) => void;
  onProcess: () => void;
  isProcessing: boolean;
  processingStatus: string;
}

function StepUpload({
  images,
  onAddImages,
  onRemoveImage,
  onTagImage,
  onProcess,
  isProcessing,
  processingStatus,
}: Step1Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const isImage = file.type.startsWith("image/");
        const isPdfFile = isPdf(file);
        if (!isImage && !isPdfFile) {
          toast.error(`${file.name} nao e uma imagem nem PDF`);
          continue;
        }
        const sizeLimit = isPdfFile ? MAX_FILE_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
        if (file.size > sizeLimit) {
          toast.error(
            `${file.name} excede ${isPdfFile ? "10MB" : "5MB"}. Por favor, comprima o ficheiro antes de enviar.`
          );
          continue;
        }
        files.push(file);
      }
      if (files.length > 0) onAddImages(files);
    },
    [onAddImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const hasAnamnesisImages = images.some(
    (img) => img.tag === "anamnese_p1" || img.tag === "anamnese_p2"
  );
  const hasSessionImages = images.some((img) => img.tag === "notas_sessao");
  const canProcess = images.length > 0 && (hasAnamnesisImages || hasSessionImages);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-primary/30 rounded-xl p-8 md:p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-200"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Arraste as fotos ou toque para fotografar / selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WEBP ou PDF (max. 5MB imagens, 10MB PDF)
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (e.target) e.target.value = "";
          }}
          aria-label="Selecionar imagens"
        />
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {images.length} imagem(ns) carregada(s)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="relative aspect-[3/4] bg-muted">
                  {img.mediaType === "application/pdf" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ScanLine className="h-12 w-12" />
                      <span className="text-xs font-medium">{img.file.name}</span>
                      <Badge variant="secondary" className="text-xs">PDF</Badge>
                    </div>
                  ) : (
                    <img
                      src={img.preview}
                      alt={`Imagem ${img.tag}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(img.id);
                    }}
                    aria-label="Remover imagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <Select
                    value={img.tag}
                    onValueChange={(value) =>
                      onTagImage(img.id, value as ImageTag)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anamnese_p1">
                        {TAG_LABELS.anamnese_p1}
                      </SelectItem>
                      <SelectItem value="anamnese_p2">
                        {TAG_LABELS.anamnese_p2}
                      </SelectItem>
                      <SelectItem value="notas_sessao">
                        {TAG_LABELS.notas_sessao}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}

            {/* Add more images card */}
            <Card
              className="overflow-hidden border-dashed cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-medium">Adicionar mais</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Process button */}
      {images.length > 0 && (
        <div className="flex flex-col items-end gap-2">
          {!canProcess && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Classifique pelo menos uma imagem como anamnese ou notas de sessao
            </p>
          )}
          <Button
            onClick={onProcess}
            disabled={!canProcess || isProcessing}
            className="min-h-[44px] gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {processingStatus}
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" />
                Processar com IA
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Review Extracted Data
// ---------------------------------------------------------------------------

interface Step2Props {
  data: ExtractedData;
  onChange: (data: ExtractedData) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

function StepReview({ data, onChange, onSave, onBack, isSaving }: Step2Props) {
  const updateClient = (field: keyof ExtractedClient, value: unknown) => {
    onChange({
      ...data,
      client: { ...data.client, [field]: value },
    });
  };

  const updateHealth = (key: string, field: "has" | "details", value: unknown) => {
    onChange({
      ...data,
      health_general: {
        ...data.health_general,
        [key]: { ...data.health_general[key], [field]: value },
      },
    });
  };

  const updateLifestyle = (key: string, value: string) => {
    onChange({
      ...data,
      lifestyle: {
        ...data.lifestyle,
        [key]: { answer: value },
      },
    });
  };

  const updateSession = (index: number, field: keyof ExtractedSession, value: unknown) => {
    const sessions = data.sessions.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange({ ...data, sessions });
  };

  const removeSession = (index: number) => {
    onChange({
      ...data,
      sessions: data.sessions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Client info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Dados do Cliente</CardTitle>
          <CardDescription>
            Reveja e corrija os dados extraidos da ficha
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ocr-first-name">Nome *</Label>
            <Input
              id="ocr-first-name"
              value={data.client.first_name}
              onChange={(e) => updateClient("first_name", e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-last-name">Apelido</Label>
            <Input
              id="ocr-last-name"
              value={data.client.last_name}
              onChange={(e) => updateClient("last_name", e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-phone">Telefone</Label>
            <Input
              id="ocr-phone"
              value={data.client.phone ?? ""}
              onChange={(e) => updateClient("phone", e.target.value || null)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-email">Email</Label>
            <Input
              id="ocr-email"
              type="email"
              value={data.client.email ?? ""}
              onChange={(e) => updateClient("email", e.target.value || null)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-dob">Data de Nascimento</Label>
            <Input
              id="ocr-dob"
              type="date"
              value={data.client.date_of_birth ?? ""}
              onChange={(e) =>
                updateClient("date_of_birth", e.target.value || null)
              }
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-profession">Profissao</Label>
            <Input
              id="ocr-profession"
              value={data.client.profession ?? ""}
              onChange={(e) =>
                updateClient("profession", e.target.value || null)
              }
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-height">Altura (cm)</Label>
            <Input
              id="ocr-height"
              type="number"
              value={data.client.height_cm ?? ""}
              onChange={(e) =>
                updateClient(
                  "height_cm",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocr-weight">Peso (kg)</Label>
            <Input
              id="ocr-weight"
              type="number"
              value={data.client.weight_kg ?? ""}
              onChange={(e) =>
                updateClient(
                  "weight_kg",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="min-h-[44px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Health General */}
      {Object.keys(data.health_general).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Saude em Geral</CardTitle>
            <CardDescription>17 perguntas Sim/Nao com detalhes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.health_general).map(([key, item]) => (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3 sm:w-80 shrink-0">
                  <Switch
                    checked={item.has}
                    onCheckedChange={(checked) =>
                      updateHealth(key, "has", checked)
                    }
                    aria-label={HEALTH_LABELS[key] ?? key}
                  />
                  <Label className="text-sm leading-tight cursor-pointer">
                    {HEALTH_LABELS[key] ?? key}
                  </Label>
                  <Badge
                    variant={item.has ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {item.has ? "Sim" : "Nao"}
                  </Badge>
                </div>
                <Input
                  placeholder="Detalhes..."
                  value={item.details}
                  onChange={(e) => updateHealth(key, "details", e.target.value)}
                  className="min-h-[44px] flex-1"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lifestyle */}
      {Object.keys(data.lifestyle).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Estilo de Vida</CardTitle>
            <CardDescription>
              8 perguntas sobre habitos diarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.lifestyle).map(([key, item]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {LIFESTYLE_LABELS[key] ?? key}
                </Label>
                <Textarea
                  value={item.answer}
                  onChange={(e) => updateLifestyle(key, e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Extra fields */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Informacao Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Notas do mapa corporal</Label>
            <Textarea
              value={data.body_map_notes}
              onChange={(e) =>
                onChange({ ...data, body_map_notes: e.target.value })
              }
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-3">
                <Switch
                  checked={data.pain_trigger.has}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...data,
                      pain_trigger: { ...data.pain_trigger, has: checked },
                    })
                  }
                />
                <Label>Fator desencadeante de dor</Label>
              </div>
              <Input
                placeholder="Detalhes..."
                value={data.pain_trigger.details}
                onChange={(e) =>
                  onChange({
                    ...data,
                    pain_trigger: {
                      ...data.pain_trigger,
                      details: e.target.value,
                    },
                  })
                }
                className="min-h-[44px]"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-3">
                <Switch
                  checked={data.massage_experience.has}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...data,
                      massage_experience: {
                        ...data.massage_experience,
                        has: checked,
                      },
                    })
                  }
                />
                <Label>Experiencia de massagem</Label>
              </div>
              <Input
                placeholder="Detalhes..."
                value={data.massage_experience.details}
                onChange={(e) =>
                  onChange({
                    ...data,
                    massage_experience: {
                      ...data.massage_experience,
                      details: e.target.value,
                    },
                  })
                }
                className="min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Objectivos da sessao</Label>
            <Textarea
              value={data.session_objectives}
              onChange={(e) =>
                onChange({ ...data, session_objectives: e.target.value })
              }
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ocr-decl-date">Data da declaracao</Label>
            <Input
              id="ocr-decl-date"
              type="date"
              value={data.declaration_date ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  declaration_date: e.target.value || null,
                })
              }
              className="min-h-[44px] max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Notes */}
      {data.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              Notas de Sessao ({data.sessions.length})
            </CardTitle>
            <CardDescription>
              Sessoes extraidas das notas manuscritas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.sessions.map((session, index) => (
              <div key={index} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1}
                    </Badge>
                    <Input
                      type="date"
                      value={session.date}
                      onChange={(e) =>
                        updateSession(index, "date", e.target.value)
                      }
                      className="min-h-[44px] max-w-[180px]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => removeSession(index)}
                    aria-label={`Remover sessao ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Texto completo
                  </Label>
                  <Textarea
                    value={session.raw_text}
                    onChange={(e) =>
                      updateSession(index, "raw_text", e.target.value)
                    }
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Tratamentos
                    </Label>
                    <Textarea
                      value={session.treatments.join("\n")}
                      onChange={(e) =>
                        updateSession(
                          index,
                          "treatments",
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="Um por linha"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Zonas corporais
                    </Label>
                    <Textarea
                      value={session.body_areas.join("\n")}
                      onChange={(e) =>
                        updateSession(
                          index,
                          "body_areas",
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="Uma por linha"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Temas emocionais
                    </Label>
                    <Textarea
                      value={session.emotional_themes.join("\n")}
                      onChange={(e) =>
                        updateSession(
                          index,
                          "emotional_themes",
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="Um por linha"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Florais / Suplementos
                    </Label>
                    <Textarea
                      value={session.supplements_florals.join("\n")}
                      onChange={(e) =>
                        updateSession(
                          index,
                          "supplements_florals",
                          e.target.value.split("\n").filter(Boolean)
                        )
                      }
                      rows={2}
                      className="resize-none text-sm"
                      placeholder="Um por linha"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Observacoes
                  </Label>
                  <Input
                    value={session.observations}
                    onChange={(e) =>
                      updateSession(index, "observations", e.target.value)
                    }
                    className="min-h-[44px] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Seguimento
                  </Label>
                  <Input
                    value={session.follow_up}
                    onChange={(e) =>
                      updateSession(index, "follow_up", e.target.value)
                    }
                    className="min-h-[44px] text-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving || !data.client.first_name.trim()}
          className="min-h-[44px] gap-2"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Corrigir e Guardar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Confirmation
// ---------------------------------------------------------------------------

interface Step3Props {
  result: SaveResult;
  clientName: string;
  healthCount: number;
  sessionCount: number;
}

function StepConfirmation({
  result,
  clientName,
  healthCount,
  sessionCount,
}: Step3Props) {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <div className="rounded-full bg-green-100 p-6">
        <Check className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-semibold">
          Cliente importado com sucesso!
        </h2>
        <p className="text-muted-foreground">
          A ficha de {clientName} foi digitalizada e guardada no CRM.
        </p>
      </div>

      <Card className="w-full max-w-md text-left">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliente</span>
            <span className="font-medium">{clientName}</span>
          </div>
          {result.anamnesis_id && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Respostas de saude
              </span>
              <span className="font-medium">{healthCount}</span>
            </div>
          )}
          {sessionCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Sessoes importadas
              </span>
              <span className="font-medium">{sessionCount}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="min-h-[44px]">
          <Link to={`/admin/clientes/${result.client_id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver perfil do cliente
          </Link>
        </Button>
        <Button variant="outline" asChild className="min-h-[44px]">
          <Link to="/admin/clientes/ocr">
            <ScanLine className="h-4 w-4 mr-2" />
            Digitalizar outra ficha
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ClientOCRImport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData>(
    emptyExtracted()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  // --- Image management ---

  const handleAddImages = useCallback(async (files: File[]) => {
    const newImages: UploadedImage[] = [];

    for (const file of files) {
      let base64: string;
      let mediaType: string;

      if (isPdf(file)) {
        const result = await readFileAsBase64(file);
        base64 = result.base64;
        mediaType = result.mediaType;
      } else {
        const result = await resizeImageToBase64(file, MAX_DIMENSION);
        base64 = result.base64;
        mediaType = result.mediaType;
      }

      const preview = URL.createObjectURL(file);
      const tag: ImageTag =
        newImages.length === 0 && file.name.toLowerCase().includes("sessao")
          ? "notas_sessao"
          : "anamnese_p1";

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        base64,
        mediaType,
        tag,
      });
    }

    setImages((prev) => {
      // Auto-assign tags based on order
      const all = [...prev, ...newImages];
      return all.map((img, i) => {
        if (img.tag !== "notas_sessao" && prev.length === 0) {
          // First image defaults to anamnese_p1, second to anamnese_p2
          if (i === 0) return { ...img, tag: "anamnese_p1" as ImageTag };
          if (i === 1) return { ...img, tag: "anamnese_p2" as ImageTag };
        }
        return img;
      });
    });
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleTagImage = useCallback((id: string, tag: ImageTag) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, tag } : img))
    );
  }, []);

  // --- Process images with OCR ---

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    const result = emptyExtracted();

    try {
      const anamnesisImages = images.filter(
        (img) => img.tag === "anamnese_p1" || img.tag === "anamnese_p2"
      );
      const sessionImages = images.filter(
        (img) => img.tag === "notas_sessao"
      );

      const totalSteps =
        (anamnesisImages.length > 0 ? 1 : 0) +
        (sessionImages.length > 0 ? 1 : 0);
      let currentStep = 0;

      // Extract anamnesis
      if (anamnesisImages.length > 0) {
        currentStep++;
        setProcessingStatus(
          `A processar anamnese (${currentStep} de ${totalSteps})...`
        );

        const response = await fetch("/api/clients/ocr/anamnesis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: anamnesisImages.map((img) => ({
              base64: img.base64,
              mediaType: img.mediaType,
            })),
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.error ?? `Erro ao processar anamnese: HTTP ${response.status}`
          );
        }

        const { extracted } = await response.json();

        if (extracted.client) {
          result.client = {
            first_name: extracted.client.first_name ?? "",
            last_name: extracted.client.last_name ?? "",
            date_of_birth: extracted.client.date_of_birth ?? null,
            height_cm: extracted.client.height_cm ?? null,
            weight_kg: extracted.client.weight_kg ?? null,
            profession: extracted.client.profession ?? null,
            phone: extracted.client.phone ?? null,
            email: extracted.client.email ?? null,
          };
        }
        if (extracted.health_general) {
          result.health_general = {
            ...result.health_general,
            ...extracted.health_general,
          };
        }
        if (extracted.lifestyle) {
          result.lifestyle = { ...result.lifestyle, ...extracted.lifestyle };
        }
        if (extracted.body_map_notes) {
          result.body_map_notes = extracted.body_map_notes;
        }
        if (extracted.pain_trigger) {
          result.pain_trigger = extracted.pain_trigger;
        }
        if (extracted.massage_experience) {
          result.massage_experience = extracted.massage_experience;
        }
        if (extracted.session_objectives) {
          result.session_objectives = extracted.session_objectives;
        }
        if (extracted.declaration_date) {
          result.declaration_date = extracted.declaration_date;
        }
      }

      // Extract session notes
      if (sessionImages.length > 0) {
        currentStep++;
        setProcessingStatus(
          `A processar notas de sessao (${currentStep} de ${totalSteps})...`
        );

        const response = await fetch("/api/clients/ocr/session-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: sessionImages.map((img) => ({
              base64: img.base64,
              mediaType: img.mediaType,
            })),
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.error ??
              `Erro ao processar notas de sessao: HTTP ${response.status}`
          );
        }

        const { extracted } = await response.json();

        if (extracted.sessions && Array.isArray(extracted.sessions)) {
          result.sessions = extracted.sessions.map(
            (s: Record<string, unknown>) => ({
              date: (s.date as string) ?? "",
              raw_text: (s.raw_text as string) ?? "",
              treatments: (s.treatments as string[]) ?? [],
              body_areas: (s.body_areas as string[]) ?? [],
              emotional_themes: (s.emotional_themes as string[]) ?? [],
              supplements_florals: (s.supplements_florals as string[]) ?? [],
              observations: (s.observations as string) ?? "",
              follow_up: (s.follow_up as string) ?? "",
            })
          );
        }
      }

      setExtractedData(result);
      setStep(2);
      toast.success("Dados extraidos com sucesso! Reveja antes de guardar.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao processar imagens"
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  }, [images]);

  // --- Save reviewed data ---

  const handleSave = useCallback(async () => {
    if (!extractedData.client.first_name.trim()) {
      toast.error("O nome do cliente e obrigatorio");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/clients/ocr/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedData),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ao guardar: HTTP ${response.status}`);
      }

      const result: SaveResult = await response.json();
      setSaveResult(result);
      setStep(3);

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente importado com sucesso!");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao guardar dados"
      );
    } finally {
      setIsSaving(false);
    }
  }, [extractedData, queryClient]);

  // --- Step indicator ---

  const steps = [
    { number: 1, label: "Fotografar" },
    { number: 2, label: "Rever" },
    { number: 3, label: "Concluido" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/clientes" aria-label="Voltar a lista de clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">
            Digitalizar Fichas
          </h1>
          <p className="text-muted-foreground text-sm">
            Fotografe fichas de anamnese e notas de sessao para importar
            automaticamente
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                step === s.number
                  ? "bg-primary text-primary-foreground"
                  : step > s.number
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.number ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="font-medium">{s.number}</span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && (
        <StepUpload
          images={images}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onTagImage={handleTagImage}
          onProcess={handleProcess}
          isProcessing={isProcessing}
          processingStatus={processingStatus}
        />
      )}

      {step === 2 && (
        <StepReview
          data={extractedData}
          onChange={setExtractedData}
          onSave={handleSave}
          onBack={() => setStep(1)}
          isSaving={isSaving}
        />
      )}

      {step === 3 && saveResult && (
        <StepConfirmation
          result={saveResult}
          clientName={`${extractedData.client.first_name} ${extractedData.client.last_name}`.trim()}
          healthCount={
            Object.values(extractedData.health_general).filter((h) => h.has)
              .length
          }
          sessionCount={saveResult.sessions_created}
        />
      )}
    </div>
  );
}
