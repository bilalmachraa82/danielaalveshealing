import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Phone, Copy, MessageCircle, Mail, Check, X, CalendarPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// ---- Types ----

interface ClientSearchResult {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  last_session_date: string | null;
  total_sessions: number;
  has_anamnesis: boolean;
}

interface QuickBookingResult {
  session_id: string;
  client_id: string;
  client_is_new: boolean;
  prepare_url: string;
  whatsapp_url: string;
}

type Gender = "female" | "male";

interface SelectedClient {
  id: string | null;
  name: string;
  phone: string;
  email: string | null;
  isNew: boolean;
}

type ServiceType = "healing_wellness" | "pura_radiancia" | "pure_earth_love" | "home_harmony";

const SERVICE_OPTIONS: { value: ServiceType; label: string; price: string }[] = [
  { value: "healing_wellness", label: "Healing Touch", price: "150" },
  { value: "pura_radiancia", label: "Imersão Pura Radiância", price: "450" },
  { value: "pure_earth_love", label: "Pure Earth Love", price: "80" },
  { value: "home_harmony", label: "Home Harmony", price: "0" },
];

// ---- useDebounce hook ----

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ---- Helpers ----

function getDefaultDateTime(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

// ---- Component ----

interface QuickBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickBooking({ open, onOpenChange }: QuickBookingProps) {
  const queryClient = useQueryClient();

  // Form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(null);
  const [newClientPhone, setNewClientPhone] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime);
  const [serviceType, setServiceType] = useState<ServiceType>("healing_wellness");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<QuickBookingResult | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search clients when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || selectedClient) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;

    async function search() {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/clients/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!response.ok) throw new Error("Search failed");
        const data: ClientSearchResult[] = await response.json();
        if (!cancelled) {
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedClient]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  function resetForm() {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedClient(null);
    setNewClientPhone("");
    setGender("female");
    setScheduledAt(getDefaultDateTime());
    setServiceType("healing_wellness");
    setIsSubmitting(false);
    setBookingResult(null);
    setLinkCopied(false);
  }

  function handleSelectExistingClient(client: ClientSearchResult) {
    setSelectedClient({
      id: client.id,
      name: `${client.first_name} ${client.last_name ?? ""}`.trim(),
      phone: client.phone ?? "",
      email: client.email,
      isNew: false,
    });
    setSearchQuery(`${client.first_name} ${client.last_name ?? ""}`.trim());
    setShowDropdown(false);
  }

  function handleCreateNewClient() {
    setSelectedClient({
      id: null,
      name: searchQuery.trim(),
      phone: "",
      email: null,
      isNew: true,
    });
    setShowDropdown(false);
  }

  function handleClearClient() {
    setSelectedClient(null);
    setSearchQuery("");
    setNewClientPhone("");
    setSearchResults([]);
    // Focus the search input after clearing
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  const handleSubmit = useCallback(async () => {
    if (!selectedClient) {
      toast.error("Selecione ou crie um cliente");
      return;
    }

    const phone = selectedClient.isNew ? newClientPhone : selectedClient.phone;

    if (!phone) {
      toast.error("Telefone e obrigatorio");
      return;
    }

    if (!scheduledAt) {
      toast.error("Data e hora sao obrigatorias");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: selectedClient.name,
          client_phone: phone,
          client_gender: selectedClient.isNew ? gender : undefined,
          scheduled_at: scheduledAt,
          service_type: serviceType,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${response.status}`);
      }

      const result: QuickBookingResult = await response.json();
      setBookingResult(result);

      // Invalidate relevant queries so dashboard and session lists refresh
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      toast.success("Sessao agendada com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao agendar sessao";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedClient, newClientPhone, scheduledAt, serviceType, queryClient]);

  async function handleCopyLink() {
    if (!bookingResult) return;
    try {
      await navigator.clipboard.writeText(bookingResult.prepare_url);
      setLinkCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Nao foi possivel copiar o link");
    }
  }

  function handleClose() {
    onOpenChange(false);
  }

  // ---- Render ----

  const formattedSessionDate = scheduledAt
    ? format(new Date(scheduledAt), "d 'de' MMMM, HH:mm", { locale: pt })
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:max-w-lg sm:mx-auto"
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="font-serif text-lg">
            {bookingResult ? "Sessao Agendada" : "Nova Marcacao"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Agendar uma nova sessao rapidamente
          </SheetDescription>
        </SheetHeader>

        {bookingResult ? (
          <SuccessView
            result={bookingResult}
            clientName={selectedClient?.name ?? ""}
            clientEmail={selectedClient?.email ?? null}
            formattedDate={formattedSessionDate}
            linkCopied={linkCopied}
            onCopyLink={handleCopyLink}
            onClose={handleClose}
          />
        ) : (
          <BookingForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            selectedClient={selectedClient}
            newClientPhone={newClientPhone}
            setNewClientPhone={setNewClientPhone}
            gender={gender}
            setGender={setGender}
            scheduledAt={scheduledAt}
            setScheduledAt={setScheduledAt}
            serviceType={serviceType}
            setServiceType={setServiceType}
            isSubmitting={isSubmitting}
            searchInputRef={searchInputRef}
            dropdownRef={dropdownRef}
            onSelectExistingClient={handleSelectExistingClient}
            onCreateNewClient={handleCreateNewClient}
            onClearClient={handleClearClient}
            onSubmit={handleSubmit}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---- Booking Form sub-component ----

interface BookingFormProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: ClientSearchResult[];
  isSearching: boolean;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  selectedClient: SelectedClient | null;
  newClientPhone: string;
  setNewClientPhone: (p: string) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  scheduledAt: string;
  setScheduledAt: (d: string) => void;
  serviceType: ServiceType;
  setServiceType: (s: ServiceType) => void;
  isSubmitting: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onSelectExistingClient: (client: ClientSearchResult) => void;
  onCreateNewClient: () => void;
  onClearClient: () => void;
  onSubmit: () => void;
}

function BookingForm({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  showDropdown,
  setShowDropdown,
  selectedClient,
  newClientPhone,
  setNewClientPhone,
  gender,
  setGender,
  scheduledAt,
  setScheduledAt,
  serviceType,
  setServiceType,
  isSubmitting,
  searchInputRef,
  dropdownRef,
  onSelectExistingClient,
  onCreateNewClient,
  onClearClient,
  onSubmit,
}: BookingFormProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* Client field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Cliente</label>

        {selectedClient ? (
          <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedClient.name}
              </p>
              {!selectedClient.isNew && selectedClient.phone && (
                <p className="text-xs text-muted-foreground">
                  {selectedClient.phone}
                </p>
              )}
            </div>
            {selectedClient.isNew && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                Novo
              </Badge>
            )}
            <button
              type="button"
              onClick={onClearClient}
              className="shrink-0 rounded-sm p-1 hover:bg-muted transition-colors"
              aria-label="Limpar cliente"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0 || searchQuery.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              className="pl-9 h-12 text-base"
              autoComplete="off"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 top-full mt-1 rounded-md border bg-popover shadow-lg max-h-64 overflow-y-auto"
              >
                {isSearching && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    A procurar...
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <button
                    type="button"
                    onClick={onCreateNewClient}
                    className="flex items-center gap-2 w-full px-3 py-3 text-left hover:bg-accent transition-colors"
                  >
                    <Plus className="h-4 w-4 text-[#985F97]" />
                    <span className="text-sm font-medium">
                      Criar: {searchQuery.trim()}
                    </span>
                  </button>
                )}

                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => onSelectExistingClient(client)}
                    className="flex items-center gap-3 w-full px-3 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {client.first_name} {client.last_name ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {client.phone ?? "Sem telefone"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {client.total_sessions > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Ultima:{" "}
                          {format(
                            new Date(client.last_session_date!),
                            "d MMM",
                            { locale: pt }
                          )}
                        </p>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 text-[10px]"
                        >
                          Sem sessoes
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}

                {/* Always show "create new" at bottom when there are results */}
                {!isSearching && searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={onCreateNewClient}
                    className="flex items-center gap-2 w-full px-3 py-3 text-left hover:bg-accent transition-colors border-t"
                  >
                    <Plus className="h-4 w-4 text-[#985F97]" />
                    <span className="text-sm font-medium text-[#985F97]">
                      Criar: {searchQuery.trim()}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phone + Gender for new clients */}
        {selectedClient?.isNew && (
          <div className="space-y-3">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="tel"
                placeholder="+351 9XX XXX XXX"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="pl-9 h-12 text-base"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 h-11 rounded-md border text-sm font-medium transition-colors ${
                  gender === "female"
                    ? "border-[#985F97] bg-[#985F97]/10 text-[#985F97]"
                    : "border-input bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Feminino
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 h-11 rounded-md border text-sm font-medium transition-colors ${
                  gender === "male"
                    ? "border-[#985F97] bg-[#985F97]/10 text-[#985F97]"
                    : "border-input bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Masculino
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Date/time */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Data e Hora
        </label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      {/* Service type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Servico</label>
        <Select
          value={serviceType}
          onValueChange={(value) => setServiceType(value as ServiceType)}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span>{option.label}</span>
                {option.price && (
                  <span className="ml-2 text-muted-foreground">
                    {option.price}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !selectedClient}
        className="w-full h-12 text-base font-medium bg-[#985F97] hover:bg-[#7d4e7c] text-white"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            A agendar...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Agendar
          </div>
        )}
      </Button>
    </div>
  );
}

// ---- Success View sub-component ----

interface SuccessViewProps {
  result: QuickBookingResult;
  clientName: string;
  clientEmail: string | null;
  formattedDate: string;
  linkCopied: boolean;
  onCopyLink: () => void;
  onClose: () => void;
}

function SuccessView({
  result,
  clientName,
  clientEmail,
  formattedDate,
  linkCopied,
  onCopyLink,
  onClose,
}: SuccessViewProps) {
  return (
    <div className="space-y-5 pt-2">
      {/* Success header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-serif text-lg font-semibold">Sessao agendada!</h3>
        <p className="text-sm text-muted-foreground">
          {clientName} &mdash; {formattedDate}
        </p>
        {result.client_is_new && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Novo cliente criado
          </Badge>
        )}
      </div>

      {/* Prepare link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Link de preparacao
        </label>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={result.prepare_url}
            className="text-xs h-10 bg-muted/50"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onCopyLink}
            className="shrink-0 h-10 w-10"
            aria-label="Copiar link"
          >
            {linkCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <a
          href={result.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-md text-white font-medium text-base transition-colors"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-5 w-5" />
          Enviar por WhatsApp
        </a>

        {clientEmail && (
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => {
              // For now, open mailto with the prepare link
              const subject = encodeURIComponent("Preparacao da sessao - Daniela Alves");
              const body = encodeURIComponent(
                `Ola ${clientName.split(" ")[0]}!\n\nAqui esta o link para preparar a sua sessao:\n${result.prepare_url}\n\nCom amor,\nDaniela`
              );
              window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
            }}
          >
            <Mail className="h-5 w-5" />
            Enviar por Email
          </Button>
        )}
      </div>

      {/* Close */}
      <Button
        variant="ghost"
        onClick={onClose}
        className="w-full h-12 text-base text-muted-foreground"
      >
        Fechar
      </Button>
    </div>
  );
}

// ---- FAB Button ----

interface QuickBookingFabProps {
  onClick: () => void;
}

export function QuickBookingFab({ onClick }: QuickBookingFabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 h-14 w-14 rounded-full shadow-lg z-50 bg-[#985F97] hover:bg-[#7d4e7c] text-white"
      size="icon"
      aria-label="Nova marcacao"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
