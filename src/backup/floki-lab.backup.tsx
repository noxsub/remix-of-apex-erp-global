import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { FlokiCore } from "@/components/floki/FlokiCore";
import { FlokiDetails } from "@/components/floki/FlokiDetails";
import { flokiActivitiesMock } from "@/components/floki/floki-activity.mock";
import type {
  FlokiActivity,
  FlokiActivityArea,
} from "@/components/floki/floki-activity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAuthenticatedRoute } from "@/lib/require-auth";

export const Route = createFileRoute("/home")({
  beforeLoad: async () => {
    return requireAuthenticatedRoute();
  },

  head: () => ({
    meta: [
      {
        title: "Home — Syntera ERP",
      },
      {
        name: "description",
        content:
          "Home inteligente do Syntera, conduzida pelo Floki.",
      },
    ],
  }),

  component: HomePage,
});

const areaConfig: Record<
  FlokiActivityArea,
  {
    label: string;
    accent: string;
    soft: string;
    border: string;
    glow: string;
  }
> = {
  FINANCEIRO: {
    label: "Financeiro",
    accent: "text-amber-300",
    soft: "bg-amber-400/10",
    border: "border-amber-300/35",
    glow:
      "shadow-[0_0_80px_rgba(251,191,36,0.24)]",
  },

  RH: {
    label: "Recursos Humanos",
    accent: "text-sky-300",
    soft: "bg-sky-400/10",
    border: "border-sky-300/35",
    glow:
      "shadow-[0_0_80px_rgba(56,189,248,0.24)]",
  },

  COMPRAS: {
    label: "Compras",
    accent: "text-emerald-300",
    soft: "bg-emerald-400/10",
    border: "border-emerald-300/35",
    glow:
      "shadow-[0_0_80px_rgba(52,211,153,0.24)]",
  },

  ESTOQUE: {
    label: "Estoque",
    accent: "text-emerald-300",
    soft: "bg-emerald-400/10",
    border: "border-emerald-300/35",
    glow:
      "shadow-[0_0_80px_rgba(52,211,153,0.24)]",
  },

  FISCAL: {
    label: "Fiscal",
    accent: "text-violet-300",
    soft: "bg-violet-400/10",
    border: "border-violet-300/35",
    glow:
      "shadow-[0_0_80px_rgba(167,139,250,0.24)]",
  },

  COMERCIAL: {
    label: "Comercial",
    accent: "text-rose-300",
    soft: "bg-rose-400/10",
    border: "border-rose-300/35",
    glow:
      "shadow-[0_0_80px_rgba(251,113,133,0.24)]",
  },

  GESTAO: {
    label: "Gestão",
    accent: "text-slate-100",
    soft: "bg-white/10",
    border: "border-white/25",
    glow:
      "shadow-[0_0_80px_rgba(255,255,255,0.18)]",
  },
};

function HomePage() {
  const navigate = useNavigate();

  const [diaOrganizado, setDiaOrganizado] =
    useState(false);

  const [atividadeSelecionada, setAtividadeSelecionada] =
    useState<FlokiActivity | null>(null);

  const atividades = useMemo(
    () => flokiActivitiesMock,
    [],
  );

  const atividadeAtual = atividades[0] ?? null;

  async function abrirAtividade(
    atividade: FlokiActivity,
  ) {
    await navigate({
      to: atividade.route,
    });
  }

  return (
    <AppShell
      title="Bom dia, Bruno."
      subtitle="O Floki já verificou o ambiente e está pronto para conduzir suas prioridades."
    >
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_50%,rgba(251,191,36,0.13),transparent_34%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative grid min-h-[610px] items-center gap-6 px-6 py-8 xl:grid-cols-[minmax(320px,0.95fr)_minmax(320px,1.05fr)] xl:px-10">
          <section className="relative flex min-h-[460px] items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-amber-300/5 blur-3xl" />

            <FlokiCore
              active={diaOrganizado}
              size={440}
            />

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Floki
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Ativo e monitorando o ambiente
              </p>
            </div>
          </section>

          <section className="flex min-w-0 flex-col justify-center">
            {!diaOrganizado && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Assistente de prioridades
                </p>

                <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">
                 Encontrei {atividades.length} prioridades para hoje.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                  Posso organizar seu dia e apresentar uma
                  atividade por vez, na ordem de maior impacto?
                </p>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => setDiaOrganizado(true)}
                  className="mt-7 gap-2 px-7"
                >
                  Organizar meu dia
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {diaOrganizado && atividadeAtual && (
              <Card
                className={`w-full max-w-xl animate-in fade-in slide-in-from-right-5 border bg-slate-900/80 p-6 text-left backdrop-blur-xl duration-500 ${
                  areaConfig[atividadeAtual.area].border
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                        areaConfig[atividadeAtual.area].accent
                      }`}
                    >
                      Primeira prioridade
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold text-slate-100">
                      {atividadeAtual.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {atividadeAtual.summary}
                    </p>
                  </div>

                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-slate-600" />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDiaOrganizado(false)}
                  >
                    Agora não
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      setAtividadeSelecionada(
                        atividadeAtual,
                      )
                    }
                    className="gap-2"
                  >
                    Resolver agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </section>
        </div>
      </div>

      {atividadeSelecionada && (
        <FlokiDetails
          activity={atividadeSelecionada}
          areaConfig={areaConfig}
          onClose={() =>
            setAtividadeSelecionada(null)
          }
          onOpenActivity={() => {
            void abrirAtividade(
              atividadeSelecionada,
            );
          }}
        />
      )}
    </AppShell>
  )};
