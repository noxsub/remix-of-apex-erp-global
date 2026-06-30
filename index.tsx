import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")(
  {
    head: () => ({ meta: [{ title: "Syntera ERP" }] }),
    component: SynteraLanding,
  },
);

/* ═══════════════════════════════════════════════════════════════
   CORES
   ═══════════════════════════════════════════════════════════════ */
const GOLD = "#D4AF37";
const BG   = "#0a0e17";

/* ═══════════════════════════════════════════════════════════════
   NÓS DA REDE — posições no viewBox 1200×700
   ═══════════════════════════════════════════════════════════════ */
type Node = {
  id: string;
  label: string[];          // linhas de texto
  x: number;
  y: number;
  url: string;
  anchor: "left" | "right" | "top" | "bottom";
};

const NODES: Node[] = [
  { id: "financeiro",   label: ["FINANCEIRO"],            x: 600, y: 100, url: "/financeiro",          anchor: "top"    },
  { id: "fiscal",       label: ["FISCAL"],                x: 760, y: 130, url: "/fiscal",              anchor: "right"  },
  { id: "floki",        label: ["FLOKI IA"],              x: 420, y: 140, url: "/dashboard",           anchor: "left"   },
  { id: "bi",           label: ["BI /", "RELATÓRIOS"],    x: 380, y: 210, url: "/saidas/relatorios",   anchor: "left"   },
  { id: "compras",      label: ["COMPRAS"],               x: 790, y: 200, url: "/entradas",            anchor: "right"  },
  { id: "integracoes",  label: ["INTEGRAÇÕES"],           x: 350, y: 340, url: "/omnilink",            anchor: "left"   },
  { id: "vendas",       label: ["VENDAS"],                x: 850, y: 340, url: "/saidas",              anchor: "right"  },
  { id: "reforma",      label: ["REFORMA", "TRIBUTÁRIA"], x: 370, y: 430, url: "/reforma-tributaria",  anchor: "left"   },
  { id: "estoque",      label: ["ESTOQUE"],               x: 830, y: 415, url: "/estoque",             anchor: "right"  },
  { id: "obrigacoes",   label: ["OBRIGAÇÕES"],            x: 450, y: 510, url: "/obrigacoes",          anchor: "bottom" },
  { id: "cadastros",    label: ["CADASTROS"],             x: 600, y: 550, url: "/cadastros",           anchor: "bottom" },
  { id: "rh",           label: ["RH"],                    x: 720, y: 530, url: "/rh",                  anchor: "right"  },
];

/* ═══════════════════════════════════════════════════════════════
   ARESTAS — caminhos ortogonais (H/V) entre nós
   Cada aresta é uma sequência de [x,y] formando linhas retas.
   ═══════════════════════════════════════════════════════════════ */
const n = Object.fromEntries(NODES.map((nd) => [nd.id, nd]));

function edge(points: number[][]): number[][] { return points; }

const EDGES = [
  // ── Topo ──
  edge([[n.floki.x, n.floki.y], [530, n.floki.y], [600, n.floki.y], [600, n.financeiro.y]]),                       // FLOKI → spine → FINANCEIRO
  edge([[n.financeiro.x, n.financeiro.y], [n.financeiro.x, n.fiscal.y], [n.fiscal.x, n.fiscal.y]]),                 // FINANCEIRO → right → FISCAL

  // ── Coluna esquerda ──
  edge([[n.floki.x, n.floki.y], [n.bi.x, n.floki.y], [n.bi.x, n.bi.y]]),                                          // FLOKI → down → BI
  edge([[n.bi.x, n.bi.y], [n.bi.x, n.integracoes.y], [n.integracoes.x, n.integracoes.y]]),                         // BI → down → INTEGRAÇÕES
  edge([[n.integracoes.x, n.integracoes.y], [n.integracoes.x, n.reforma.y], [n.reforma.x, n.reforma.y]]),           // INTEGRAÇÕES → down → REFORMA
  edge([[n.reforma.x, n.reforma.y], [n.reforma.x, n.obrigacoes.y], [n.obrigacoes.x, n.obrigacoes.y]]),              // REFORMA → down → OBRIGAÇÕES

  // ── Coluna direita ──
  edge([[n.fiscal.x, n.fiscal.y], [n.compras.x, n.fiscal.y], [n.compras.x, n.compras.y]]),                         // FISCAL → down → COMPRAS
  edge([[n.compras.x, n.compras.y], [n.compras.x, n.vendas.y], [n.vendas.x, n.vendas.y]]),                         // COMPRAS → down → VENDAS
  edge([[n.vendas.x, n.vendas.y], [n.vendas.x, n.estoque.y], [n.estoque.x, n.estoque.y]]),                         // VENDAS → down → ESTOQUE
  edge([[n.estoque.x, n.estoque.y], [n.estoque.x, n.rh.y], [n.rh.x, n.rh.y]]),                                     // ESTOQUE → down → RH

  // ── Base ──
  edge([[n.obrigacoes.x, n.obrigacoes.y], [n.obrigacoes.x, n.cadastros.y], [n.cadastros.x, n.cadastros.y]]),        // OBRIGAÇÕES → CADASTROS
  edge([[n.cadastros.x, n.cadastros.y], [n.rh.x, n.cadastros.y], [n.rh.x, n.rh.y]]),                                // CADASTROS → RH

  // ── Espinha central (vertical) ──
  edge([[600, n.financeiro.y], [600, 310]]),                                                                         // FINANCEIRO → LOGO
  edge([[600, 390], [600, n.cadastros.y]]),                                                                          // LOGO → CADASTROS

  // ── Pontes horizontais (cruzam pelo centro) ──
  edge([[n.bi.x, n.bi.y], [600, n.bi.y], [n.compras.x, n.compras.y]]),                                             // BI ↔ COMPRAS (passando pelo spine)
  edge([[n.integracoes.x, n.integracoes.y], [600, n.integracoes.y], [600, n.vendas.y], [n.vendas.x, n.vendas.y]]),  // INTEGRAÇÕES ↔ VENDAS
];

/* ═══════════════════════════════════════════════════════════════
   JUNCTION DOTS — pontos intermediários menores nas arestas
   ═══════════════════════════════════════════════════════════════ */
function getJunctions(): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (const path of EDGES) {
    for (let i = 1; i < path.length - 1; i++) {
      pts.push({ x: path[i][0], y: path[i][1] });
    }
  }
  // deduplicate
  const seen = new Set<string>();
  return pts.filter((p) => {
    const k = `${p.x},${p.y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
function SynteraLanding() {
  const [hovered, setHovered] = useState<string | null>(null);
  const junctions = getJunctions();

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: BG }}>
      {/* ── Header ── */}
      <div
        className="absolute top-5 left-6 text-[11px] tracking-[0.3em] font-light"
        style={{ color: "rgba(212,175,55,0.35)" }}
      >
        SYNTERA ERP
      </div>
      <div
        className="absolute top-5 right-6 text-[11px] tracking-[0.3em] font-light"
        style={{ color: "rgba(212,175,55,0.35)" }}
      >
        ENTERPRISE PLATFORM
      </div>

      {/* ── SVG: rede, nós, logo ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow pequeno para pontos de nó */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow grande para o logo */}
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradiente dourado */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D76E" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#C5A028" />
            <stop offset="100%" stopColor="#AA8B1E" />
          </linearGradient>
          {/* Halo radial */}
          <radialGradient id="halo">
            <stop offset="0%" stopColor="rgba(212,175,55,0.18)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </radialGradient>
        </defs>

        {/* ── Ambient glow atrás do logo ── */}
        <circle cx="600" cy="350" r="120" fill="url(#halo)" />

        {/* ── Arestas (linhas ortogonais) ── */}
        {EDGES.map((path, i) => {
          const d = path.map((p, j) => `${j === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
          return (
            <path
              key={`e${i}`}
              d={d}
              fill="none"
              stroke={GOLD}
              strokeWidth="1"
              opacity="0.22"
            />
          );
        })}

        {/* ── Junction dots (nós intermediários) ── */}
        {junctions.map((j, i) => (
          <g key={`j${i}`}>
            <circle cx={j.x} cy={j.y} r="6" fill="rgba(212,175,55,0.12)" />
            <circle cx={j.x} cy={j.y} r="2" fill="rgba(255,248,230,0.5)" />
          </g>
        ))}

        {/* ── Module nodes (nós com label) ── */}
        {NODES.map((nd) => {
          const isHigh = hovered === nd.id;
          const dotR = isHigh ? 5 : 3.5;
          const glowR = isHigh ? 16 : 10;
          return (
            <g key={nd.id}>
              {/* Halo glow */}
              <circle
                cx={nd.x}
                cy={nd.y}
                r={glowR}
                fill="none"
                stroke={GOLD}
                strokeWidth={isHigh ? 1.5 : 0.8}
                opacity={isHigh ? 0.6 : 0.25}
                className="transition-all duration-300"
              />
              <circle
                cx={nd.x}
                cy={nd.y}
                r={glowR * 1.8}
                fill="rgba(212,175,55,0.06)"
                className={isHigh ? "" : "opacity-0"}
                style={{ transition: "opacity 0.3s" }}
              />
              {/* Dot sólido */}
              <circle
                cx={nd.x}
                cy={nd.y}
                r={dotR}
                fill={GOLD}
                filter="url(#glow)"
                className="transition-all duration-300"
              >
                <animate attributeName="r" values={`${dotR};${dotR + 1};${dotR}`} dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* ── Logo SVG "S" central ── */}
        <g transform="translate(552, 290)" filter="url(#logoGlow)">
          <path
            d="M72 18C72 18 58 8 42 8C26 8 14 18 14 30C14 42 24 48 42 54C60 60 74 66 74 82C74 98 60 106 42 106C24 106 10 96 10 96"
            stroke="url(#goldGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Partículas digitais no topo do S */}
          <rect x="68" y="6"  width="5" height="5" rx="1" fill="url(#goldGrad)" opacity="0.9" />
          <rect x="76" y="2"  width="4" height="4" rx="1" fill="url(#goldGrad)" opacity="0.7" />
          <rect x="80" y="9"  width="3" height="3" rx="1" fill="url(#goldGrad)" opacity="0.5" />
          <rect x="74" y="13" width="3" height="3" rx="1" fill="url(#goldGrad)" opacity="0.6" />
          {/* Reflexo */}
          <ellipse cx="48" cy="108" rx="30" ry="3" fill="url(#goldGrad)" opacity="0.12" />
        </g>

        {/* ── "SYNTERA" + "clique para entrar" ── */}
        <text
          x="600"
          y="420"
          textAnchor="middle"
          fill="rgba(212,175,55,0.45)"
          fontSize="13"
          letterSpacing="6"
          fontWeight="300"
          fontFamily="inherit"
        >
          SYNTERA
        </text>
        <text
          x="600"
          y="440"
          textAnchor="middle"
          fill="rgba(200,195,180,0.25)"
          fontSize="10"
          letterSpacing="2"
          fontWeight="300"
          fontFamily="inherit"
        >
          clique para entrar
        </text>

        {/* ── Labels dos módulos (SVG text) ── */}
        {NODES.map((nd) => {
          const isHigh = hovered === nd.id;
          const offsets: Record<string, { dx: number; dy: number; ta: string }> = {
            left:   { dx: -18, dy: 0,   ta: "end"    },
            right:  { dx: 18,  dy: 0,   ta: "start"  },
            top:    { dx: 0,   dy: -18, ta: "middle"  },
            bottom: { dx: 0,   dy: 22,  ta: "middle"  },
          };
          const off = offsets[nd.anchor];
          const tx = nd.x + off.dx;
          const baseY = nd.y + off.dy;
          return (
            <g key={`lbl-${nd.id}`}>
              {nd.label.map((line, li) => (
                <text
                  key={li}
                  x={tx}
                  y={baseY + li * 15}
                  textAnchor={off.ta as "start" | "middle" | "end"}
                  dominantBaseline={nd.anchor === "bottom" ? "hanging" : nd.anchor === "top" ? "auto" : "central"}
                  fill={isHigh ? GOLD : "rgba(200,195,180,0.5)"}
                  fontSize="12"
                  fontWeight="500"
                  letterSpacing="1.5"
                  fontFamily="inherit"
                  className="transition-all duration-300 pointer-events-none"
                  style={{ textShadow: isHigh ? `0 0 10px rgba(212,175,55,0.3)` : "none" }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* ── Hit areas invisíveis para hover/click nos módulos ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid meet"
      >
        {NODES.map((nd) => (
          <Link key={`hit-${nd.id}`} to={nd.url}>
            <rect
              x={nd.x - 60}
              y={nd.y - 20}
              width="120"
              height="40"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHovered(nd.id)}
              onMouseLeave={() => setHovered(null)}
            />
          </Link>
        ))}
        {/* Hit area para o logo central → Dashboard */}
        <Link to="/dashboard">
          <rect x="540" y="280" width="120" height="140" fill="transparent" className="cursor-pointer" />
        </Link>
      </svg>

      {/* ── Bottom branding ── */}
      <div
        className="absolute bottom-4 right-6 text-[10px] tracking-[0.2em]"
        style={{ color: "rgba(200,195,180,0.15)" }}
      >
        ENTERPRISE AI PLATFORM
      </div>
    </div>
  );
}
