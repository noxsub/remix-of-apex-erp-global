import type { CanalVenda, PedidoMarketplace } from "@/lib/omnilink-store";

export type FlokiAlert = {
  id: string;
  severidade: "info" | "atencao" | "critico";
  titulo: string;
  detalhe: string;
  canalId?: string;
  itemSku?: string;
};

export type RentabilidadeCanal = {
  canalId: string;
  canalNome: string;
  pedidos: number;
  bruto: number;
  liquido: number;
  margemPct: number;
};

export function margemDoPedido(p: PedidoMarketplace) {
  const margem = p.valorBruto - p.taxaComissao - p.taxaFrete - p.taxaPagamento - p.imposto - p.cmv;
  const pct = p.valorBruto > 0 ? (margem / p.valorBruto) * 100 : 0;
  return { margem, pct };
}

export function rentabilidadePorCanal(pedidos: PedidoMarketplace[], canais: CanalVenda[]): RentabilidadeCanal[] {
  const map = new Map<string, RentabilidadeCanal>();
  for (const c of canais) {
    map.set(c.id, { canalId: c.id, canalNome: c.nome, pedidos: 0, bruto: 0, liquido: 0, margemPct: 0 });
  }
  for (const p of pedidos) {
    const r = map.get(p.canalId);
    if (!r) continue;
    const { margem } = margemDoPedido(p);
    r.pedidos += 1;
    r.bruto += p.valorBruto;
    r.liquido += margem;
  }
  for (const r of map.values()) {
    r.margemPct = r.bruto > 0 ? (r.liquido / r.bruto) * 100 : 0;
  }
  return Array.from(map.values()).sort((a, b) => b.margemPct - a.margemPct);
}

export function gerarAlertas(pedidos: PedidoMarketplace[], canais: CanalVenda[]): FlokiAlert[] {
  const alerts: FlokiAlert[] = [];
  const porCanalSku = new Map<string, { canalId: string; sku: string; nome: string; margens: number[] }>();

  for (const p of pedidos) {
    for (const it of p.itens) {
      const k = `${p.canalId}::${it.sku}`;
      const cur = porCanalSku.get(k) ?? { canalId: p.canalId, sku: it.sku, nome: it.nome, margens: [] };
      const { pct } = margemDoPedido(p);
      cur.margens.push(pct);
      porCanalSku.set(k, cur);
    }
  }

  for (const v of porCanalSku.values()) {
    const media = v.margens.reduce((s, x) => s + x, 0) / Math.max(v.margens.length, 1);
    const canal = canais.find((c) => c.id === v.canalId);
    if (media < 0) {
      alerts.push({
        id: `neg-${v.canalId}-${v.sku}`,
        severidade: "critico",
        titulo: `Margem negativa: ${v.nome}`,
        detalhe: `Floki identificou que ${v.nome} está com margem média de ${media.toFixed(1)}% em ${canal?.nome ?? v.canalId}. Revise preço, frete ou taxas.`,
        canalId: v.canalId,
        itemSku: v.sku,
      });
    } else if (media < 5) {
      alerts.push({
        id: `low-${v.canalId}-${v.sku}`,
        severidade: "atencao",
        titulo: `Margem apertada: ${v.nome}`,
        detalhe: `Margem média de apenas ${media.toFixed(1)}% em ${canal?.nome ?? v.canalId}.`,
        canalId: v.canalId,
        itemSku: v.sku,
      });
    }
  }

  const rent = rentabilidadePorCanal(pedidos, canais).filter((r) => r.pedidos > 0);
  if (rent.length >= 2) {
    const melhor = rent[0];
    const pior = rent[rent.length - 1];
    if (melhor.margemPct - pior.margemPct > 5) {
      alerts.push({
        id: `cmp-${melhor.canalId}-${pior.canalId}`,
        severidade: "info",
        titulo: `${melhor.canalNome} é seu canal mais lucrativo`,
        detalhe: `Margem de ${melhor.margemPct.toFixed(1)}% vs ${pior.margemPct.toFixed(1)}% em ${pior.canalNome}. Considere realocar investimento de mídia.`,
      });
    }
  }

  return alerts.slice(0, 8);
}
