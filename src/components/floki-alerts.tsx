import { AlertTriangle, Info, AlertCircle, X, BellOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FlokiBadge } from "@/components/floki-badge";
import { useCanais, usePedidosMarketplace } from "@/lib/omnilink-store";
import { gerarAlertas } from "@/lib/floki/insights";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "syntera:floki:dismissed";
const MUTE_KEY = "syntera:floki:muted";

function readSet(k: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(k);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function writeSet(k: string, s: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(Array.from(s)));
  window.dispatchEvent(new CustomEvent("syntera:floki:change"));
}
function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}
function writeMuted(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  window.dispatchEvent(new CustomEvent("syntera:floki:change"));
}

export function FlokiAlerts({ limit = 4 }: { limit?: number }) {
  const [canais] = useCanais();
  const [pedidos] = usePedidosMarketplace();
  const [dismissed, setDismissed] = useState<Set<string>>(() => readSet(DISMISS_KEY));
  const [muted, setMuted] = useState<boolean>(() => readMuted());

  useEffect(() => {
    const h = () => {
      setDismissed(readSet(DISMISS_KEY));
      setMuted(readMuted());
    };
    window.addEventListener("syntera:floki:change", h);
    return () => window.removeEventListener("syntera:floki:change", h);
  }, []);

  const alerts = useMemo(
    () => gerarAlertas(pedidos, canais).filter((a) => !dismissed.has(a.id)).slice(0, limit),
    [pedidos, canais, dismissed, limit],
  );

  function dismissOne(id: string) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    writeSet(DISMISS_KEY, next);
  }
  function dismissAll() {
    const next = new Set(dismissed);
    alerts.forEach((a) => next.add(a.id));
    setDismissed(next);
    writeSet(DISMISS_KEY, next);
  }
  function toggleMute() {
    const v = !muted;
    setMuted(v);
    writeMuted(v);
  }
  function reset() {
    setDismissed(new Set());
    writeSet(DISMISS_KEY, new Set());
    setMuted(false);
    writeMuted(false);
  }

  if (muted) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-card/50 p-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <BellOff className="h-3.5 w-3.5" /> Insights da Floki silenciados.
        </span>
        <button
          onClick={reset}
          className="rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:border-gold hover:text-foreground"
        >
          Reativar
        </button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-4">
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FlokiBadge />
            Sem alertas no momento. A Floki monitora margem, taxas e CMV em tempo real.
          </div>
          {dismissed.size > 0 && (
            <button
              onClick={reset}
              className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Restaurar dispensados ({dismissed.size})
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlokiBadge />
          <h3 className="text-sm font-semibold tracking-tight">Insights da Floki</h3>
          <span className="text-xs text-muted-foreground">· {alerts.length} alerta(s)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={dismissAll}
            className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Dispensar todos
          </button>
          <button
            onClick={toggleMute}
            title="Silenciar até reativar"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <BellOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {alerts.map((a) => {
          const Icon = a.severidade === "critico" ? AlertCircle : a.severidade === "atencao" ? AlertTriangle : Info;
          return (
            <li
              key={a.id}
              className={cn(
                "group flex items-start gap-3 rounded-md border p-3 text-sm",
                a.severidade === "critico" && "border-destructive/40 bg-destructive/5",
                a.severidade === "atencao" && "border-amber-500/40 bg-amber-500/5",
                a.severidade === "info" && "border-border bg-secondary/40",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  a.severidade === "critico" && "text-destructive",
                  a.severidade === "atencao" && "text-amber-600",
                  a.severidade === "info" && "text-muted-foreground",
                )}
              />
              <div className="flex-1">
                <div className="font-medium">{a.titulo}</div>
                <div className="text-xs text-muted-foreground">{a.detalhe}</div>
              </div>
              <button
                onClick={() => dismissOne(a.id)}
                aria-label="Dispensar alerta"
                className="rounded-md p-1 text-muted-foreground opacity-60 hover:bg-background hover:text-foreground hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
