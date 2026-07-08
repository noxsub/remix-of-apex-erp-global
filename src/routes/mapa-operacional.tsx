import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArrowUpFromLine, ArrowDownToLine } from "lucide-react";

export const Route = createFileRoute("/mapa-operacional")({
  head: () => ({ meta: [{ title: "Mapa Operacional — Syntera ERP" }] }),
  component: MapaOperacionalPage,
});

/* ═══════════════════════════════════════════════════════════════
   MAPA OPERACIONAL — fluxo de vendas/compras por estado
   Visualização geográfica: arcos partindo (vendas) ou chegando
   (compras) da sede da empresa, com destaque tributário por UF.
   ═══════════════════════════════════════════════════════════════ */

type Estado = { id: string; nome: string; cx: number; cy: number; pts: string };
type FluxoEstado = { id: string; nome: string; valor: number; icms?: number; ipi?: number; icmsCred?: number; pisCof?: number };

const ESTADOS: Estado[] = [
  { id: "RR", nome: "Roraima", cx: 156, cy: 55, pts: "115,18 196,15 220,64 183,81 115,74 93,47" },
  { id: "AP", nome: "Amapá", cx: 272, cy: 48, pts: "243,16 293,12 307,57 281,80 249,73 232,48" },
  { id: "AM", nome: "Amazonas", cx: 143, cy: 150, pts: "46,100 232,95 245,172 190,214 117,232 50,208 24,164" },
  { id: "PA", nome: "Pará", cx: 307, cy: 140, pts: "232,87 357,83 389,109 383,174 309,198 247,193 227,158 230,107" },
  { id: "AC", nome: "Acre", cx: 77, cy: 246, pts: "26,215 120,235 115,275 64,296 14,272 7,244" },
  { id: "RO", nome: "Rondônia", cx: 166, cy: 260, pts: "117,220 195,213 219,253 198,303 141,312 112,275" },
  { id: "TO", nome: "Tocantins", cx: 321, cy: 240, pts: "308,183 353,178 371,205 366,293 322,315 298,302 288,253 292,203" },
  { id: "MA", nome: "Maranhão", cx: 362, cy: 120, pts: "339,73 402,65 419,100 408,145 372,160 339,155 311,132 313,95" },
  { id: "PI", nome: "Piauí", cx: 403, cy: 146, pts: "392,99 421,92 439,122 431,170 404,185 378,175 368,149" },
  { id: "CE", nome: "Ceará", cx: 437, cy: 117, pts: "415,85 451,81 466,100 461,137 429,152 409,137 409,105" },
  { id: "RN", nome: "Rio G. do Norte", cx: 466, cy: 96, pts: "454,77 483,75 489,99 466,114 442,107 439,89" },
  { id: "PB", nome: "Paraíba", cx: 455, cy: 121, pts: "439,107 472,104 480,121 457,137 431,129" },
  { id: "PE", nome: "Pernambuco", cx: 431, cy: 147, pts: "397,140 469,134 481,150 461,165 395,163 379,150" },
  { id: "AL", nome: "Alagoas", cx: 461, cy: 169, pts: "449,160 477,155 484,170 461,180 441,173" },
  { id: "SE", nome: "Sergipe", cx: 448, cy: 179, pts: "434,165 455,161 463,178 443,189 422,179" },
  { id: "BA", nome: "Bahia", cx: 381, cy: 244, pts: "342,150 438,143 461,163 469,179 452,255 402,315 350,335 308,305 293,255 300,200" },
  { id: "MT", nome: "Mato Grosso", cx: 243, cy: 268, pts: "192,205 312,195 338,225 328,313 262,353 182,340 162,285 176,235" },
  { id: "GO", nome: "Goiás", cx: 307, cy: 330, pts: "268,292 350,280 370,302 352,369 298,390 260,369 250,322" },
  { id: "DF", nome: "Dist. Federal", cx: 328, cy: 338, pts: "317,326 335,320 340,338 319,346 309,336" },
  { id: "MS", nome: "Mato G. do Sul", cx: 226, cy: 386, pts: "189,335 275,327 292,367 275,452 225,469 183,449 167,397 172,360" },
  { id: "MG", nome: "Minas Gerais", cx: 379, cy: 377, pts: "350,335 440,324 468,345 463,417 402,447 340,447 300,419 300,375" },
  { id: "ES", nome: "Espírito Santo", cx: 463, cy: 376, pts: "453,347 478,345 486,367 475,407 452,417 445,379" },
  { id: "RJ", nome: "Rio de Janeiro", cx: 439, cy: 428, pts: "419,412 467,405 477,427 452,451 412,447" },
  { id: "SP", nome: "São Paulo", cx: 346, cy: 433, pts: "284,389 421,379 442,402 432,459 369,487 291,482 264,449 261,415" },
  { id: "PR", nome: "Paraná", cx: 321, cy: 493, pts: "244,462 397,449 419,469 402,517 317,532 244,522 226,492" },
  { id: "SC", nome: "Santa Catarina", cx: 319, cy: 547, pts: "249,524 391,513 397,537 356,567 273,572 244,552" },
  { id: "RS", nome: "Rio G. do Sul", cx: 280, cy: 581, pts: "197,540 362,527 382,552 357,597 271,617 195,602 169,577 174,552" },
];

const VENDAS: FluxoEstado[] = [
  { id: "SP", nome: "São Paulo", valor: 145000, icms: 12325, ipi: 8700 },
  { id: "RJ", nome: "Rio de Janeiro", valor: 87000, icms: 7395, ipi: 5220 },
  { id: "RS", nome: "Rio G. do Sul", valor: 63000, icms: 5355, ipi: 3780 },
  { id: "PB", nome: "Paraíba", valor: 38000, icms: 3230, ipi: 2280 },
  { id: "RO", nome: "Rondônia", valor: 29000, icms: 2465, ipi: 1740 },
  { id: "CE", nome: "Ceará", valor: 45000, icms: 3825, ipi: 2700 },
  { id: "BA", nome: "Bahia", valor: 72000, icms: 6120, ipi: 4320 },
  { id: "GO", nome: "Goiás", valor: 34000, icms: 2890, ipi: 2040 },
];

const COMPRAS: FluxoEstado[] = [
  { id: "SP", nome: "São Paulo", valor: 230000, icmsCred: 19550, pisCof: 13800 },
  { id: "RS", nome: "Rio G. do Sul", valor: 89000, icmsCred: 7565, pisCof: 5340 },
  { id: "SC", nome: "Santa Catarina", valor: 67000, icmsCred: 5695, pisCof: 4020 },
  { id: "GO", nome: "Goiás", valor: 45000, icmsCred: 3825, pisCof: 2700 },
  { id: "PA", nome: "Pará", valor: 38000, icmsCred: 3230, pisCof: 2280 },
  { id: "BA", nome: "Bahia", valor: 52000, icmsCred: 4420, pisCof: 3120 },
];

const HOME = "MG";
const BIG = new Set(["AM", "MT", "PA", "MG", "BA", "MS", "SP", "GO", "TO", "MA", "PI"]);

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });

function getArcPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const curv = Math.min(len * 0.32, 68);
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${x1},${y1} Q ${mx + nx * curv},${my + ny * curv} ${x2},${y2}`;
}

function MapaOperacionalPage() {
  const [modo, setModo] = useState<"vendas" | "compras">("vendas");
  const [hoveredArc, setHoveredArc] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; dado: FluxoEstado } | null>(null);

  const isV = modo === "vendas";
  const arcos = isV ? VENDAS : COMPRAS;
  const arcColor = isV ? "#C9A84C" : "#4A90E2";
  const home = ESTADOS.find((e) => e.id === HOME)!;
  const activeSet = useMemo(() => new Set(arcos.map((a) => a.id)), [arcos]);

  const statCards = arcos.slice(0, 6).map((a) => ({
    nome: a.nome,
    valor: fmt.format(a.valor),
    impostos: isV ? fmt.format((a.icms ?? 0) + (a.ipi ?? 0)) : fmt.format((a.icmsCred ?? 0) + (a.pisCof ?? 0)),
  }));

  const handleEnter = (arc: FluxoEstado, e: React.MouseEvent<SVGPathElement>) => {
    const container = (e.currentTarget as SVGElement).closest("[data-map-container]") as HTMLElement | null;
    if (!container) return;
    const r = container.getBoundingClientRect();
    setHoveredArc(arc.id);
    setTooltip({ x: e.clientX - r.left, y: e.clientY - r.top, dado: arc });
  };

  return (
    <AppShell title="Mapa Operacional" subtitle="Fluxo de vendas e compras por estado — Brasil.">
      <div className="flex overflow-hidden rounded-xl border border-border" style={{ height: "calc(100vh - 220px)", minHeight: 520, background: "#07070a", color: "#e2e2e2" }}>
        {/* PAINEL ESQUERDO */}
        <div className="flex w-64 min-w-[256px] flex-col gap-0 overflow-y-auto p-4" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          {/* Toggle */}
          <div className="mb-3.5 flex gap-1 rounded-[9px] p-[3px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={() => { setModo("vendas"); setHoveredArc(null); setTooltip(null); }}
              className="flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-all"
              style={{ background: isV ? "#C9A84C" : "transparent", color: isV ? "#07070a" : "rgba(255,255,255,0.38)" }}
            >
              <ArrowUpFromLine className="mr-1 inline h-3 w-3" /> Vendas
            </button>
            <button
              onClick={() => { setModo("compras"); setHoveredArc(null); setTooltip(null); }}
              className="flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-all"
              style={{ background: !isV ? "#4A90E2" : "transparent", color: !isV ? "#07070a" : "rgba(255,255,255,0.38)" }}
            >
              <ArrowDownToLine className="mr-1 inline h-3 w-3" /> Compras
            </button>
          </div>

          {/* Sede */}
          <div className="mb-3.5 rounded-[9px] px-3.5 py-2.5" style={{ border: "1px solid rgba(201,168,76,0.28)", background: "rgba(201,168,76,0.05)" }}>
            <div className="mb-1 text-[8px] uppercase tracking-[0.22em]" style={{ color: "rgba(201,168,76,0.6)" }}>Estado sede</div>
            <div className="text-sm font-bold" style={{ color: "#C9A84C" }}>Minas Gerais — MG</div>
            <div className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.32)" }}>Belo Horizonte</div>
          </div>

          <div className="mb-1.5 text-[8px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.28)" }}>
            {isV ? "Top vendas por estado" : "Top compras por estado"}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            {statCards.map((c) => (
              <div key={c.nome} className="flex items-center justify-between rounded-[7px] px-2.5 py-2" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
                <div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>{c.nome}</div>
                  <div className="mt-0.5 text-xs font-semibold">{c.valor}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>impostos</div>
                  <div className="font-mono text-[10px] font-medium" style={{ color: arcColor }}>{c.impostos}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-3.5 flex-shrink-0 pt-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
            <div className="mb-2 text-[8px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.28)" }}>Legenda</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <svg width="26" height="8" viewBox="0 0 26 8"><line x1="0" y1="4" x2="26" y2="4" stroke={arcColor} strokeWidth="2" strokeDasharray="4 5" /></svg>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{isV ? "Fluxo de venda (NF-e saída)" : "Fluxo de compra (NF-e entrada)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: "rgba(201,168,76,0.18)", border: "2px solid #C9A84C" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Sede da empresa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-3 rounded-sm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Estados envolvidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAPA */}
        <div className="relative flex flex-1 items-center justify-center" data-map-container>
          <div className="pointer-events-none absolute right-4 top-4 text-right">
            <div className="text-[8px] uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.2)" }}>Modo ativo</div>
            <div className="mt-0.5 text-[11px] font-semibold" style={{ color: arcColor }}>
              {isV ? "↑ Saídas — Vendas" : "↓ Entradas — Compras"}
            </div>
          </div>

          <svg viewBox="0 0 520 640" style={{ height: "100%", width: "auto", maxWidth: "100%" }}>
            {ESTADOS.map((e) => {
              const isHome = e.id === HOME;
              const isActive = activeSet.has(e.id);
              return (
                <g key={e.id}>
                  <polygon
                    points={e.pts}
                    fill={isHome ? "rgba(201,168,76,0.14)" : isActive ? "rgba(255,255,255,0.055)" : "#0f0f14"}
                    stroke={isHome ? "#C9A84C" : isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.055)"}
                    strokeWidth={isHome ? 1.5 : 0.7}
                    style={{ filter: isHome ? "drop-shadow(0 0 14px rgba(201,168,76,0.32))" : "none" }}
                  />
                  <text
                    x={e.cx}
                    y={e.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHome ? "#C9A84C" : isActive ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.16)"}
                    fontSize={BIG.has(e.id) ? 8 : 6.5}
                    fontWeight={600}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {e.id}
                  </text>
                </g>
              );
            })}

            <circle
              cx={home.cx}
              cy={home.cy}
              r={5}
              fill="#C9A84C"
              style={{ filter: "drop-shadow(0 0 16px #C9A84C) drop-shadow(0 0 6px #C9A84C)" }}
            >
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>

            {arcos.map((arc) => {
              const alvo = ESTADOS.find((e) => e.id === arc.id);
              if (!alvo) return null;
              const from = isV ? home : alvo;
              const to = isV ? alvo : home;
              const d = getArcPath(from.cx, from.cy, to.cx, to.cy);
              const isHov = hoveredArc === arc.id;
              return (
                <g key={arc.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={arcColor}
                    strokeWidth={isHov ? 2.5 : 1.5}
                    opacity={isHov ? 1 : 0.58}
                    strokeDasharray="5 8"
                    style={{ pointerEvents: "none", transition: "opacity 0.18s, stroke-width 0.15s" }}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    style={{ cursor: "crosshair" }}
                    onMouseEnter={(e) => handleEnter(arc, e)}
                    onMouseLeave={() => { setHoveredArc(null); setTooltip(null); }}
                  />
                </g>
              );
            })}
          </svg>

          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-[9px] px-3.5 py-2.5"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%,-115%)",
                background: "rgba(7,7,12,0.97)",
                border: `1px solid ${arcColor}45`,
                minWidth: 185,
                backdropFilter: "blur(18px)",
                boxShadow: `0 10px 40px rgba(0,0,0,0.7), 0 0 20px ${arcColor}18`,
              }}
            >
              <div className="mb-1 text-[8px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {isV ? `Venda → ${tooltip.dado.nome}` : `Compra ← ${tooltip.dado.nome}`}
              </div>
              <div className="mb-2 text-[15px] font-bold">{fmt.format(tooltip.dado.valor)}</div>
              <div className="flex flex-col gap-1 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex justify-between gap-3.5">
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>{isV ? "ICMS devido" : "Crédito ICMS"}</span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: isV ? "#FF9966" : "#60C8FF" }}>
                    {fmt.format(isV ? tooltip.dado.icms ?? 0 : tooltip.dado.icmsCred ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between gap-3.5">
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>{isV ? "IPI" : "Créd. PIS/COFINS"}</span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: isV ? "#FF9966" : "#60C8FF" }}>
                    {fmt.format(isV ? tooltip.dado.ipi ?? 0 : tooltip.dado.pisCof ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
