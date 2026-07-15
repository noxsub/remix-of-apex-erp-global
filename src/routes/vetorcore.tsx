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
  Bell,
  X,
  Plus,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useAlertasVetorCore,
  useDetectorDeAlertasVetorCore,
  marcarAlertaComoLido,
  marcarTodosComoLidos,
} from "@/lib/vetorcore-alerts";
import {
  useObjetivos,
  useAreasOkr,
  useKeyResults,
  progressoKr,
  saudeDoProgresso,
  SAUDE_COR,
  SAUDE_LABEL,
  type KeyResult,
  type Objetivo,
  type SaudeStatus,
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

function tempoRelativo(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `há ${diffD} dia(s)`;
}

function VetorCoreDiretoria() {
  const krsAoVivo = useVetorCoreSync();
  useDetectorDeAlertasVetorCore();
  const [alertas, setAlertas] = useAlertasVetorCore();
  const [painelAlertasAberto, setPainelAlertasAberto] = useState(false);
  const [objetivos, setObjetivos] = useObjetivos();
  const [, setKrsRaw] = useKeyResults();
  const [areas] = useAreasOkr();
  const [trimestre, setTrimestre] = useState("Q3-2026");
  const [areaExpandida, setAreaExpandida] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState("todas");
  const [filtroSaude, setFiltroSaude] = useState<"todas" | SaudeStatus>("todas");

  const [objetivoEditando, setObjetivoEditando] = useState<Objetivo | "novo" | null>(null);
  const [krEditando, setKrEditando] = useState<KeyResult | "novo" | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<{ tipo: "objetivo" | "kr"; id: string; titulo: string } | null>(null);

  const objetivosDoTrimestre = objetivos.filter(
    (o) => o.trimestre === trimestre && (filtroArea === "todas" || o.areaId === filtroArea),
  );

  const excluirObjetivo = (id: string) => {
    const obj = objetivos.find((o) => o.id === id);
    if (!obj) return;
    setObjetivos((prev) => prev.filter((o) => o.id !== id));
    setKrsRaw((prev) => prev.filter((kr) => !obj.krIds.includes(kr.id)));
    toast.success("Objetivo e seus Key Results foram excluídos.");
  };

  const excluirKr = (id: string) => {
    setKrsRaw((prev) => prev.filter((kr) => kr.id !== id));
    setObjetivos((prev) => prev.map((o) => ({ ...o, krIds: o.krIds.filter((k) => k !== id) })));
    toast.success("Key Result excluído.");
  };

  const krsPorArea = useMemo(() => {
    const mapa = new Map<string, KeyResult[]>();
    for (const area of areas) {
      const objIds = objetivosDoTrimestre.filter((o) => o.areaId === area.id).map((o) => o.id);
      const krIds = new Set(objetivosDoTrimestre.filter((o) => objIds.includes(o.id)).flatMap((o) => o.krIds));
      const krsFiltrados = krsAoVivo.filter((kr) => {
        if (!krIds.has(kr.id)) return false;
        if (filtroSaude !== "todas" && saudeDoProgresso(progressoKr(kr)) !== filtroSaude) return false;
        return true;
      });
      mapa.set(area.id, krsFiltrados);
    }
    return mapa;
  }, [areas, objetivosDoTrimestre, krsAoVivo, filtroSaude]);

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
            {" · "}
            <Link to="/vetorcore/meus-okrs" className="text-[11px] hover:underline" style={{ color: C.steel }}>
              Meus OKRs →
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

          {/* Sino de alertas */}
          <div className="relative">
            <button
              onClick={() => setPainelAlertasAberto((v) => !v)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: C.border }}
            >
              <Bell className="h-4 w-4" style={{ color: C.graphiteSoft }} />
              {alertas.some((a) => !a.lido) && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: "#B54B3F" }}
                >
                  {alertas.filter((a) => !a.lido).length}
                </span>
              )}
            </button>

            {painelAlertasAberto && (
              <div
                className="absolute right-0 top-10 z-20 w-80 rounded-lg border shadow-lg"
                style={{ borderColor: C.border, background: C.card }}
              >
                <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: C.border }}>
                  <p className="text-xs font-semibold">Alertas de Desvio</p>
                  <div className="flex items-center gap-2">
                    {alertas.some((a) => !a.lido) && (
                      <button
                        onClick={() => marcarTodosComoLidos(setAlertas)}
                        className="text-[10px] hover:underline"
                        style={{ color: C.steel }}
                      >
                        Marcar tudo como lido
                      </button>
                    )}
                    <button onClick={() => setPainelAlertasAberto(false)}>
                      <X className="h-3.5 w-3.5" style={{ color: C.graphiteSoft }} />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alertas.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs" style={{ color: C.graphiteSoft }}>
                      Nenhum alerta até agora.
                    </p>
                  )}
                  {alertas.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => marcarAlertaComoLido(setAlertas, a.id)}
                      className="flex w-full items-start gap-2 border-b px-4 py-2.5 text-left last:border-0 hover:bg-black/[0.02]"
                      style={{ borderColor: C.border, opacity: a.lido ? 0.55 : 1 }}
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#B54B3F" }} />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{a.krTitulo}</p>
                        <p className="text-[10px]" style={{ color: C.graphiteSoft }}>
                          Caiu para {a.progresso}% · {tempoRelativo(a.criadoEm)}
                        </p>
                      </div>
                      {!a.lido && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#B54B3F" }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
        {/* ── FILTROS E AÇÕES ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5" style={{ color: C.graphiteSoft }} />
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as áreas</SelectItem>
                {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroSaude} onValueChange={(v) => setFiltroSaude(v as typeof filtroSaude)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda saúde</SelectItem>
                <SelectItem value="saudavel">Saudável</SelectItem>
                <SelectItem value="atencao">Atenção</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setObjetivoEditando("novo")}>
              <Plus className="h-3.5 w-3.5" /> Novo Objetivo
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs" style={{ background: C.navy }} onClick={() => setKrEditando("novo")}>
              <Plus className="h-3.5 w-3.5" /> Novo Key Result
            </Button>
          </div>
        </div>

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
                        <LinhaKr key={kr.id} kr={kr} onEditar={() => setKrEditando(kr)} onExcluir={() => setConfirmarExclusao({ tipo: "kr", id: kr.id, titulo: kr.titulo })} />
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
                  <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {objetivosDoTrimestre.map((obj) => {
                  const area = areas.find((a) => a.id === obj.areaId);
                  const krsObj = krsAoVivo.filter(
                    (kr) =>
                      obj.krIds.includes(kr.id) &&
                      (filtroSaude === "todas" || saudeDoProgresso(progressoKr(kr)) === filtroSaude),
                  );
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
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <button onClick={() => setKrEditando(kr)} className="rounded p-1 hover:bg-black/5" title="Editar Key Result">
                              <Pencil className="h-3 w-3" style={{ color: C.graphiteSoft }} />
                            </button>
                            <button onClick={() => setConfirmarExclusao({ tipo: "kr", id: kr.id, titulo: kr.titulo })} className="rounded p-1 hover:bg-black/5" title="Excluir Key Result">
                              <Trash2 className="h-3 w-3" style={{ color: "#B54B3F" }} />
                            </button>
                            {i === 0 && (
                              <button onClick={() => setConfirmarExclusao({ tipo: "objetivo", id: obj.id, titulo: obj.titulo })} className="rounded p-1 hover:bg-black/5" title="Excluir Objetivo inteiro">
                                <X className="h-3 w-3" style={{ color: "#B54B3F" }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {objetivoEditando && (
        <ObjetivoDialog
          objetivo={objetivoEditando === "novo" ? null : objetivoEditando}
          areas={areas}
          trimestreAtual={trimestre}
          onClose={() => setObjetivoEditando(null)}
          onSalvar={(dados) => {
            if (objetivoEditando === "novo") {
              setObjetivos((prev) => [...prev, { ...dados, id: `obj-${Date.now()}`, krIds: [] }]);
              toast.success("Objetivo criado!");
            } else {
              setObjetivos((prev) => prev.map((o) => (o.id === objetivoEditando.id ? { ...o, ...dados } : o)));
              toast.success("Objetivo atualizado!");
            }
            setObjetivoEditando(null);
          }}
        />
      )}

      {krEditando && (
        <KeyResultDialog
          kr={krEditando === "novo" ? null : krEditando}
          areas={areas}
          objetivos={objetivos.filter((o) => o.trimestre === trimestre)}
          onClose={() => setKrEditando(null)}
          onSalvar={(dados, objetivoId) => {
            if (krEditando === "novo") {
              const novoId = `kr-${Date.now()}`;
              setKrsRaw((prev) => [...prev, { ...dados, id: novoId, atualizadoEm: new Date().toISOString() }]);
              setObjetivos((prev) => prev.map((o) => (o.id === objetivoId ? { ...o, krIds: [...o.krIds, novoId] } : o)));
              toast.success("Key Result criado!");
            } else {
              setKrsRaw((prev) => prev.map((k) => (k.id === krEditando.id ? { ...k, ...dados } : k)));
              toast.success("Key Result atualizado!");
            }
            setKrEditando(null);
          }}
        />
      )}

      {confirmarExclusao && (
        <Dialog open onOpenChange={(v) => !v && setConfirmarExclusao(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <p className="text-sm" style={{ color: C.graphiteSoft }}>
              {confirmarExclusao.tipo === "objetivo"
                ? <>Excluir o objetivo <strong>"{confirmarExclusao.titulo}"</strong> também remove todos os seus Key Results. Esta ação não pode ser desfeita.</>
                : <>Excluir o Key Result <strong>"{confirmarExclusao.titulo}"</strong>? Esta ação não pode ser desfeita.</>}
            </p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setConfirmarExclusao(null)}>Cancelar</Button>
              <Button
                size="sm"
                style={{ background: "#B54B3F" }}
                onClick={() => {
                  if (confirmarExclusao.tipo === "objetivo") excluirObjetivo(confirmarExclusao.id);
                  else excluirKr(confirmarExclusao.id);
                  setConfirmarExclusao(null);
                }}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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

function LinhaKr({ kr, onEditar, onExcluir }: { kr: KeyResult; onEditar: () => void; onExcluir: () => void }) {
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
      <div className="flex items-center gap-0.5">
        <button onClick={onEditar} className="rounded p-1 hover:bg-black/5"><Pencil className="h-3 w-3" style={{ color: C.graphiteSoft }} /></button>
        <button onClick={onExcluir} className="rounded p-1 hover:bg-black/5"><Trash2 className="h-3 w-3" style={{ color: "#B54B3F" }} /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CRUD — Objetivo e Key Result
   ═══════════════════════════════════════════════════════════════ */

function ObjetivoDialog({
  objetivo,
  areas,
  trimestreAtual,
  onClose,
  onSalvar,
}: {
  objetivo: Objetivo | null;
  areas: { id: string; nome: string }[];
  trimestreAtual: string;
  onClose: () => void;
  onSalvar: (dados: Omit<Objetivo, "id" | "krIds">) => void;
}) {
  const [titulo, setTitulo] = useState(objetivo?.titulo ?? "");
  const [areaId, setAreaId] = useState(objetivo?.areaId ?? areas[0]?.id ?? "");
  const [trimestre, setTrimestre] = useState(objetivo?.trimestre ?? trimestreAtual);

  const salvar = () => {
    if (!titulo.trim() || !areaId) {
      toast.error("Preencha o título e selecione uma área.");
      return;
    }
    onSalvar({ titulo, areaId, trimestre });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{objetivo ? "Editar Objetivo" : "Novo Objetivo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Acelerar receita recorrente" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Área *</Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Trimestre</Label>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1-2026">Q1 2026</SelectItem>
                <SelectItem value="Q2-2026">Q2 2026</SelectItem>
                <SelectItem value="Q3-2026">Q3 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={salvar}>{objetivo ? "Salvar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KeyResultDialog({
  kr,
  areas,
  objetivos,
  onClose,
  onSalvar,
}: {
  kr: KeyResult | null;
  areas: { id: string; nome: string }[];
  objetivos: Objetivo[];
  onClose: () => void;
  onSalvar: (dados: Omit<KeyResult, "id" | "atualizadoEm">, objetivoId: string) => void;
}) {
  const [titulo, setTitulo] = useState(kr?.titulo ?? "");
  const [objetivoId, setObjetivoId] = useState(objetivos.find((o) => o.krIds.includes(kr?.id ?? ""))?.id ?? objetivos[0]?.id ?? "");
  const [areaId, setAreaId] = useState(kr?.areaId ?? areas[0]?.id ?? "");
  const [responsavelNome, setResponsavelNome] = useState(kr?.responsavelNome ?? "");
  const [responsavelMatricula, setResponsavelMatricula] = useState(kr?.responsavelMatricula ?? "");
  const [metaValor, setMetaValor] = useState(String(kr?.metaValor ?? ""));
  const [atualValor, setAtualValor] = useState(String(kr?.atualValor ?? "0"));
  const [unidade, setUnidade] = useState<KeyResult["unidade"]>(kr?.unidade ?? "numero");
  const [prazo, setPrazo] = useState(kr?.prazo ?? "");

  const salvar = () => {
    if (!titulo.trim() || !responsavelNome.trim() || !metaValor || !prazo) {
      toast.error("Preencha título, responsável, meta e prazo.");
      return;
    }
    onSalvar(
      {
        titulo,
        areaId,
        responsavelNome,
        responsavelMatricula,
        metaValor: Number(metaValor),
        atualValor: Number(atualValor) || 0,
        unidade,
        prazo,
        origemAuto: kr?.origemAuto ?? "manual",
        historico: kr?.historico,
        ultimoComentario: kr?.ultimoComentario,
      },
      objetivoId,
    );
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{kr ? "Editar Key Result" : "Novo Key Result"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          {!kr && (
            <div className="space-y-1.5">
              <Label className="text-xs">Objetivo *</Label>
              <Select value={objetivoId} onValueChange={setObjetivoId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {objetivos.map((o) => <SelectItem key={o.id} value={o.id}>{o.titulo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Área</Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Responsável *</Label>
              <Input value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Matrícula</Label>
              <Input value={responsavelMatricula} onChange={(e) => setResponsavelMatricula(e.target.value)} placeholder="Ex: 002" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Meta *</Label>
              <Input type="number" value={metaValor} onChange={(e) => setMetaValor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Atual</Label>
              <Input type="number" value={atualValor} onChange={(e) => setAtualValor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unidade</Label>
              <Select value={unidade} onValueChange={(v) => setUnidade(v as KeyResult["unidade"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="numero">Número</SelectItem>
                  <SelectItem value="moeda">R$</SelectItem>
                  <SelectItem value="percentual">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Prazo *</Label>
            <Input value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="dd/mm/aaaa" />
          </div>
          {kr?.origemAuto && kr.origemAuto !== "manual" && (
            <p className="rounded-md p-2 text-[11px]" style={{ background: "#F4F5F7", color: C.graphiteSoft }}>
              ⚠️ Este Key Result é atualizado automaticamente pelo ERP ({kr.origemAuto}). Editar o "Atual" aqui será sobrescrito na próxima sincronização.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={salvar}>{kr ? "Salvar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
