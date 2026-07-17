import { ArrowRight, X } from "lucide-react";

import type {
  FlokiActivity,
  FlokiActivityArea,
} from "./floki-activity";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AreaVisualConfig = {
  label: string;
  accent: string;
  soft: string;
  border: string;
  glow: string;
};

type FlokiDetailsProps = {
  activity: FlokiActivity;
  areaConfig: Record<FlokiActivityArea, AreaVisualConfig>;
  onClose: () => void;
  onOpenActivity: () => void;
};

export function FlokiDetails({
  activity,
  areaConfig,
  onClose,
  onOpenActivity,
}: FlokiDetailsProps) {
  const config = areaConfig[activity.area];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 px-4 py-8 backdrop-blur-md">
      <button
        type="button"
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
      />

      <div className="relative z-10 flex min-h-full items-center justify-center">
        <Card
          className={`mx-auto w-full max-w-2xl animate-in fade-in zoom-in-75 bg-background/98 p-0 duration-300 ${config.border} ${config.glow}`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-[0.24em] ${config.accent}`}
              >
                Atividade de {config.label}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {activity.title}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {activity.summary}
              </p>
            </div>

            <button
              type="button"
              aria-label="Fechar detalhes"
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {activity.metrics.map((metric) => (
                <Resumo
                  key={`${activity.id}-${metric.label}`}
                  label={metric.label}
                  value={metric.value}
                  detalhe={metric.detail}
                />
              ))}
            </div>

            <div
              className={`rounded-xl border p-4 ${config.border} ${config.soft}`}
            >
              <p className="text-sm font-medium text-foreground">
                Recomendação do Floki
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activity.recommendation}
              </p>
            </div>

            <div className="space-y-3">
              {activity.items.map((item) => (
                <AtividadeItem
                  key={`${activity.id}-${item.title}`}
                  title={item.title}
                  description={item.description}
                  primaryValue={item.primaryValue}
                  secondaryValue={item.secondaryValue}
                  accent={config.accent}
                />
              ))}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Voltar ao Floki
              </Button>

              <Button
                type="button"
                onClick={onOpenActivity}
                className="gap-2"
              >
                {activity.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type ResumoProps = {
  label: string;
  value: string;
  detalhe: string;
};

function Resumo({
  label,
  value,
  detalhe,
}: ResumoProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-foreground">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {detalhe}
      </p>
    </div>
  );
}

type AtividadeItemProps = {
  title: string;
  description: string;
  primaryValue?: string;
  secondaryValue?: string;
  accent: string;
};

function AtividadeItem({
  title,
  description,
  primaryValue,
  secondaryValue,
  accent,
}: AtividadeItemProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      {(primaryValue || secondaryValue) && (
        <div className="text-left sm:text-right">
          {primaryValue && (
            <p className="text-sm font-semibold text-foreground">
              {primaryValue}
            </p>
          )}

          {secondaryValue && (
            <p className={`text-xs ${accent}`}>
              {secondaryValue}
            </p>
          )}
        </div>
      )}
    </div>
  );
}