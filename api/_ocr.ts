import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const ANAMNESIS_PROMPT = `You are extracting data from a Portuguese therapy anamnesis form ("Ficha de Identificacao e Avaliacao") from Daniela Alves, Healing & Wellness.

Extract ALL handwritten answers into JSON. The form has these sections:

1. Client identification: Nome, Idade, Data de nascimento, Altura (cm), Peso (kg), Profissao, Contacto (phone), E-Mail
2. "Sobre a Saude em geral" - 17 yes/no questions. For each, determine if answered Sim or Nao and extract any details written next to it.
3. "Sobre o Estilo de Vida" - 8 open text questions
4. Body map - describe any markings on the front/back body diagrams
5. Pain triggers, massage experience, session objectives
6. Declaration date

Return ONLY valid JSON with this structure:
{
  "client": {
    "first_name": string,
    "last_name": string,
    "date_of_birth": "YYYY-MM-DD" or null,
    "height_cm": number or null,
    "weight_kg": number or null,
    "profession": string or null,
    "phone": string or null,
    "email": string or null
  },
  "health_general": {
    "medicacao": { "has": boolean, "details": string },
    "cirurgias": { "has": boolean, "details": string },
    "acidentes_fracturas_proteses": { "has": boolean, "details": string },
    "doenca_cronica": { "has": boolean, "details": string },
    "diabetes": { "has": boolean, "details": string },
    "sintomas_cardiacos": { "has": boolean, "details": string },
    "hipertensao_hipotensao": { "has": boolean, "details": string },
    "varizes_retencao_liquidos": { "has": boolean, "details": string },
    "sintomas_respiratorios": { "has": boolean, "details": string },
    "alergias_sensibilidades": { "has": boolean, "details": string },
    "sintomas_pele": { "has": boolean, "details": string },
    "sintomas_musculo_esqueleticos": { "has": boolean, "details": string },
    "sintomas_sistema_nervoso": { "has": boolean, "details": string },
    "sintomas_digestivos": { "has": boolean, "details": string },
    "boca_tratamentos": { "has": boolean, "details": string },
    "gravidez_filhos_hormonal": { "has": boolean, "details": string },
    "nascimento_amamentacao": { "has": boolean, "details": string }
  },
  "lifestyle": {
    "ingestao_liquidos": { "answer": string },
    "alimentacao_alcool": { "answer": string },
    "tabaco_drogas": { "answer": string },
    "actividade_fisica": { "answer": string },
    "qualidade_sono": { "answer": string },
    "ciclo_menstrual": { "answer": string },
    "sexualidade": { "answer": string },
    "funcionamento_intestinal": { "answer": string }
  },
  "body_map_notes": string,
  "pain_trigger": { "has": boolean, "details": string },
  "massage_experience": { "has": boolean, "details": string },
  "session_objectives": string,
  "declaration_date": "YYYY-MM-DD" or null
}`;

const SESSION_NOTES_PROMPT = `You are extracting handwritten therapy session notes in Portuguese from Daniela Alves, Healing & Wellness.

Common abbreviations:
- Em. = Emocao (emotion)
- E.Cod / Em.Cod = Emocao Codificada (coded emotion)
- TSC = Tecnica de stress/coping
- NVE = Nivel vibratorio energetico
- Mass. = Massagem (massage)
- Floral = Floral therapy (e.g., "Floral 35")
- P4s.Hip. = Pos-hipnose
- rel. = relacionamento/relacao
- esq. = esquerdo (left)
- dto. = direito (right)

Extract each dated session entry separately. Return ONLY valid JSON:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "raw_text": "full transcription of the notes for this date",
      "treatments": ["description of each treatment applied"],
      "body_areas": ["body areas mentioned/worked on"],
      "emotional_themes": ["emotional themes explored"],
      "supplements_florals": ["any supplements or florals recommended"],
      "observations": "key observations",
      "follow_up": "any follow-up notes or next steps"
    }
  ]
}`;

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Single-image anamnesis extraction
// ---------------------------------------------------------------------------

export async function extractAnamnesisFromImage(
  imageBase64: string,
  mediaType: string = "image/jpeg"
): Promise<Record<string, unknown>> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as ImageMediaType,
              data: imageBase64,
            },
          },
          { type: "text", text: ANAMNESIS_PROMPT },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to extract JSON from OCR response");
  return JSON.parse(jsonMatch[0]);
}

// ---------------------------------------------------------------------------
// Multi-image anamnesis extraction (form = 2 pages)
// ---------------------------------------------------------------------------

export async function extractAnamnesisFromImages(
  images: ReadonlyArray<{ base64: string; mediaType: string }>
): Promise<Record<string, unknown>> {
  const client = getAnthropicClient();

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType as ImageMediaType,
        data: img.base64,
      },
    });
  }
  content.push({ type: "text", text: ANAMNESIS_PROMPT });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to extract JSON from OCR response");
  return JSON.parse(jsonMatch[0]);
}

// ---------------------------------------------------------------------------
// Session notes extraction
// ---------------------------------------------------------------------------

export async function extractSessionNotesFromImage(
  imageBase64: string,
  mediaType: string = "image/jpeg"
): Promise<Record<string, unknown>> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as ImageMediaType,
              data: imageBase64,
            },
          },
          { type: "text", text: SESSION_NOTES_PROMPT },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to extract JSON from OCR response");
  return JSON.parse(jsonMatch[0]);
}

// ---------------------------------------------------------------------------
// Multi-image session notes extraction
// ---------------------------------------------------------------------------

export async function extractSessionNotesFromImages(
  images: ReadonlyArray<{ base64: string; mediaType: string }>
): Promise<Record<string, unknown>> {
  const client = getAnthropicClient();

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType as ImageMediaType,
        data: img.base64,
      },
    });
  }
  content.push({ type: "text", text: SESSION_NOTES_PROMPT });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to extract JSON from OCR response");
  return JSON.parse(jsonMatch[0]);
}
