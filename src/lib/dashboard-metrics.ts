import { useEffect, useState } from "react";
import type { Cliente, PedidoFaturado, Orcamento } from "./erp-store";

// ─── Modo de negócio (Revenda / Serviço) ────────────────────────────────────

export type ModoNegocio = "revenda" | "servico";

export function useModoNegocio(): ModoNegocio {
  const read = (): ModoNegocio => {
    if (typeof window === "undefined") return "revenda";
    const v = window.localStorage.getItem("erp:estoqueAtivo");
    return v === "false" ? "servico" : "revenda";
  };
  const [modo, setModo] = useState<ModoNegocio>(read);
  useEffect(() => {
    const on = () => setModo(read());
    window.addEventListener("erp:estoque-toggle", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("erp:estoque-toggle", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return modo;
}

// ─── Estoque (demo + reais, futuramente plugáveis) ──────────────────────────

export type EstoqueItem = {
  sku: string;
  nome: string;
  categoria: string;
  estoque: number;
  estoqueMin: number;
  custo: number;
  preco: number;
  giro: number; // vezes por ano
  diasParado: number;
};

export const estoqueDemo: EstoqueItem[] = [
  { sku: "SKU-10042", nome: 'Notebook Pro 14" M3', categoria: "Eletrônicos", estoque: 184, estoqueMin: 30, custo: 4820, preco: 7299, giro: 6.4, diasParado: 12 },
  { sku: "SKU-10043", nome: 'Monitor UltraWide 34"', categoria: "Eletrônicos", estoque: 42, estoqueMin: 20, custo: 2180, preco: 3499, giro: 4.1, diasParado: 22 },
  { sku: "SKU-10044", nome: "Teclado Mecânico RGB", categoria: "Acessórios", estoque: 8, estoqueMin: 25, custo: 320, preco: 599, giro: 8.2, diasParado: 5 },
  { sku: "SKU-10045", nome: "Mouse Ergonômico", categoria: "Acessórios", estoque: 312, estoqueMin: 50, custo: 140, preco: 289, giro: 10.5, diasParado: 3 },
  { sku: "SKU-10046", nome: "Headset Wireless ANC", categoria: "Áudio", estoque: 64, estoqueMin: 20, custo: 680, preco: 1199, giro: 5.2, diasParado: 14 },
  { sku: "SKU-10047", nome: "Webcam 4K", categoria: "Periféricos", estoque: 3, estoqueMin: 15, custo: 420, preco: 849, giro: 3.1, diasParado: 95 },
  { sku: "SKU-10048", nome: "Dock USB-C", categoria: "Acessórios", estoque: 0, estoqueMin: 10, custo: 380, preco: 729, giro: 7.0, diasParado: 130 },
];

export const giroHistorico = [
  { mes: "Jan", giro: 3.8 },
  { mes: "Fev", giro: 4.1 },
  { mes: "Mar", giro: 4.6 },
  { mes: "Abr", giro: 5.0 },
  { mes: "Mai", giro: 5.4 },
  { mes: "Jun", giro: 5.8 },
  { mes: "Jul", giro: 6.2 },
  { mes: "Ago", giro: 6.6 },
];

export function curvaABC(itens: EstoqueItem[]) {
  const ordenado = [...itens].sort((a, b) => b.estoque * b.preco - a.estoque * a.preco);
  const totalValor = ordenado.reduce((s, p) => s + p.estoque * p.preco, 0) || 1;
  let acc = 0;
  return ordenado.map((p) => {
    const valor = p.estoque * p.preco;
    acc += valor;
    const percAcum = (acc / totalValor) * 100;
    const classe = percAcum <= 80 ? "A" : percAcum <= 95 ? "B" : "C";
    return { nome: p.nome, valor, percAcum: Number(percAcum.toFixed(1)), classe };
  });
}

export function valorPorCategoria(itens: EstoqueItem[]) {
  const m = new Map<string, number>();
  itens.forEach((i) => m.set(i.categoria, (m.get(i.categoria) ?? 0) + i.estoque * i.custo));
  return Array.from(m, ([categoria, valor]) => ({ categoria, valor }));
}

// ─── Vendas / Faturamento ───────────────────────────────────────────────────

export function evolucaoVendas(faturados: PedidoFaturado[]) {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
  const base = [184, 212, 248, 261, 295, 332, 358, 391];
  const totalReal = faturados.reduce((s, f) => s + f.total, 0);
  return meses.map((mes, i) => ({
    mes,
    receita: base[i] * 1000 + (i === meses.length - 1 ? totalReal : 0),
    ticketMedio: Math.round(base[i] * 1000 / (base[i] / 6)),
  }));
}

export function topProdutos(faturados: PedidoFaturado[]) {
  // Como o pedido não traz SKUs (apenas contagem), gera ranking sintético
  // ponderado pelo nº de faturamentos do mês — substituível quando o pedido
  // persistir o detalhamento por item.
  const boost = Math.min(faturados.length, 12);
  return [
    { nome: 'Notebook Pro 14" M3', valor: 184_000 + boost * 5000, qtd: 64 + boost * 2 },
    { nome: "Mouse Ergonômico", valor: 92_000 + boost * 1800, qtd: 312 + boost * 6 },
    { nome: "Headset Wireless ANC", valor: 68_000 + boost * 1200, qtd: 58 + boost },
    { nome: 'Monitor UltraWide 34"', valor: 58_000, qtd: 18 },
    { nome: "Teclado Mecânico RGB", valor: 38_000, qtd: 64 },
  ];
}

export const desempenhoCanais = [
  { canal: "E-commerce", valor: 184_000 },
  { canal: "Loja física", valor: 142_000 },
  { canal: "WhatsApp", valor: 78_000 },
  { canal: "Marketplace", valor: 64_000 },
];

export const servicosMaisPrestados = [
  { nome: "Consultoria", valor: 142_000 },
  { nome: "Manutenção", valor: 88_000 },
  { nome: "Treinamento", valor: 56_000 },
  { nome: "Suporte", valor: 34_000 },
];

export function funilOrcamentos(orcamentos: Orcamento[], faturados: PedidoFaturado[]) {
  const total = Math.max(orcamentos.length + faturados.length + 18, 24);
  const emNegociacao = Math.round(total * 0.62);
  const aprovados = Math.round(total * 0.38);
  const faturadosCount = Math.max(faturados.length, Math.round(total * 0.24));
  return [
    { etapa: "Orçamentos", valor: total, fill: "oklch(0.78 0.09 85)" },
    { etapa: "Em negociação", valor: emNegociacao, fill: "oklch(0.72 0.10 85)" },
    { etapa: "Aprovados", valor: aprovados, fill: "oklch(0.66 0.11 85)" },
    { etapa: "Faturados", valor: faturadosCount, fill: "oklch(0.58 0.12 85)" },
  ];
}

// ─── Cadastros ──────────────────────────────────────────────────────────────

export function ativosVsInativos(clientes: Cliente[], faturados: PedidoFaturado[]) {
  // "Ativo" = cliente que aparece em algum pedido faturado recente
  const ativosNomes = new Set(faturados.map((f) => f.clienteNome));
  const ativos = clientes.filter((c) => ativosNomes.has(c.nome) || c.status === "Ativo").length;
  const inativos = Math.max(clientes.length - ativos, 0);
  return [
    { tipo: "Ativos", valor: ativos, fill: "oklch(0.65 0.18 145)" },
    { tipo: "Inativos", valor: inativos, fill: "var(--muted-foreground)" },
  ];
}

export function distribuicaoUF(clientes: Cliente[]) {
  // Extrai UF do final do telefone DDD heurístico — sem dado real, retorna demo
  const demo = [
    { uf: "SP", total: Math.max(clientes.filter((c) => c.telefone.startsWith("(11)")).length, 12) },
    { uf: "RJ", total: Math.max(clientes.filter((c) => c.telefone.startsWith("(21)")).length, 6) },
    { uf: "MG", total: Math.max(clientes.filter((c) => c.telefone.startsWith("(31)")).length, 4) },
    { uf: "RS", total: 3 },
    { uf: "PR", total: 2 },
  ];
  return demo;
}

export const novosClientesMes = [
  { mes: "Jan", novos: 8 },
  { mes: "Fev", novos: 12 },
  { mes: "Mar", novos: 15 },
  { mes: "Abr", novos: 18 },
  { mes: "Mai", novos: 22 },
  { mes: "Jun", novos: 19 },
  { mes: "Jul", novos: 26 },
  { mes: "Ago", novos: 31 },
];

export const churnHistorico = [
  { mes: "Jan", churn: 3.2 },
  { mes: "Fev", churn: 2.8 },
  { mes: "Mar", churn: 3.5 },
  { mes: "Abr", churn: 2.4 },
  { mes: "Mai", churn: 2.1 },
  { mes: "Jun", churn: 1.8 },
  { mes: "Jul", churn: 2.2 },
  { mes: "Ago", churn: 1.6 },
];