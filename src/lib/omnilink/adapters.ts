import type { AnuncioMarketplace, CanalTipo, CanalVenda, PedidoMarketplace } from "@/lib/omnilink-store";
import type { ItemFiscal } from "@/lib/fiscal-store";

export interface MarketplaceAdapter {
  tipo: CanalTipo;
  label: string;
  sincronizarEstoque(canal: CanalVenda, anuncio: AnuncioMarketplace, estoqueReal: number): Promise<{ ok: boolean; estoqueExposto: number }>;
  sincronizarPreco(canal: CanalVenda, anuncio: AnuncioMarketplace, preco: number): Promise<{ ok: boolean }>;
  importarAnuncios(canal: CanalVenda, itens: ItemFiscal[]): Promise<AnuncioMarketplace[]>;
  gerarEtiqueta(canal: CanalVenda, pedido: PedidoMarketplace): Promise<{ codigoRastreio: string; etiquetaUrl: string }>;
  atualizarRastreio(canal: CanalVenda, pedido: PedidoMarketplace): Promise<{ ok: boolean }>;
}

function aplicarSeguranca(estoque: number, pct: number) {
  return Math.max(0, Math.floor(estoque * (1 - pct / 100)));
}

function rand(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function baseAdapter(tipo: CanalTipo, label: string): MarketplaceAdapter {
  return {
    tipo,
    label,
    async sincronizarEstoque(canal, _anuncio, estoqueReal) {
      const exposto = aplicarSeguranca(estoqueReal, canal.estoqueSegurancaPct);
      return { ok: true, estoqueExposto: exposto };
    },
    async sincronizarPreco() {
      return { ok: true };
    },
    async importarAnuncios(canal, itens) {
      return itens.slice(0, 6).map((it, idx) => ({
        id: `anu-${canal.id}-${it.id}-${idx}`,
        canalId: canal.id,
        itemFiscalId: it.id,
        skuExterno: `${label.slice(0, 3).toUpperCase()}-${it.sku}`,
        tituloExterno: `${it.nome} • ${label}`,
        precoExterno: Math.round(it.preco * 1.08 * 100) / 100,
        estoqueExposto: aplicarSeguranca(it.estoqueAtual ?? 0, canal.estoqueSegurancaPct),
        status: "ativo" as const,
      }));
    },
    async gerarEtiqueta(_canal, pedido) {
      return {
        codigoRastreio: rand(label.slice(0, 2).toUpperCase()),
        etiquetaUrl: `https://etiqueta.mock/${pedido.id}.pdf`,
      };
    },
    async atualizarRastreio() {
      return { ok: true };
    },
  };
}

const registry: Record<CanalTipo, MarketplaceAdapter> = {
  mercadolivre: baseAdapter("mercadolivre", "Mercado Livre"),
  shopee: baseAdapter("shopee", "Shopee"),
  amazon: baseAdapter("amazon", "Amazon"),
  shopify: baseAdapter("shopify", "Shopify"),
  woocommerce: baseAdapter("woocommerce", "WooCommerce"),
  outro: baseAdapter("outro", "Outro"),
};

export function getAdapter(tipo: CanalTipo): MarketplaceAdapter {
  return registry[tipo] ?? registry.outro;
}
