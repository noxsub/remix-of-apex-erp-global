import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Radar,
  CheckCircle2,
  Lock,
  MessageSquare,
  Clock,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useObjetivos,
  useAreasOkr,
  useKeyResults,
  progressoKr,
  saudeDoProgresso,
  SAUDE_COR,
  SAUDE_LABEL,
  type KeyResult,
} from "@/lib/vetorcore-store";
import { useVetorCoreSync } from "@/lib/vetorcore-sync";
import { useUsuarioAtual } from "@/lib/usuario-store";

export const Route = createFileRoute("/vetorcore/meus-okrs")({
  head: () => ({ meta: [{ title: "VetorCore — Meus OKRs" }] }),
  component: VetorCoreColaborador,
});

const C = {
  bg: "#F4F5F7",
  card: "#FFFFFF",
  border: "#E2E4E9",
  graphite: "#2B2E33",
  graphiteSoft: "#6B7078",
  navy: "#1E3A5F",
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

function VetorCoreColaborador() {
  const krsAoVivo = useVetorCoreSync();
  const [, setKrs] = useKeyResults();
  const [objetivos] = useObjetivos();
  const [areas] = useAreasOkr();
  const [usuario] = useUsuarioAtual();
  const [checkInKr, setCheckInKr] = useState<KeyResult | null>(null);

  const meusKrs = useMemo(
    () => krsAoVivo.filter((kr) => kr.responsavelMatricula === usuario.matricula),
    [krsAoVivo, usuario.matricula],
  );

  const meuProgresso = meusKrs.length
    ? Math.round(meusKrs.reduce((s, kr) => s + progressoKr(kr), 0) / meusKrs.length)
    : 0;

  const proximoPrazo = useMemo(() => {
    if (!meusKrs.length) return null;
    const parse = (s: string) => {
      const [d, m, a] = s.split("/").map(Number);
      return new Date(a, m - 1, d).getTime();
    };
    return [...meusKrs].sort((a, b) => parse(a.prazo) - parse(b.prazo))[0];
  }, [meusKrs]);

  const fazerCheckIn = (kr: KeyResult, novoValor: number, comentario: string) => {
    setKrs((prev) =>
      prev.map((k) =>
        k.id === kr.id
          ? { ...k, atualValor: novoValor, ultimoComentario: comentario || k.ultimoComentario, atualizadoEm: new Date().toISOString() }
          : k,
      ),
    );
    setCheckInKr(null);
    toast.success("Check-in registrado!", { description: "Seu progresso foi atualizado." });
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.graphite, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
        style={{ background: C.card, borderColor: C.border }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ background: C.navy }}>
            <Radar className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">VetorCore</h1>
              <span className="text-xs" style={{ color: C.graphiteSoft }}>Meus OKRs</span>
            </div>
            <Link to="/vetorcore" className="text-[11px] hover:underline" style={{ color: C.navy }}>
              Ver Visão da Diretoria →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: C.border }}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: C.navy }}>
            {usuario.avatarIniciais}
          </div>
          <span className="text-xs font-medium">{usuario.nome}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        {/* ── RESUMO PESSOAL ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4" style={{ borderColor: C.border, background: C.card }}>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: C.graphiteSoft }}>Meu Progresso</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums" style={{ color: C.navy }}>{meuProgresso}%</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: C.border, background: C.card }}>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: C.graphiteSoft }}>Key Results</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums">{meusKrs.length}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: C.border, background: C.card }}>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: C.graphiteSoft }}>Próximo Prazo</p>
            <p className="mt-1.5 text-sm font-semibold">{proximoPrazo?.prazo ?? "—"}</p>
          </div>
        </div>

        {/* ── LISTA DE KRs ── */}
        <div className="space-y-3">
          {meusKrs.map((kr) => {
            const progresso = progressoKr(kr);
            const saude = saudeDoProgresso(progresso);
            const area = areas.find((a) => a.id === kr.areaId);
            const objetivo = objetivos.find((o) => o.krIds.includes(kr.id));
            const editavel = kr.origemAuto === "manual" || !kr.origemAuto;

            return (
              <div key={kr.id} className="rounded-lg border p-4" style={{ borderColor: C.border, background: C.card }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: area?.cor }} />
                      <span className="text-[11px]" style={{ color: C.graphiteSoft }}>{area?.nome} · {objetivo?.titulo}</span>
                    </div>
                    <p className="text-sm font-semibold">{kr.titulo}</p>
                  </div>
                  <span
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{ borderColor: `${SAUDE_COR[saude]}40`, color: SAUDE_COR[saude], background: `${SAUDE_COR[saude]}0D` }}
                  >
                    <Target className="h-3 w-3" />
                    {SAUDE_LABEL[saude]}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "#EEF0F3" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, background: SAUDE_COR[saude] }} />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold tabular-nums" style={{ color: SAUDE_COR[saude] }}>{progresso}%</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.graphiteSoft }}>
                  <span>{fmtValor(kr.atualValor, kr.unidade)} de {fmtValor(kr.metaValor, kr.unidade)} · prazo {kr.prazo}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Atualizado {tempoRelativo(kr.atualizadoEm)}
                  </span>
                </div>

                {kr.ultimoComentario && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-md p-2 text-[11px]" style={{ background: "#F4F5F7" }}>
                    <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" style={{ color: C.graphiteSoft }} />
                    <span style={{ color: C.graphiteSoft }}>{kr.ultimoComentario}</span>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  {editavel ? (
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => setCheckInKr(kr)}>
                      <CheckCircle2 className="h-3 w-3" /> Fazer Check-in
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: C.graphiteSoft }}>
                      <Lock className="h-3 w-3" /> Atualizado automaticamente pelo ERP
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {meusKrs.length === 0 && (
            <div className="rounded-lg border p-8 text-center" style={{ borderColor: C.border, background: C.card }}>
              <p className="text-sm" style={{ color: C.graphiteSoft }}>
                Nenhum Key Result atribuído a você neste momento.
              </p>
            </div>
          )}
        </div>
      </main>

      {checkInKr && (
        <CheckInDialog kr={checkInKr} onClose={() => setCheckInKr(null)} onConfirmar={fazerCheckIn} />
      )}
    </div>
  );
}

function CheckInDialog({
  kr,
  onClose,
  onConfirmar,
}: {
  kr: KeyResult;
  onClose: () => void;
  onConfirmar: (kr: KeyResult, novoValor: number, comentario: string) => void;
}) {
  const [valor, setValor] = useState(String(kr.atualValor));
  const [comentario, setComentario] = useState("");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Check-in</DialogTitle>
          <DialogDescription>{kr.titulo}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Novo valor atual</Label>
            <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Comentário (opcional)</Label>
            <Textarea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="O que mudou desde o último check-in?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => onConfirmar(kr, Number(valor) || 0, comentario)}>Confirmar Check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
