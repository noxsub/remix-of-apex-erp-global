// Formatadores numéricos do Syntera — respeitam casas decimais e usam K/M/B só quando faz sentido.

export function formatBRL(n: number, opts: { decimals?: number } = {}) {
  const decimals = opts.decimals ?? 2;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Compacto BR: 1.234 → R$ 1.234,00 · 12.500 → R$ 12,5 mil · 1.250.000 → R$ 1,25 mi · 2.300.000.000 → R$ 2,30 bi */
export function formatBRLCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bi`;
  if (abs >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`;
  if (abs >= 10_000) return `R$ ${(n / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
  return formatBRL(n, { decimals: 2 });
}

/** Compacto para eixos de gráfico (sem prefixo R$): 1500 → 1,5k · 1_200_000 → 1,20M */
export function formatAxisCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
