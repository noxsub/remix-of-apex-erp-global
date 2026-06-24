import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { FlokiBadge } from "@/components/floki-badge";
import { useCanais, usePedidosMarketplace } from "@/lib/omnilink-store";
import { gerarAlertas } from "@/lib/floki/insights";
import { cn } from "@/lib/utils";

export function FlokiAlerts({ limit = 4 }: { limit?: number }) {
  const [canais] = useCanais();
  const [pedidos] = usePedidosMarketplace();
  const alerts = useMemo(() => gerarAlertas(pedidos, canais).slice(0, limit), [pedidos, canais, limit]);

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlokiBadge />
          Sem alertas no momento. Conforme pedidos do Omnilink chegam, a Floki avalia margem, taxas e CMV em tempo real.
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
        </div>
        <span className="text-xs text-muted-foreground">{alerts.length} alerta(s)</span>
      </div>
      <ul className="space-y-2">
        {alerts.map((a) => {
          const Icon = a.severidade === "critico" ? AlertCircle : a.severidade === "atencao" ? AlertTriangle : Info;
          return (
            <li
              key={a.id}
              className={cn(
                "flex items-start gap-3 rounded-md border p-3 text-sm",
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
              <div>
                <div className="font-medium">{a.titulo}</div>
                <div className="text-xs text-muted-foreground">{a.detalhe}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
