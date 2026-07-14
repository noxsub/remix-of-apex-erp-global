import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Radar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Circle,
} from "lucide-react";
import {
  useObjetivos,
  useAreasOkr,
  progressoKr,
  saudeDoProgresso,
  SAUDE_COR,
  SAUDE_LABEL,
  type KeyResult,
} from "@/lib/vetorcore-store";
import { useVetorCoreSync } from "@/lib/vetorcore-sync";

export const Route = createFileRoute("/vetorcore")({
  head: () => ({ meta: [{ title: "VetorCore — Visão da Diretoria" }] }),
  component: VetorCoreDiretoria,
});

/* ═══════════════════════════════════════════════════════════════
   PALETA — Moderno-Clássico / Clean Corporate
   Fundo cinza muito claro, texto grafite, azul marinho/aço,
   verde/vermelho discretos só para status. Deliberadamente
   distinto da paleta dourada do restante do Syntera — o VetorCore
   é um módulo premium com identidade visual própria.
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: "#F4F5F7",
  card: "#FFFFFF",
  border: "#E2E4E9",
  graphite: "#2B2E33",
  graphiteSoft: "#6B7078",
  navy: "#1E3A5F",
  steel: "#3D5A73",
};

function fmtValor(v: number, unidade: KeyResult["unidade"]): string {
  if (unidade === "moeda") return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  if (unidade === "percentual") return `${v}%`;
  return String(v);
}

function VetorCoreDiretoria() {
  const krsAoVivo = useVetorCoreSync();
  const [objetivos] = useObjetivos();
  const [areas] = useAreasOkr();
  const [trimestre, setTrimestre] = useState("Q3-2026");
  const [areaExpandida, setAreaExpandida] = useState<string | null>(null);

  const objetivosDoTrimestre = objetivos.filter((o) => o.trimestre === trimestre);

  const krsPorArea = useMemo(() => {
    const mapa = new Map<string, KeyResult[]>();
    for (const area of areas) {
      const objIds = objetivosDoTrimestre.filter((o) => o.areaId === area.id).map((o) => o.id);
      const krIds = new Set(objetivosDoTrimestre.filter((o) => objIds.includes(o.id)).flatMap((o) => o.krIds));
      mapa.set(area.id, krsAoVivo.filter((kr) => krIds.has(kr.id)));
    }
    return mapa;
  }, [areas, objetivosDoTrimestre, krsAoVivo]);

  const roolupGlobal = useMemo(() => {
    const todos = [...krsPorArea.values()].flat();
    const media = todos.length ? Math.round(todos.reduce((s, kr) => s + progressoKr(kr), 0) / todos.length) : 0;
    const criticos = todos.filter((kr) => saudeDoProgresso(progressoKr(kr)) === "critico").length;
    return { media, criticos, total: todos.length };
  }, [krsPorArea]);

  const alertasCriticos = useMemo(() => {
    return [...krsPorArea.values()]
      .flat()
      .filter((kr) => saudeDoProgresso(progressoKr(kr)) === "critico")
      .sort((a, b) => progressoKr(a) - progressoKr(b));
  }, [krsPorArea]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.graphite, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── HEADER EXECUTIVO ── */}
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
        style={{ background: C.card, borderColor: C.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md"
            style={{ background: C.navy }}
          >
            <Radar className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">VetorCore</h1>
              <span className="text-xs" style={{ color: C.graphiteSoft }}>Visão da Diretoria</span>
            </div>
            <Link to="/dashboard" className="text-[11px] hover:underline" style={{ color: C.steel }}>
              ← Voltar ao Syntera ERP
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
            className="h-8 rounded-md border px-2.5 text-xs font-medium"
            style={{ borderColor: C.border, color: C.graphite }}
          >
            <option value="Q3-2026">Q3 2026</option>
            <option value="Q2-2026">Q2 2026</option>
            <option value="Q1-2026">Q1 2026</option>
          </select>

          {/* Indicador Live */}
          <div
            className="flex items-center gap-1.5 rounded-full border px-3 py-1"
            style={{ borderColor: "#2F7D5C33", background: "#2F7D5C0D" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "#2F7D5C" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#2F7D5C" }} />
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "#2F7D5C" }}>Live</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* ── ALERTA DE DESVIO CRÍTICO ── */}
        {alertasCriticos.length > 0 && (
          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{ borderColor: "#B54B3F33", background: "#B54B3F0D" }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#B54B3F" }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#B54B3F" }}>
                {alertasCriticos.length} resultado(s)-chave em desvio crítico
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {alertasCriticos.map((kr) => (
                  <span
                    key={kr.id}
                    className="rounded border px-2 py-1 text-[11px]"
                    style={{ borderColor: "#B54B3F40", background: C.card, color: C.graphite }}
                  >
                    {kr.titulo} — {progressoKr(kr)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CARDS DE ROLL-UP GLOBAL ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardRollup
            label="Progresso Consolidado"
            valor={`${roolupGlobal.media}%`}
            tendencia={roolupGlobal.media >= 70 ? "up" : roolupGlobal.media >= 40 ? "flat" : "down"}
            destaque
          />
          <CardRollup label="Key Results Ativos" valor={String(roolupGlobal.total)} tendencia="flat" />
          <CardRollup
            label="Em Desvio Crítico"
            valor={String(roolupGlobal.criticos)}
            tendencia={roolupGlobal.criticos > 0 ? "down" : "up"}
            cor={roolupGlobal.criticos > 0 ? "#B54B3F" : undefined}
          />
          <CardRollup label="Áreas Monitoradas" valor={String(areas.length)} tendencia="flat" />
        </div>

        {/* ── ÁRVORE DE SAÚDE POR ÁREA ── */}
        <section className="rounded-lg border" style={{ borderColor: C.border, background: C.card }}>
          <div className="border-b px-5 py-3.5" style={{ borderColor: C.border }}>
            <h2 className="text-sm font-semibold">Saúde por Área</h2>
            <p className="text-[11px]" style={{ color: C.graphiteSoft }}>Clique para expandir os Key Results de cada área.</p>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {areas.map((area) => {
              const krsArea = krsPorArea.get(area.id) ?? [];
              const media = krsArea.length ? Math.round(krsArea.reduce((s, kr) => s + progressoKr(kr), 0) / krsArea.length) : 0;
              const saude = saudeDoProgresso(media);
              const expandida = areaExpandida === area.id;
              return (
                <div key={area.id}>
                  <button
                    onClick={() => setAreaExpandida(expandida ? null : area.id)}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 transition-transform"
                      style={{ color: C.graphiteSoft, transform: expandida ? "rotate(90deg)" : "none" }}
                    />
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: area.cor }} />
                    <div className="min-w-[140px]">
                      <p className="text-sm font-medium">{area.nome}</p>
                      <p className="text-[11px]" style={{ color: C.graphiteSoft }}>{area.responsavelNome}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#EEF0F3" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${media}%`, background: SAUDE_COR[saude] }} />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold tabular-nums">{media}%</span>
                    <span
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      style={{ borderColor: `${SAUDE_COR[saude]}40`, color: SAUDE_COR[saude], background: `${SAUDE_COR[saude]}0D` }}
                    >
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      {SAUDE_LABEL[saude]}
                    </span>
                  </button>

                  {expandida && (
                    <div className="space-y-2 px-5 pb-4 pl-12">
                      {krsArea.map((kr) => (
                        <LinhaKr key={kr.id} kr={kr} />
                      ))}
                      {krsArea.length === 0 && (
                        <p className="text-xs" style={{ color: C.graphiteSoft }}>Nenhum Key Result cadastrado para este trimestre.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TABELA EXECUTIVA — DESDOBRAMENTO DE METAS ── */}
        <section className="rounded-lg border" style={{ borderColor: C.border, background: C.card }}>
          <div className="border-b px-5 py-3.5" style={{ borderColor: C.border }}>
            <h2 className="text-sm font-semibold">Desdobramento de Metas — {trimestre}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider" style={{ borderColor: C.border, color: C.graphiteSoft }}>
                  <th className="px-5 py-2.5 font-medium">Objetivo</th>
                  <th className="px-3 py-2.5 font-medium">Área</th>
                  <th className="px-3 py-2.5 font-medium">Responsável</th>
                  <th className="px-3 py-2.5 font-medium">Progresso</th>
                  <th className="px-3 py-2.5 text-right font-medium">Atual / Meta</th>
                  <th className="px-5 py-2.5 text-right font-medium">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {objetivosDoTrimestre.map((obj) => {
                  const area = areas.find((a) => a.id === obj.areaId);
                  const krsObj = krsAoVivo.filter((kr) => obj.krIds.includes(kr.id));
                  return krsObj.map((kr, i) => {
                    const progresso = progressoKr(kr);
                    const saude = saudeDoProgresso(progresso);
                    return (
                      <tr key={kr.id} className="border-b last:border-0" style={{ borderColor: C.border }}>
                        <td className="px-5 py-3">
                          {i === 0 && <p className="text-xs font-semibold" style={{ color: C.graphite }}>{obj.titulo}</p>}
                          <p className="mt-0.5 text-[13px]" style={{ color: C.graphiteSoft }}>{kr.titulo}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 rounded-full" style={{ background: area?.cor }} />
                            {area?.nome}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs" style={{ color: C.graphiteSoft }}>{kr.responsavelNome}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "#EEF0F3" }}>
                              <div className="h-full rounded-full" style={{ width: `${progresso}%`, background: SAUDE_COR[saude] }} />
                            </div>
                            <span className="text-xs font-semibold tabular-nums" style={{ color: SAUDE_COR[saude] }}>{progresso}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-xs tabular-nums">
                          {fmtValor(kr.atualValor, kr.unidade)} / {fmtValor(kr.metaValor, kr.unidade)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs" style={{ color: C.graphiteSoft }}>{kr.prazo}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function CardRollup({
  label,
  valor,
  tendencia,
  destaque,
  cor,
}: {
  label: string;
  valor: string;
  tendencia: "up" | "down" | "flat";
  destaque?: boolean;
  cor?: string;
}) {
  const Icone = tendencia === "up" ? TrendingUp : tendencia === "down" ? TrendingDown : Minus;
  const corTendencia = tendencia === "up" ? "#2F7D5C" : tendencia === "down" ? "#B54B3F" : C.graphiteSoft;
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: destaque ? C.navy : C.border,
        background: destaque ? C.navy : C.card,
      }}
    >
      <p className="text-[11px] uppercase tracking-wider" style={{ color: destaque ? "#FFFFFFAA" : C.graphiteSoft }}>
        {label}
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-2xl font-semibold tabular-nums" style={{ color: cor ?? (destaque ? "#FFFFFF" : C.graphite) }}>
          {valor}
        </p>
        <Icone className="h-4 w-4" style={{ color: destaque ? "#FFFFFFAA" : corTendencia }} />
      </div>
    </div>
  );
}

function LinhaKr({ kr }: { kr: KeyResult }) {
  const progresso = progressoKr(kr);
  const saude = saudeDoProgresso(progresso);
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2" style={{ borderColor: C.border }}>
      <div className="min-w-[220px] flex-1">
        <p className="text-xs font-medium">{kr.titulo}</p>
        <p className="text-[11px]" style={{ color: C.graphiteSoft }}>{kr.responsavelNome}</p>
      </div>
      <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: "#EEF0F3" }}>
        <div className="h-full rounded-full" style={{ width: `${progresso}%`, background: SAUDE_COR[saude] }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums" style={{ color: SAUDE_COR[saude] }}>{progresso}%</span>
    </div>
  );
}
