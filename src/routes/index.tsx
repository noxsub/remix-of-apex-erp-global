import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syntera ERP — Enterprise Platform" },
      { name: "description", content: "Syntera ERP: plataforma corporativa integrada com IA Floki para gestão fiscal, financeira, vendas, estoque e RH." },
      { property: "og:title", content: "Syntera ERP — Enterprise Platform" },
      { property: "og:description", content: "ERP corporativo com IA Floki. Fiscal, financeiro, vendas, estoque, RH e mais." },
    ],
  }),
  component: SynteraLanding,
});

/* ═══════════════════════════════════════════════════════════════
   MÓDULOS — conteúdo de marketing preservado
   ═══════════════════════════════════════════════════════════════ */
type ModuleId =
  | "financeiro" | "fiscal" | "entradas" | "saidas" | "estoque" | "rh"
  | "cadastros" | "obrigacoes" | "reforma" | "omnilink" | "bi" | "floki";

interface ModuleDef {
  id: ModuleId;
  label: string;
  route: string;
  pitch: { title: string; hook: string; desc: string; kpis: string[] };
}

const MODULES: ModuleDef[] = [
  { id: "financeiro", label: "Financeiro", route: "/financeiro", pitch: { title: "Financeiro", hook: "Visibilidade total do seu caixa", desc: "Fluxo de caixa em tempo real, DRE automático, conciliação bancária e gestão de contas. Tome decisões com dados, não com intuição.", kpis: ["DRE em 1 clique", "Conciliação automática", "Multi-empresa"] } },
  { id: "fiscal", label: "Fiscal", route: "/fiscal", pitch: { title: "Módulo Fiscal", hook: "Zero multas, zero retrabalho", desc: "NF-e, NFS-e e CT-e automáticos. SPED Fiscal, DCTF e ECF integrados. Conformidade permanente com a Receita Federal.", kpis: ["NF-e automática", "SPED integrado", "Alertas de prazo"] } },
  { id: "entradas", label: "Compras", route: "/entradas", pitch: { title: "Entradas & Compras", hook: "Elimine erros de entrada para sempre", desc: "Validação automática de NFs, pedidos de compra e cotações. Integrado ao estoque em tempo real com rastreabilidade completa.", kpis: ["Validação automática", "Cotações integradas", "Rastreabilidade"] } },
  { id: "saidas", label: "Vendas", route: "/saidas", pitch: { title: "Módulo de Vendas", hook: "Do orçamento à nota em segundos", desc: "Orçamentos, pedidos e faturamento em um único fluxo. Impostos automáticos e estoque atualizado em tempo real.", kpis: ["Orçamento rápido", "Faturamento automático", "Pipeline visual"] } },
  { id: "estoque", label: "Estoque", route: "/entradas/estoque", pitch: { title: "Controle de Estoque", hook: "Nunca mais perca produto", desc: "Saldo em tempo real, múltiplos depósitos, PEPS/custo médio e inventário com código de barras.", kpis: ["Multi-depósito", "PEPS / Custo Médio", "Inventário mobile"] } },
  { id: "rh", label: "RH", route: "/rh", pitch: { title: "Recursos Humanos", hook: "Folha sem dores de cabeça", desc: "Folha de pagamento, ponto eletrônico, férias e benefícios integrados. eSocial e CAGED automáticos.", kpis: ["eSocial integrado", "Ponto eletrônico", "Férias automáticas"] } },
  { id: "cadastros", label: "Cadastros", route: "/cadastros", pitch: { title: "Gestão de Cadastros", hook: "Dados precisos, processos impecáveis", desc: "Clientes, fornecedores e produtos com validação CNPJ/CPF via Receita Federal e consulta de CEP integrada.", kpis: ["Validação CNPJ/CPF", "Consulta Receita", "Histórico completo"] } },
  { id: "obrigacoes", label: "Obrigações", route: "/obrigacoes", pitch: { title: "Obrigações Fiscais", hook: "Nunca mais perca um prazo", desc: "Calendário fiscal inteligente com alertas automáticos, DARF, GPS e guias estaduais.", kpis: ["Alertas automáticos", "Geração de guias", "Dashboard fiscal"] } },
  { id: "reforma", label: "Reforma Tributária", route: "/reforma-tributaria", pitch: { title: "Reforma Tributária 2026", hook: "Pronto para o novo modelo fiscal", desc: "IBS/CBS automáticos, split payment nativo e transição gradual até 2033.", kpis: ["IBS / CBS nativo", "Split payment", "Transição automática"] } },
  { id: "omnilink", label: "Integrações", route: "/omnilink", pitch: { title: "Omnilink — Integrações", hook: "Conecte tudo ao seu ERP", desc: "API REST para marketplaces, PDV, bancos e sistemas legados. Webhooks em tempo real.", kpis: ["API REST nativa", "Webhooks em tempo real", "Marketplace connect"] } },
  { id: "bi", label: "BI / Relatórios", route: "/dashboard", pitch: { title: "Business Intelligence", hook: "Decisões baseadas em dados", desc: "Dashboards com KPIs em tempo real, exportação Excel e relatórios customizados.", kpis: ["Dashboards em tempo real", "Export Excel / PDF", "KPIs customizados"] } },
  { id: "floki", label: "Floki IA", route: "/dashboard", pitch: { title: "Floki — Inteligência Artificial", hook: "A IA que gerencia seu ERP", desc: "Analisa anomalias, prevê fluxo de caixa, alerta sobre riscos fiscais e sugere otimizações em toda a operação.", kpis: ["Análise preditiva", "Alertas de risco", "Sugestões automáticas"] } },
];

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE COORDENADAS FIXO (0-1000 x 0-600)
   Tudo é calculado nesse espaço e escalado via viewBox — garante
   alinhamento perfeito em qualquer tamanho de tela, sem depender
   de window.innerWidth/innerHeight (causa do desalinhamento anterior).
   ═══════════════════════════════════════════════════════════════ */
const VB_W = 1000;
const VB_H = 600;
const CX = 500;
const CY = 300;
const R = 190;
const LOGO_R = 62;

type NodePos = { id: ModuleId; x: number; y: number; anchor: "left" | "right" | "top" | "bottom" };

const NODE_POSITIONS: NodePos[] = MODULES.map((mod, idx) => {
  const N = MODULES.length;
  const angle = (idx / N) * Math.PI * 2 - Math.PI / 2 + Math.sin(idx * 2.7) * 0.12;
  const x = CX + Math.cos(angle) * R;
  const y = CY + Math.sin(angle) * R;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  let anchor: NodePos["anchor"] = "right";
  if (Math.abs(cosA) >= Math.abs(sinA)) {
    anchor = cosA >= 0 ? "right" : "left";
  } else {
    anchor = sinA >= 0 ? "bottom" : "top";
  }
  return { id: mod.id, x, y, anchor };
});

const posOf = (id: ModuleId) => NODE_POSITIONS.find((p) => p.id === id)!;

function SynteraLanding() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handleLogin = () => {
    if (loginId.trim().toUpperCase() === "ADM" && loginPw === "123") {
      navigate({ to: "/dashboard" });
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  const activePitch = activeModule ? MODULES.find((m) => m.id === activeModule) : null;

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: "#04070e", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Top brand ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <div style={{ fontSize: 12, letterSpacing: "0.42em", color: "rgba(212,175,55,0.85)", fontWeight: 600 }}>SYNTERA ERP</div>
        <div style={{ fontSize: 9, letterSpacing: "0.32em", color: "rgba(212,175,55,0.4)", marginTop: 4 }}>ENTERPRISE PLATFORM</div>
      </div>

      {/* ── Diagrama central: container com aspect-ratio travado ──
          Isso garante que o SVG (coordenadas) e os rótulos (HTML %)
          fiquem sempre alinhados entre si, em qualquer tela. ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(96vw, 1400px)",
          aspectRatio: `${VB_W} / ${VB_H}`,
          maxHeight: "88vh",
        }}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="halo"><stop offset="0%" stopColor="rgba(212,175,55,0.16)" /><stop offset="100%" stopColor="rgba(212,175,55,0)" /></radialGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D76E" /><stop offset="35%" stopColor="#D4AF37" /><stop offset="70%" stopColor="#C5A028" /><stop offset="100%" stopColor="#AA8B1E" />
            </linearGradient>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* dot grid de fundo */}
          {Array.from({ length: 18 }).flatMap((_, gx) =>
            Array.from({ length: 11 }).map((_, gy) => (
              <circle key={`g${gx}-${gy}`} cx={(gx + 0.5) * (VB_W / 18)} cy={(gy + 0.5) * (VB_H / 11)} r="0.9" fill="rgba(212,175,55,0.05)" />
            )),
          )}

          <circle cx={CX} cy={CY} r={110} fill="url(#halo)" />

          {/* conexões ortogonais logo → módulo */}
          {NODE_POSITIONS.map((p) => {
            const sx = CX + ((p.x - CX) / R) * LOGO_R;
            const sy = CY + ((p.y - CY) / R) * LOGO_R;
            const horizontal = Math.abs(p.x - sx) >= Math.abs(p.y - sy);
            const cx2 = horizontal ? p.x : sx;
            const cy2 = horizontal ? sy : p.y;
            const active = activeModule === p.id;
            return (
              <g key={`edge-${p.id}`}>
                <path
                  d={`M${sx} ${sy} L${cx2} ${cy2} L${p.x} ${p.y}`}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth={active ? 1.6 : 1}
                  opacity={active ? 0.75 : 0.24}
                />
                <circle cx={cx2} cy={cy2} r="2.4" fill="rgba(212,175,55,0.5)" />
              </g>
            );
          })}

          {/* nós dos módulos (clicáveis) */}
          {NODE_POSITIONS.map((p) => {
            const active = activeModule === p.id;
            return (
              <g
                key={`node-${p.id}`}
                onClick={() => setActiveModule(p.id)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={p.x} cy={p.y} r={active ? 15 : 20} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={active ? 12.5 : 9} fill="none" stroke="#D4AF37" strokeWidth={active ? 1.8 : 1.1} opacity={active ? 0.9 : 0.45} />
                <circle cx={p.x} cy={p.y} r={active ? 5 : 3} fill="#D4AF37" filter="url(#glow)" opacity={active ? 1 : 0.8} />
              </g>
            );
          })}

          {/* logo central "S" — desenhado em SVG, sem dependência externa */}
          <g
            transform={`translate(${CX - 34}, ${CY - 42})`}
            onClick={() => setShowLogin(true)}
            style={{ cursor: "pointer" }}
          >
            <circle cx="34" cy="42" r="58" fill="rgba(4,7,14,0.9)" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
            <path
              d="M50 14C50 14 41 8 30 8C19 8 11 14 11 22C11 30 18 34 30 38C42 42 51 46 51 58C51 70 42 76 30 76C18 76 9 69 9 69"
              stroke="url(#goldGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
          </g>
          <text x={CX} y={CY + 78} textAnchor="middle" fill="rgba(255,235,180,0.95)" fontSize="19" letterSpacing="7" fontWeight="300" fontFamily="inherit">SYNTERA</text>
          <text
            x={CX} y={CY + 100} textAnchor="middle" fill="rgba(212,175,55,0.55)" fontSize="9.5" letterSpacing="3" fontWeight="300" fontFamily="inherit"
            onClick={() => setShowLogin(true)} style={{ cursor: "pointer" }}
          >CLIQUE PARA ENTRAR</text>

          {/* rótulos dos módulos — SVG text, garante alinhamento perfeito com os nós */}
          {NODE_POSITIONS.map((p) => {
            const mod = MODULES.find((m) => m.id === p.id)!;
            const active = activeModule === p.id;
            const off: Record<NodePos["anchor"], { dx: number; dy: number; ta: "start" | "middle" | "end" }> = {
              left: { dx: -16, dy: 4, ta: "end" },
              right: { dx: 16, dy: 4, ta: "start" },
              top: { dx: 0, dy: -14, ta: "middle" },
              bottom: { dx: 0, dy: 22, ta: "middle" },
            };
            const o = off[p.anchor];
            return (
              <text
                key={`lbl-${p.id}`}
                x={p.x + o.dx}
                y={p.y + o.dy}
                textAnchor={o.ta}
                fill={active ? "rgba(255,235,140,0.95)" : "rgba(212,175,55,0.72)"}
                fontSize="12.5"
                fontWeight="600"
                letterSpacing="1.6"
                fontFamily="inherit"
                onClick={() => setActiveModule(p.id)}
                style={{ cursor: "pointer", textTransform: "uppercase" }}
              >
                {mod.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* ── Modal de módulo (pitch) ── */}
      {activePitch && (
        <div
          onClick={() => setActiveModule(null)}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(4,7,14,0.75)", backdropFilter: "blur(10px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(9,14,26,0.98)",
              border: "1px solid rgba(212,175,55,0.22)",
              borderLeft: "3px solid rgba(212,175,55,0.7)",
              borderRadius: "4px 14px 14px 4px",
              padding: "36px 38px",
              maxWidth: 420,
              width: "100%",
            }}
          >
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "rgba(212,175,55,0.55)", marginBottom: 10 }}>MÓDULO SYNTERA ERP</div>
            <div style={{ fontSize: 22, color: "rgba(255,235,180,0.95)", fontWeight: 300, marginBottom: 8 }}>{activePitch.pitch.title}</div>
            <div style={{ fontSize: 13, color: "rgba(212,175,55,0.85)", fontStyle: "italic", marginBottom: 18 }}>{activePitch.pitch.hook}</div>
            <div style={{ height: 1, background: "linear-gradient(90deg, rgba(212,175,55,0.4), transparent)", marginBottom: 18 }} />
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(230,220,190,0.75)", marginBottom: 18 }}>{activePitch.pitch.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
              {activePitch.pitch.kpis.map((k) => (
                <span key={k} style={{ fontSize: 10, padding: "5px 10px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.22)", borderRadius: 4, color: "rgba(230,200,120,0.9)", letterSpacing: "0.06em" }}>{k}</span>
              ))}
            </div>
            <button
              onClick={() => { const target = activePitch.route; setActiveModule(null); navigate({ to: target }); }}
              style={{ width: "100%", background: "linear-gradient(135deg,#9A7206,#D4AF37,#E8C84A)", border: "none", borderRadius: 8, color: "#04070e", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.18em", padding: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}
            >ACESSAR MÓDULO →</button>
            <button
              onClick={() => setActiveModule(null)}
              style={{ width: "100%", background: "none", border: "none", color: "rgba(212,175,55,0.45)", fontSize: 10, padding: 8, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2em" }}
            >FECHAR</button>
          </div>
        </div>
      )}

      {/* ── Login ── */}
      {showLogin && (
        <div
          onClick={() => setShowLogin(false)}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(4,7,14,0.75)", backdropFilter: "blur(10px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360, maxWidth: "100%",
              background: "rgba(9,14,26,0.96)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 12, padding: "36px 32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(212,175,55,0.15)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 18, letterSpacing: "0.32em", color: "rgba(255,235,180,0.95)", fontWeight: 300 }}>SYNTERA ERP</div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", color: "rgba(212,175,55,0.5)", marginTop: 6 }}>ENTERPRISE AI PLATFORM</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={loginId} onChange={(e) => { setLoginId(e.target.value); setLoginError(false); }} onKeyDown={handleKey} placeholder="ID do usuário" autoFocus
                style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 6, color: "rgba(255,248,230,0.82)", padding: "13px 16px", fontSize: 13.5, width: "100%", fontFamily: "inherit", outline: "none" }} />
              <input type="password" value={loginPw} onChange={(e) => { setLoginPw(e.target.value); setLoginError(false); }} onKeyDown={handleKey} placeholder="Senha"
                style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 6, color: "rgba(255,248,230,0.82)", padding: "13px 16px", fontSize: 13.5, width: "100%", fontFamily: "inherit", outline: "none" }} />
              {loginError && <div style={{ fontSize: 11, color: "#ff6b6b", textAlign: "center" }}>Credenciais inválidas</div>}
              <button onClick={handleLogin} style={{ marginTop: 4, background: "linear-gradient(135deg,#9A7206,#D4AF37,#E8C84A)", border: "none", borderRadius: 8, color: "#04070e", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.22em", padding: 13, cursor: "pointer", fontFamily: "inherit" }}>ENTRAR</button>
              <div style={{ fontSize: 10, color: "rgba(212,175,55,0.35)", textAlign: "center", marginTop: 6 }}>demo · ADM / 123</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" style={{ fontSize: 10, letterSpacing: "0.24em", color: "rgba(212,175,55,0.3)" }}>
        v2.6.0 — 2026
      </div>
    </div>
  );
}
