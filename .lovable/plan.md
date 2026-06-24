# Plano — Módulo Omnilink + Floki (ERP Syntera)

Escopo grande: vou entregar em **fases**, mantendo o padrão atual (localStorage + hooks `usePersisted`, sem backend). A ativação de Lovable Cloud + IA real fica reservada para a Fase 4, quando passarmos do mock determinístico da Floki para o gateway de IA.

---

## Fase 1 — Identidade Syntera + Fundação Omnilink

**Branding**
- Renomear app para **Syntera** em `app-sidebar.tsx`, `__root.tsx` (título/meta), README de rotas e dashboard inicial.
- Criar componente `<FlokiBadge />` reutilizável (avatar + nome) usado em alertas e cards de insight.

**Novo store `src/lib/omnilink-store.ts`** (mesma pattern de `fiscal-store.ts`):
- `CanalVenda` { id, nome, tipo: "mercadolivre"|"shopee"|"amazon"|"shopify"|"woocommerce"|"outro", ativo, configuracoesJson, estoqueSegurancaPct, prazoRecebimentoDias, taxaComissaoPadrao, taxaGatewayPadrao }
- `AnuncioMarketplace` { id, canalId, itemFiscalId, skuExterno, tituloExterno, precoExterno, estoqueExposto, status: "ativo"|"pausado"|"erro", variacao? }
- `PedidoMarketplace` (Objeto de Pedido Padrão) { id, canalId, numeroExterno, data, cliente, itens[{itemFiscalId, qtd, precoUnit}], valorBruto, taxaComissao, taxaFrete, taxaPagamento, valorLiquido, status, codigoRastreio?, etiquetaUrl?, nfId? }
- `FilaSincronizacao` { id, tipo: "estoque"|"preco"|"anuncio"|"rastreio", canalId, payload, status: "pendente"|"processando"|"ok"|"erro", tentativas, criadoEm }
- `LancamentoFinanceiroOmni` (extensão tagueada do financeiro) com `origemCanalId, meioPagamentoId, produtoId, pedidoOrigemId`

Hooks: `useCanais`, `useAnuncios`, `usePedidosMarketplace`, `useFilaSync`.

**Adapter pattern**
- `src/lib/omnilink/adapters/types.ts` — interface `MarketplaceAdapter { sincronizarEstoque, sincronizarPreco, importarAnuncios, traduzirPedido, gerarEtiqueta, atualizarRastreio }`
- Mocks: `mercadolivre.adapter.ts`, `shopee.adapter.ts`, `amazon.adapter.ts` (simulados — retornam dados fake mas respeitam a interface).
- Registry `adapters/index.ts` resolve por `canal.tipo`.

---

## Fase 2 — UI Omnilink (rota `/omnilink`)

Nova rota `src/routes/omnilink.tsx` com tabs:
1. **Canais** — CRUD de marketplaces, modal de configuração (chaves API, webhook URL gerada, estoque de segurança, prazo de recebimento).
2. **Anúncios** — lista com filtros por canal, ação "Vincular SKU" (combobox de `useItensFiscais`), ação "Importar anúncios existentes" (mock).
3. **Pedidos** — tabela de pedidos recebidos, status, ações: Faturar (usa `consumirProximoNumeroNF` do fiscal-store), Gerar etiqueta, Atualizar rastreio. Botão "Simular webhook" para testes.
4. **Fila de sincronização** — monitor com retry manual.
5. **Logística** — picking & packing em lote, impressão de etiquetas selecionadas.

Adicionar item "Omnilink" ao `app-sidebar.tsx` (ícone `Plug` ou `Network`).

---

## Fase 3 — Motor Financeiro Composto

- Estender `erp-store.ts` (ou novo `financeiro-store.ts` se não existir) com `LancamentoFinanceiro` desmembrado.
- Ao faturar um `PedidoMarketplace`, gerar **5 lançamentos** atômicos com as tags de rastreabilidade obrigatórias:
  - `+ Valor Bruto` (receita, base fiscal)
  - `- Comissão Plataforma`
  - `- Frete`
  - `- Meio de Pagamento`
  - `= Valor Líquido` (data prevista = data + `prazoRecebimentoDias` do canal)
- Integração com Fiscal: ao faturar, dispara `consumirProximoNumeroNF` e calcula impostos a partir do `ItemFiscal` (já existente).
- Tags ficam em `metadata: { origemCanalId, meioPagamentoId, produtoId, pedidoOrigemId }`.

---

## Fase 4 — Floki (Inteligência Comercial)

**Fase 4a — Determinístico (sem backend):**
- `src/lib/floki/insights.ts` calcula:
  - Margem Contribuição Líquida = Bruto − Taxas − Frete − Impostos − CMV
  - Ranking de rentabilidade por canal
  - Detecção de produtos com margem negativa por canal → gera `FlokiAlert`
  - Impacto de taxas de gateway/antecipação
- Componente `<FlokiAlerts />` na home (`routes/index.tsx`) listando alertas proativos.
- Aba "Floki Insights" dentro do Omnilink com gráficos (recharts já disponível).

**Fase 4b — IA real (opcional, requer Lovable Cloud):**
- Server function `analyze-channel-profitability.functions.ts` chamando Lovable AI Gateway (`google/gemini-3-flash-preview`) com os dados agregados para gerar narrativas mais ricas.
- Só ativar se o usuário confirmar — perguntarei antes de habilitar Cloud.

---

## Arquivos a criar/editar

**Criar**
- `src/lib/omnilink-store.ts`
- `src/lib/omnilink/adapters/{types,mercadolivre,shopee,amazon,index}.ts`
- `src/lib/floki/insights.ts`
- `src/components/floki-badge.tsx`, `src/components/floki-alerts.tsx`
- `src/routes/omnilink.tsx`
- `src/routes/api/public/webhooks.$canalId.ts` (rota pública para webhooks reais — stub que enfileira)

**Editar**
- `src/components/app-sidebar.tsx` (Syntera + item Omnilink)
- `src/routes/__root.tsx` (título)
- `src/routes/index.tsx` (Floki alerts + branding)
- `src/lib/erp-store.ts` (lançamentos financeiros tagueados)
- `src/routes/financeiro.tsx` (exibir tags de origem)
- `src/routes/vendas.tsx` (mostrar pedidos do Omnilink na conferência)

---

## Fora de escopo nesta entrega
- Chamadas reais às APIs de ML/Shopee/Amazon (adapters retornam mock — pronto para plugar credenciais depois).
- Emissão real de NF-e e etiquetas (continua simulado, como hoje).
- Persistência server-side (mantém localStorage até ativar Cloud).

---

## Pergunta antes de executar
Quer que eu já entregue **as 4 fases juntas** ou prefere começar pela **Fase 1 + 2** (fundação + UI Omnilink funcional com mock) e depois iterar Financeiro + Floki?
