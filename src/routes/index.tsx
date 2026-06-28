import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Syntera ERP" }] }),
  component: SynteraDNA,
});

/* ═══════════════════════════════════════════════════════════════
   MÓDULOS DO ERP — cada nó da rede neural
   ═══════════════════════════════════════════════════════════════ */
const MODULES = [
  { id: "financeiro", label: "Financeiro", url: "/financeiro" },
  { id: "fiscal", label: "Fiscal", url: "/fiscal" },
  { id: "entradas", label: "Compras", url: "/entradas" },
  { id: "saidas", label: "Vendas", url: "/saidas" },
  { id: "estoque", label: "Estoque", url: "/estoque" },
  { id: "rh", label: "RH", url: "/rh" },
  { id: "cadastros", label: "Cadastros", url: "/cadastros" },
  { id: "obrigacoes", label: "Obrigações", url: "/obrigacoes" },
  { id: "reforma", label: "Reforma Tributária", url: "/reforma-tributaria" },
  { id: "omnilink", label: "Integrações", url: "/omnilink" },
  { id: "bi", label: "BI / Relatórios", url: "/saidas/relatorios" },
  { id: "floki", label: "Floki IA", url: "/omnilink" },
] as const;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES DE COR E ESTILO
   ═══════════════════════════════════════════════════════════════ */
const GOLD = "rgb(212,175,55)";
const GOLD_LIGHT = "rgba(212,175,55,0.6)";
const GOLD_DIM = "rgba(212,175,55,0.15)";
const GOLD_GLOW = "rgba(212,175,55,0.3)";
const WHITE_WARM = "rgba(255,248,230,0.9)";
const BG = "#050505";

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
function SynteraDNA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [expandProgress, setExpandProgress] = useState(0);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Responsive
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Expand animation
  useEffect(() => {
    let raf: number;
    const speed = prefersReduced ? 0.08 : 0.025;
    const tick = () => {
      setExpandProgress((p) => {
        const target = isHovered ? 1 : 0;
        const next = p + (target - p) * speed;
        if (Math.abs(next - target) < 0.001) return target;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isHovered, prefersReduced]);

  // Canvas neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    const cx = dims.w / 2;
    const cy = dims.h / 2;

    // Pre-calculate module positions
    const radius = Math.min(dims.w, dims.h) * 0.35;
    const modulePositions = MODULES.map((_, i) => {
      const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
      const jitter = Math.sin(i * 2.7) * 0.08;
      return {
        x: cx + Math.cos(angle + jitter) * radius,
        y: cy + Math.sin(angle + jitter) * radius,
      };
    });

    // Generate intermediate nodes
    const intermediateNodes: { x: number; y: number; parentIdx: number }[] = [];
    modulePositions.forEach((pos, i) => {
      const steps = 2 + Math.floor(Math.random() * 2);
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1);
        const jx = (Math.random() - 0.5) * radius * 0.3;
        const jy = (Math.random() - 0.5) * radius * 0.3;
        intermediateNodes.push({
          x: cx + (pos.x - cx) * t + jx,
          y: cy + (pos.y - cy) * t + jy,
          parentIdx: i,
        });
      }
    });

    let time = 0;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, dims.w, dims.h);

      if (expandProgress < 0.01) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const alpha = expandProgress;

      // Draw connections from center to intermediate nodes
      intermediateNodes.forEach((node, i) => {
        const modAlpha = alpha * Math.min(1, expandProgress * 3);
        if (modAlpha < 0.01) return;

        const breathe = Math.sin(time * 2 + i * 0.5) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.moveTo(cx, cy);

        // Bezier curve for organic feel
        const midX = (cx + node.x) / 2 + Math.sin(time + i) * 8;
        const midY = (cy + node.y) / 2 + Math.cos(time + i * 0.7) * 8;
        ctx.quadraticCurveTo(midX, midY, node.x, node.y);

        ctx.strokeStyle = `rgba(212,175,55,${0.12 * modAlpha * breathe})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node dot
        const nodeAlpha = modAlpha * breathe;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,230,${0.4 * nodeAlpha})`;
        ctx.fill();
      });

      // Draw connections from intermediate to modules
      modulePositions.forEach((pos, i) => {
        const modAlpha = alpha * Math.min(1, expandProgress * 2.5);
        if (modAlpha < 0.01) return;

        const breathe = Math.sin(time * 1.5 + i * 0.8) * 0.2 + 0.8;
        const isHighlighted = hoveredModule === MODULES[i].id;
        const lineAlpha = isHighlighted ? 0.5 : 0.2;

        // Main branch line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const cp1x = cx + (pos.x - cx) * 0.3 + Math.sin(time + i * 1.2) * 15;
        const cp1y = cy + (pos.y - cy) * 0.3 + Math.cos(time + i * 0.9) * 15;
        const cp2x = cx + (pos.x - cx) * 0.7 + Math.sin(time * 0.8 + i) * 10;
        const cp2y = cy + (pos.y - cy) * 0.7 + Math.cos(time * 0.8 + i * 1.1) * 10;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pos.x, pos.y);

        ctx.strokeStyle = `rgba(212,175,55,${lineAlpha * modAlpha * breathe})`;
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Module endpoint glow
        if (modAlpha > 0.3) {
          const glowSize = isHighlighted ? 12 : 6;
          const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowSize);
          gradient.addColorStop(0, `rgba(212,175,55,${0.6 * modAlpha * breathe})`);
          gradient.addColorStop(1, `rgba(212,175,55,0)`);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Solid dot
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, isHighlighted ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,248,230,${0.8 * modAlpha})`;
          ctx.fill();
        }
      });

      // Floating particles
      if (!prefersReduced) {
        for (let i = 0; i < 20; i++) {
          const angle = time * 0.3 + (i / 20) * Math.PI * 2;
          const dist = radius * 0.2 + Math.sin(time * 0.5 + i * 1.3) * radius * 0.15;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const pAlpha = alpha * (Math.sin(time * 2 + i * 0.7) * 0.3 + 0.3);

          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${pAlpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, expandProgress, hoveredModule, prefersReduced]);

  // Module positions for HTML overlay
  const radius = Math.min(dims.w, dims.h) * 0.35;
  const cx = dims.w / 2;
  const cy = dims.h / 2;

  const isMobile = dims.w < 640;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: BG }}
    >
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ width: dims.w, height: dims.h }}
      />

      {/* Ambient glow behind logo */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-1000"
        style={{
          left: cx - 120,
          top: cy - 120,
          width: 240,
          height: 240,
          background: `radial-gradient(circle, rgba(212,175,55,${0.08 + expandProgress * 0.12}) 0%, transparent 70%)`,
          filter: `blur(${40 + expandProgress * 20}px)`,
        }}
      />

      {/* Logo "S" — entrada real para o ERP */}
      <Link
        to="/dashboard"
        aria-label="Entrar no Syntera ERP"
        className="absolute z-10 cursor-pointer rounded-xl outline-none transition-transform duration-700 focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.75)]"
        style={{
          left: cx - 48,
          top: cy - 56,
          transform: `scale(${1 + expandProgress * 0.05})`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(!isHovered)}
      >
        <svg width="96" height="112" viewBox="0 0 96 112" fill="none">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D76E" />
              <stop offset="30%" stopColor="#D4AF37" />
              <stop offset="60%" stopColor="#C5A028" />
              <stop offset="100%" stopColor="#AA8B1E" />
            </linearGradient>
            <filter id="logoGlow">
              <feGaussianBlur stdDeviation={2 + expandProgress * 3} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#logoGlow)">
            <path
              d="M72 18C72 18 58 8 42 8C26 8 14 18 14 30C14 42 24 48 42 54C60 60 74 66 74 82C74 98 60 106 42 106C24 106 10 96 10 96"
              stroke="url(#goldGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Digital particles at top */}
            <rect x="68" y="6" width="5" height="5" rx="1" fill="url(#goldGrad)" opacity={0.9} />
            <rect x="76" y="2" width="4" height="4" rx="1" fill="url(#goldGrad)" opacity={0.7} />
            <rect x="80" y="9" width="3" height="3" rx="1" fill="url(#goldGrad)" opacity={0.5} />
            <rect x="74" y="13" width="3" height="3" rx="1" fill="url(#goldGrad)" opacity={0.6} />
          </g>
          {/* Reflection line */}
          <ellipse cx="48" cy="108" rx="30" ry="3" fill="url(#goldGrad)" opacity={0.15 + expandProgress * 0.1} />
        </svg>
      </Link>

      {/* "SYNTERA" text */}
      <div
        className="absolute text-center pointer-events-none transition-opacity duration-700"
        style={{
          left: cx - 80,
          top: cy + 64,
          width: 160,
          opacity: 0.4 + expandProgress * 0.3,
        }}
      >
        <span
          className="text-xs tracking-[0.4em] font-light"
          style={{ color: GOLD_LIGHT }}
        >
          SYNTERA
        </span>
      </div>

      {/* Module labels (HTML overlay) */}
      {!isMobile &&
        MODULES.map((mod, i) => {
          const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
          const jitter = Math.sin(i * 2.7) * 0.08;
          const mx = cx + Math.cos(angle + jitter) * radius;
          const my = cy + Math.sin(angle + jitter) * radius;
          const isHigh = hoveredModule === mod.id;

          return (
            <Link
              to={mod.url}
              key={mod.id}
              className="absolute z-10 cursor-pointer rounded-md px-2 py-1 outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.65)]"
              style={{
                left: mx - 60,
                top: my - 12,
                width: 120,
                opacity: expandProgress > 0.3 ? Math.min(1, (expandProgress - 0.3) * 3) : 0,
                transform: `scale(${expandProgress > 0.3 ? 1 : 0.8})`,
                pointerEvents: expandProgress > 0.5 ? "auto" : "none",
                textAlign: "center",
              }}
              onMouseEnter={() => setHoveredModule(mod.id)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              <span
                className="text-[11px] font-medium tracking-wide transition-all duration-300"
                style={{
                  color: isHigh ? GOLD : "rgba(200,195,180,0.6)",
                  textShadow: isHigh ? `0 0 12px ${GOLD_GLOW}` : "none",
                }}
              >
                {mod.label}
              </span>
            </Link>
          );
        })}

      <Link
        to="/dashboard"
        className="absolute left-1/2 top-[calc(50%+112px)] z-10 -translate-x-1/2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.08)] px-5 py-2 text-xs font-medium tracking-[0.16em] text-[rgba(255,248,230,0.82)] shadow-[0_0_24px_rgba(212,175,55,0.08)] transition hover:border-[rgba(212,175,55,0.7)] hover:bg-[rgba(212,175,55,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.65)]"
      >
        ENTRAR NO ERP
      </Link>

      {/* Mobile hint */}
      {isMobile && expandProgress < 0.1 && (
        <div
          className="absolute text-center"
          style={{
            left: cx - 80,
            top: cy + 90,
            width: 160,
            opacity: 0.3,
          }}
        >
          <span className="text-[10px] tracking-wider" style={{ color: "rgba(200,195,180,0.4)" }}>
            toque para explorar
          </span>
        </div>
      )}

      {/* Subtle corner branding */}
      <div className="absolute bottom-4 right-4 opacity-20">
        <span className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(200,195,180,0.3)" }}>
          ENTERPRISE AI PLATFORM
        </span>
      </div>
    </div>
  );
}
