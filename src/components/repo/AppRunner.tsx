import { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  AlertCircle,
  Copy,
  Check,
  Shield,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AppRunnerProps {
  url: string;
  title: string;
  className?: string;
  initialFullscreen?: boolean;
  onClose?: () => void;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function AppRunner({
  url,
  title,
  className = "",
  initialFullscreen = false,
  onClose,
}: AppRunnerProps) {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [loadKey, setLoadKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Esc key closes fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleReload = () => {
    setIsLoading(true);
    setLoadKey((k) => k + 1);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link da app copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f);
  };

  const viewportWidthClass = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[390px]",
  }[viewport];

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background p-0 sm:p-3 animate-in fade-in duration-200"
          : "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      } ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border bg-secondary/80 px-2.5 py-2 sm:px-4 sm:py-2.5">
        {/* Left: Window Dots & App Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs">
              {title}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
              <Shield className="h-3 w-3" /> Sandbox
            </span>
          </div>
        </div>

        {/* Center: Viewport Device Switcher */}
        <div className="hidden md:flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            title="Vista Computador (100%)"
            onClick={() => setViewport("desktop")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              viewport === "desktop"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Vista Tablet (768px)"
            onClick={() => setViewport("tablet")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              viewport === "tablet"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Vista Telemóvel (390px)"
            onClick={() => setViewport("mobile")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              viewport === "mobile"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Actions (Reload, Copy, External, Fullscreen, Close) */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Recarregar aplicação"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Recarregar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Copiar URL da aplicação"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-foreground" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="sr-only">Copiar Link</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Abrir diretamente em nova aba"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">Abrir Externamente</span>
            </a>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Sair do ecrã inteiro (Esc)" : "Expandir para ecrã inteiro"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="sr-only">Ecrã Inteiro</span>
          </Button>

          {isFullscreen && onClose && (
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="h-8 px-2.5 text-xs ml-1 rounded-lg"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`relative flex-1 flex items-center justify-center bg-muted/40 transition-all ${
          isFullscreen ? "p-1 sm:p-3 overflow-hidden" : "p-1.5 sm:p-4"
        }`}
      >
        {/* Iframe Wrapper with responsive viewport constraints and dvh */}
        <div
          className={`relative transition-all duration-300 shadow-lg overflow-hidden rounded-lg sm:rounded-xl border border-border bg-background ${viewportWidthClass} ${
            isFullscreen ? "h-[calc(100dvh-54px)] w-full" : "h-[460px] sm:h-[620px] w-full"
          }`}
        >
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 p-6 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-foreground">A carregar {title}...</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                A inicializar o ambiente de execução em iframe seguro.
              </p>
            </div>
          )}

          {/* Secure App Iframe */}
          <iframe
            key={loadKey}
            ref={iframeRef}
            src={url}
            title={title}
            onLoad={() => setIsLoading(false)}
            className="h-full w-full border-0 bg-background"
            allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; usb; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
            loading="lazy"
          />
        </div>
      </div>

      {/* Subtle Bottom Hint (Dismissible) */}
      {showNotice && (
        <div className="flex items-center justify-between border-t border-border/60 bg-secondary/60 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
            <span className="truncate">
              A executar <strong className="text-foreground">{url}</strong> em sandbox. Se o ecrã ficar em branco devido a bloqueios de segurança do site externo (X-Frame-Options), clica em{" "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground font-medium hover:text-foreground/80"
              >
                abrir em nova aba
              </a>
              .
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotice(false)}
            className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
            title="Dispensar aviso"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface AppRunnerModalProps {
  url: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppRunnerModal({ url, title, open, onOpenChange }: AppRunnerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
      <AppRunner
        url={url}
        title={title}
        initialFullscreen
        onClose={() => onOpenChange(false)}
        className="h-full w-full"
      />
    </div>
  );
}
