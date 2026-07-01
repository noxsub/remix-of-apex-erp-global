import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import syntheraLogo from "@/assets/syntera-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syntera ERP — Enterprise Platform" },
      { name: "description", content: "Syntera ERP: plataforma corporativa integrada com IA Floki para gestão fiscal, financeira, vendas, estoque e RH." },
      { property: "og:title", content: "Syntera ERP — Enterprise Platform" },
      { property: "og:description", content: "ERP corporativo com IA Floki. Fiscal, financeiro, vendas, estoque, RH e mais." },
    ],
  }),
  component: SynteraDNA,
});

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

type Phase = "idle" | "exploding" | "login" | "success";
interface Particle { x: number; y: number; vx: number; vy: number; size: number; life: number; r: number; g: number; b: number; }

function SynteraDNA() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const [dims, setDims] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setDims({ w, h });
      const c = canvasRef.current;
      if (c) { const d = window.devicePixelRatio || 1; c.width = w * d; c.height = h * d; }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.005;
      const t = timeRef.current;
      const { w, h } = dims;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w * dpr, h * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.3;
      const N = MODULES.length;
      const logoR = 80;

      if (phase !== "success") {
        const gs = 56;
        ctx.fillStyle = "rgba(212,175,55,0.045)";
        for (let gx = gs / 2; gx < w; gx += gs)
          for (let gy = gs / 2; gy < h; gy += gs) {
            ctx.beginPath(); ctx.arc(gx, gy, 0.85, 0, Math.PI * 2); ctx.fill();
          }

        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
        cg.addColorStop(0, "rgba(212,175,55,0.1)");
        cg.addColorStop(1, "rgba(212,175,55,0)");
        ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();

        MODULES.forEach((mod, idx) => {
          const angle = (idx / N) * Math.PI * 2 - Math.PI / 2 + Math.sin(idx * 2.7) * 0.1;
          const mx = cx + Math.cos(angle) * R, my = cy + Math.sin(angle) * R;
          const act = activeModule === mod.id;
          const pulse = (Math.sin(t * 1.1 + idx * 0.6) + 1) / 2;
          const sx = cx + Math.cos(angle) * logoR, sy = cy + Math.sin(angle) * logoR;
          const horizontal = Math.abs(mx - sx) >= Math.abs(my - sy);
          const cX = horizontal ? mx : sx, cY = horizontal ? sy : my;
          const lineA = act ? 0.85 : 0.3 + pulse * 0.12;

          ctx.strokeStyle = `rgba(212,175,55,${lineA})`;
          ctx.lineWidth = act ? 1.8 : 1.1;
          ctx.lineCap = "square"; ctx.lineJoin = "miter";
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(cX, cY); ctx.lineTo(mx, my); ctx.stroke();

          ctx.beginPath(); ctx.arc(cX, cY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${lineA * 0.85})`; ctx.fill();

          const seg1 = Math.abs(cX - sx) + Math.abs(cY - sy);
          const seg2 = Math.abs(mx - cX) + Math.abs(my - cY);
          const total = seg1 + seg2;
          if (total > 1) {
            const pd = ((t * 0.32 + idx * 0.14) % 1) * total;
            let px: number, py: number;
            if (pd <= seg1 && seg1 > 0) {
              const tf = pd / seg1; px = sx + (cX - sx) * tf; py = sy + (cY - sy) * tf;
            } else if (seg2 > 0) {
              const tf = (pd - seg1) / seg2; px = cX + (mx - cX) * tf; py = cY + (my - cY) * tf;
            } else { px = mx; py = my; }
            const pg = ctx.createRadialGradient(px, py, 0, px, py, 10);
            pg.addColorStop(0, "rgba(240,200,70,0.9)");
            pg.addColorStop(1, "rgba(212,175,55,0)");
            ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
            ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,235,100,0.95)"; ctx.fill();
          }

          ctx.beginPath(); ctx.arc(mx, my, act ? 13 : 8, 0, Math.PI * 2);
          ctx.strokeStyle = act ? `rgba(212,175,55,${0.9 + pulse * 0.1})` : `rgba(212,175,55,${0.38 + pulse * 0.18})`;
          ctx.lineWidth = act ? 1.8 : 1.1; ctx.stroke();
          ctx.beginPath(); ctx.arc(mx, my, act ? 5 : 2.8, 0, Math.PI * 2);
          ctx.fillStyle = act ? "#D4AF37" : `rgba(212,175,55,${0.65 + pulse * 0.25})`; ctx.fill();
          if (act) {
            const ng = ctx.createRadialGradient(mx, my, 0, mx, my, 30);
            ng.addColorStop(0, "rgba(212,175,55,0.28)");
            ng.addColorStop(1, "rgba(212,175,55,0)");
            ctx.beginPath(); ctx.arc(mx, my, 30, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill();
          }
        });
      }

      if (phase === "exploding") {
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);
        particlesRef.current.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.968; p.vy *= 0.968; p.life -= 0.013;
          const a = Math.max(0, p.life), r = Math.max(0.1, p.size * a);
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${a * 0.88})`; ctx.fill();
        });
      }
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, phase, activeModule]);

  const handleLogoClick = () => {
    if (phase !== "idle") return;
    setPhase("exploding");
    const cx = dims.w / 2, cy = dims.h / 2;
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2, spd = 0.5 + Math.random() * 10;
      const gold = Math.random() > 0.28;
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 90,
        y: cy + (Math.random() - 0.5) * 90,
        vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
        size: 0.8 + Math.random() * 4.2,
        life: 0.6 + Math.random() * 0.4,
        r: gold ? 210 + Math.floor(Math.random() * 45) : 255,
        g: gold ? 140 + Math.floor(Math.random() * 70) : 210 + Math.floor(Math.random() * 45),
        b: gold ? 10 + Math.floor(Math.random() * 42) : 120 + Math.floor(Math.random() * 100),
      });
    }
    setTimeout(() => setPhase("login"), 1900);
  };

  const handleLogin = () => {
    if (loginId.toUpperCase() === "ADM" && loginPw === "123") {
      setPhase("success");
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  const R = Math.min(dims.w, dims.h) * 0.3;
  const cx = dims.w / 2, cy = dims.h / 2;
  const isMobile = dims.w < 680;

  const inputStyle: React.CSSProperties = {
    background: "rgba(212,175,55,0.04)",
    border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: 6,
    color: "rgba(255,248,230,0.82)",
    padding: "13px 16px",
    fontSize: 13.5,
    width: "100%",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
    outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#04070e", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />

      {/* Top brand */}
      <div style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", zIndex: 20, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.42em", color: "rgba(212,175,55,0.85)", fontWeight: 600 }}>SYNTERA ERP</div>
        <div style={{ fontSize: 9, letterSpacing: "0.32em", color: "rgba(212,175,55,0.35)", marginTop: 4 }}>ENTERPRISE PLATFORM</div>
      </div>

      {/* Module labels (desktop) */}
      {!isMobile && phase === "idle" && MODULES.map((mod, idx) => {
        const angle = (idx / MODULES.length) * Math.PI * 2 - Math.PI / 2 + Math.sin(idx * 2.7) * 0.1;
        const mx = cx + Math.cos(angle) * R, my = cy + Math.sin(angle) * R;
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const lx = mx + cosA * 20, ly = my + sinA * 20, LW = 110;
        const tAlign: "left" | "right" | "center" = cosA > 0.2 ? "left" : cosA < -0.2 ? "right" : "center";
        const left = tAlign === "left" ? Math.round(lx) : tAlign === "right" ? Math.round(lx - LW) : Math.round(lx - LW / 2);
        const act = activeModule === mod.id;
        return (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            style={{
              position: "absolute", left, top: Math.round(ly - 10), width: LW,
              background: "none", border: "none", padding: "3px 0",
              cursor: "pointer", textAlign: tAlign, zIndex: 10,
            }}
          >
            <span style={{
              fontSize: 10, letterSpacing: "0.18em", fontWeight: 600,
              color: act ? "rgba(255,235,140,0.95)" : "rgba(212,175,55,0.72)",
              textShadow: act ? "0 0 12px rgba(212,175,55,0.6)" : "none",
              textTransform: "uppercase",
            }}>{mod.label}</span>
          </button>
        );
      })}

      {/* Central logo (idle / exploding) */}
      {(phase === "idle" || phase === "exploding") && (
        <div
          onClick={handleLogoClick}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15, cursor: phase === "idle" ? "pointer" : "default",
            textAlign: "center",
            opacity: phase === "exploding" ? 0 : 1,
            transition: "opacity 0.4s ease",
            animation: "floatLogo 4s ease-in-out infinite",
          }}
        >
          <div style={{
            width: 130, height: 130, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(circle, rgba(212,175,55,0.15), rgba(0,0,0,0.9))",
            borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow: "0 0 60px rgba(212,175,55,0.35), inset 0 0 30px rgba(212,175,55,0.15)",
          }}>
            <img
              ref={logoImgRef}
              src={syntheraLogo.url}
              alt="Syntera"
              style={{ width: 96, height: 96, objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(212,175,55,0.6))" }}
              draggable={false}
            />
          </div>
          <div style={{ marginTop: 16, fontSize: 20, letterSpacing: "0.32em", color: "rgba(255,235,180,0.95)", fontWeight: 300 }}>SYNTERA</div>
          <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.28em", color: "rgba(212,175,55,0.55)", animation: "breathe 2.4s ease-in-out infinite" }}>
            CLIQUE PARA ENTRAR
          </div>
        </div>
      )}

      {/* Module pitch modal */}
      {activeModule && (() => {
        const mod = MODULES.find(m => m.id === activeModule);
        if (!mod) return null;
        return (
          <div
            onClick={() => setActiveModule(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(4,7,14,0.75)", backdropFilter: "blur(10px)",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(9,14,26,0.98)",
                border: "1px solid rgba(212,175,55,0.22)",
                borderLeft: "3px solid rgba(212,175,55,0.7)",
                borderRadius: "4px 14px 14px 4px",
                padding: "36px 38px",
                maxWidth: 420, width: "92%",
                animation: "fadeUp 0.28s ease",
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "rgba(212,175,55,0.55)", marginBottom: 10 }}>MÓDULO SYNTERA ERP</div>
              <div style={{ fontSize: 22, color: "rgba(255,235,180,0.95)", fontWeight: 300, marginBottom: 8 }}>{mod.pitch.title}</div>
              <div style={{ fontSize: 13, color: "rgba(212,175,55,0.85)", fontStyle: "italic", marginBottom: 18 }}>{mod.pitch.hook}</div>
              <div style={{ height: 1, background: "linear-gradient(90deg, rgba(212,175,55,0.4), transparent)", marginBottom: 18 }} />
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(230,220,190,0.75)", marginBottom: 18 }}>{mod.pitch.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
                {mod.pitch.kpis.map(k => (
                  <span key={k} style={{
                    fontSize: 10, padding: "5px 10px",
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.22)",
                    borderRadius: 4, color: "rgba(230,200,120,0.9)",
                    letterSpacing: "0.06em",
                  }}>{k}</span>
                ))}
              </div>
              <button
                onClick={() => { const target = mod.route; setActiveModule(null); navigate({ to: target }); }}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#9A7206,#D4AF37,#E8C84A)",
                  border: "none", borderRadius: 8,
                  color: "#04070e", fontWeight: 700,
                  fontSize: 12.5, letterSpacing: "0.18em",
                  padding: 13, cursor: "pointer",
                  fontFamily: "inherit", marginBottom: 8,
                }}
              >ACESSAR MÓDULO →</button>
              <button
                onClick={() => setActiveModule(null)}
                style={{
                  width: "100%", background: "none", border: "none",
                  color: "rgba(212,175,55,0.45)", fontSize: 10, padding: 8,
                  cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2em",
                }}
              >FECHAR</button>
            </div>
          </div>
        );
      })()}

      {/* Login */}
      {phase === "login" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20, width: 360,
          background: "rgba(9,14,26,0.92)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 12, padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(212,175,55,0.15)",
          animation: loginError ? "shake 0.4s" : "loginIn 0.5s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 18, letterSpacing: "0.32em", color: "rgba(255,235,180,0.95)", fontWeight: 300 }}>SYNTERA ERP</div>
            <div style={{ fontSize: 10, letterSpacing: "0.24em", color: "rgba(212,175,55,0.5)", marginTop: 6 }}>ENTERPRISE AI PLATFORM</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              value={loginId}
              onChange={(e) => { setLoginId(e.target.value); setLoginError(false); }}
              onKeyDown={handleKey}
              placeholder="ID do usuário"
              style={inputStyle}
              autoFocus
            />
            <input
              type="password"
              value={loginPw}
              onChange={(e) => { setLoginPw(e.target.value); setLoginError(false); }}
              onKeyDown={handleKey}
              placeholder="Senha"
              style={inputStyle}
            />
            {loginError && (
              <div style={{ fontSize: 11, color: "#ff6b6b", textAlign: "center", letterSpacing: "0.06em" }}>
                Credenciais inválidas
              </div>
            )}
            <button
              onClick={handleLogin}
              style={{
                marginTop: 4,
                background: "linear-gradient(135deg,#9A7206,#D4AF37,#E8C84A)",
                border: "none", borderRadius: 8,
                color: "#04070e", fontWeight: 700,
                fontSize: 12.5, letterSpacing: "0.22em",
                padding: 13, cursor: "pointer", fontFamily: "inherit",
              }}
            >ENTRAR</button>
            <button
              style={{
                background: "none", border: "none",
                color: "rgba(212,175,55,0.4)", fontSize: 10.5,
                padding: 6, cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.14em",
              }}
            >Esqueceu a senha?</button>
            <div style={{ fontSize: 10, color: "rgba(212,175,55,0.35)", textAlign: "center", marginTop: 6 }}>
              demo · ADM / 123
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {phase === "success" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 30, textAlign: "center",
          animation: "successIn 0.9s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize: 32, letterSpacing: "0.4em", color: "rgba(255,235,180,0.98)", fontWeight: 200 }}>BEM-VINDO</div>
          <div style={{ marginTop: 12, fontSize: 14, letterSpacing: "0.36em", color: "rgba(212,175,55,0.8)" }}>ADM</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 5, fontSize: 10, letterSpacing: "0.24em", color: "rgba(212,175,55,0.3)" }}>
        v2.6.0 — 2026
      </div>

      <style>{`
        @keyframes floatLogo { 0%,100%{transform:translate(-50%,-50%)} 50%{transform:translate(-50%,calc(-50% - 8px))} }
        @keyframes breathe { 0%,100%{opacity:0.35} 50%{opacity:0.75} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loginIn { from{opacity:0;transform:translate(-50%,calc(-50% + 20px))} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes shake {
          0%,100%{transform:translate(-50%,-50%)}
          20%{transform:translate(calc(-50% - 8px),-50%)}
          40%{transform:translate(calc(-50% + 8px),-50%)}
          60%{transform:translate(calc(-50% - 5px),-50%)}
          80%{transform:translate(calc(-50% + 5px),-50%)}
        }
        @keyframes successIn {
          0%{opacity:0;transform:translate(-50%,-50%) scale(0.88)}
          70%{opacity:1;transform:translate(-50%,-50%) scale(1.03)}
          100%{opacity:1;transform:translate(-50%,-50%) scale(1)}
        }
        input::placeholder { color: rgba(212,175,55,0.24); }
        input:focus { border-color: rgba(212,175,55,0.6) !important; background: rgba(212,175,55,0.06) !important; }
      `}</style>
    </div>
  );
}
