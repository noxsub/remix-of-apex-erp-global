import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  COLABORADORES_PONTO,
  TIPO_LABEL,
  fmtMinutos,
  marcacoesDoDia,
  minutosTrabalhados,
  proximaMarcacao,
  useMarcacoesPonto,
  type ColaboradorPonto,
} from "@/lib/ponto-store";

export const Route = createFileRoute("/ponto-app")({
  head: () => ({
    meta: [{ title: "Syntera Ponto — Registro de Jornada" }],
  }),
  component: PontoApp,
});

/* ═══════════════════════════════════════════════════════════════
   SYNTERA PONTO — aplicativo independente (quiosque)
   Tela própria, fora do shell do ERP. Colaborador se identifica
   com matrícula + PIN e registra a jornada. Os dados sincronizam
   com RH → Controle de Ponto automaticamente (ponto-store).
   ═══════════════════════════════════════════════════════════════ */

const GOLD = "#D4AF37";

function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return agora;
}

function PontoApp() {
  const agora = useRelogio();
  const [marcacoes, setMarcacoes] = useMarcacoesPonto();
  const [colab, setColab] = useState<ColaboradorPonto | null>(null);
  const [pin, setPin] = useState("");
  const [erroPin, setErroPin] = useState(false);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const hojeISO = agora.toISOString().slice(0, 10);
  const doDia = useMemo(
    () => (colab ? marcacoesDoDia(marcacoes, colab.matricula, hojeISO) : []),
    [marcacoes, colab, hojeISO],
  );
  const ultima = doDia.length ? doDia[doDia.length - 1].tipo : null;
  const proxima = proximaMarcacao(ultima);
  const trabalhado = minutosTrabalhados(doDia);

  const autenticar = (c: ColaboradorPonto) => {
    if (pin === c.pin) {
      setColab(c);
      setPin("");
      setErroPin(false);
    } else {
      setErroPin(true);
      setTimeout(() => setErroPin(false), 1600);
    }
  };

  const registrar = () => {
    if (!colab) return;
    const nova = {
      id: `pt-${Date.now()}`,
      matricula: colab.matricula,
      nome: colab.nome,
      tipo: proxima,
      timestamp: new Date().toISOString(),
      origem: "app" as const,
    };
    setMarcacoes((prev) => [...prev, nova]);
    setConfirmacao(`${TIPO_LABEL[proxima]} registrada às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
    setTimeout(() => setConfirmacao(null), 3200);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto px-4 py-8 select-none"
      style={{ background: "#04070e", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* marca */}
      <div className="mb-6 text-center">
        <div style={{ fontSize: 13, letterSpacing: "0.4em", color: "rgba(212,175,55,0.9)", fontWeight: 600 }}>
          SYNTERA PONTO
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(212,175,55,0.4)", marginTop: 4 }}>
          REGISTRO DE JORNADA · INTEGRADO AO RH
        </div>
      </div>

      {/* relógio */}
      <div className="mb-8 text-center">
        <div style={{ fontSize: 56, fontWeight: 200, color: "rgba(255,245,220,0.95)", fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>
          {agora.toLocaleTimeString("pt-BR")}
        </div>
        <div style={{ fontSize: 13, color: "rgba(212,175,55,0.6)", textTransform: "capitalize" }}>
          {agora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>

      {!colab ? (
        /* ── Identificação ── */
        <div className="w-full max-w-md">
          <p className="mb-3 text-center text-xs uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.55)" }}>
            Selecione seu nome e digite o PIN
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {COLABORADORES_PONTO.map((c) => (
              <button
                key={c.matricula}
                onClick={() => autenticar(c)}
                className="rounded-lg border px-3 py-3 text-left transition-all hover:brightness-125"
                style={{
                  borderColor: "rgba(212,175,55,0.25)",
                  background: "rgba(212,175,55,0.05)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "rgba(255,245,220,0.9)" }}>{c.nome}</p>
                <p className="text-[10px]" style={{ color: "rgba(212,175,55,0.5)" }}>
                  Mat. {c.matricula} · {c.cargo}
                </p>
              </button>
            ))}
          </div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="PIN (4 dígitos)"
            className="w-full rounded-lg border bg-transparent px-4 py-3 text-center text-lg tracking-[0.5em] outline-none"
            style={{
              borderColor: erroPin ? "#ef4444" : "rgba(212,175,55,0.3)",
              color: "rgba(255,245,220,0.9)",
            }}
          />
          {erroPin && (
            <p className="mt-2 text-center text-xs" style={{ color: "#f87171" }}>
              PIN incorreto — tente novamente
            </p>
          )}
          <p className="mt-3 text-center text-[10px]" style={{ color: "rgba(212,175,55,0.35)" }}>
            demo: PIN = matrícula repetida (ex.: 001 → 1111... 002 → 2222)
          </p>
        </div>
      ) : (
        /* ── Registro ── */
        <div className="w-full max-w-md text-center">
          <p className="text-sm" style={{ color: "rgba(255,245,220,0.9)" }}>
            Olá, <span className="font-semibold" style={{ color: GOLD }}>{colab.nome}</span>
          </p>
          <p className="mb-6 text-[11px]" style={{ color: "rgba(212,175,55,0.5)" }}>
            Mat. {colab.matricula} · {colab.cargo} · trabalhado hoje: {fmtMinutos(trabalhado)}
          </p>

          <button
            onClick={registrar}
            className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              background: "linear-gradient(160deg, #E8C84A, #D4AF37 55%, #9A7206)",
              boxShadow: "0 0 60px rgba(212,175,55,0.3)",
              color: "#0a0a0a",
            }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Registrar</span>
            <span className="mt-1 text-lg font-bold leading-tight">{TIPO_LABEL[proxima]}</span>
          </button>

          {confirmacao && (
            <div
              className="mx-auto mt-5 max-w-xs rounded-lg border px-4 py-2.5 text-sm"
              style={{ borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.08)", color: "#4ade80" }}
            >
              ✓ {confirmacao}
            </div>
          )}

          {/* marcações de hoje */}
          <div className="mx-auto mt-8 max-w-xs text-left">
            <p className="mb-2 text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.5)" }}>
              Marcações de hoje
            </p>
            {doDia.length === 0 ? (
              <p className="text-xs" style={{ color: "rgba(255,245,220,0.35)" }}>Nenhuma marcação ainda.</p>
            ) : (
              <ul className="space-y-1.5">
                {doDia.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: "rgba(255,245,220,0.75)" }}>{TIPO_LABEL[m.tipo]}</span>
                    <span className="tabular-nums" style={{ color: GOLD }}>
                      {new Date(m.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setColab(null)}
            className="mt-8 text-xs underline-offset-4 hover:underline"
            style={{ color: "rgba(212,175,55,0.5)" }}
          >
            Encerrar sessão / trocar colaborador
          </button>
        </div>
      )}

      <div className="mt-auto pt-8">
        <Link to="/dashboard" className="text-[10px] tracking-widest hover:underline" style={{ color: "rgba(212,175,55,0.3)" }}>
          ← VOLTAR AO SYNTERA ERP
        </Link>
      </div>
    </div>
  );
}
