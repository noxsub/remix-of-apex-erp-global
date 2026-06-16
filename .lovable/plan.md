## Plano de implementação

### Parte 1 — Alíquotas configuráveis (CBS / IBS / IS / IRRF / CSLL)

**Arquivos novos:**
- `src/lib/tax-config.ts` — store persistido (`localStorage` chave `erp:tax-config`) com hook `useTaxConfig()` retornando alíquotas padrão + por tipo de operação (`produto` | `servico`):
  ```
  { produto: { cbs, ibs, is, irrf, csll }, servico: { ... } }
  ```
  Padrões iniciais: CBS 0,9 / IBS 0,1 / IS 0,0 / IRRF 1,5 / CSLL 1,0.

**Arquivos alterados:**
- `src/routes/vendas.tsx` — na `ConferenciaView` ler alíquotas via `useTaxConfig()` em vez de constantes; adicionar toggle Produto/Serviço e botão "Configurar alíquotas" que abre um `Dialog` com inputs editáveis (salva no store).
- `src/routes/configuracoes.tsx` (se existir) ou nova aba "Tributário" — espelha o mesmo editor. *Se não existir rota de configurações, deixa só dentro do dialog de Vendas.*

---

### Parte 2 — Dashboard multi-módulo com Widgets contextuais

**Arquitetura:**
- Novo seletor de **módulo** (chips/tabs no topo: Financeiro · Estoque · Vendas · Cadastros) que troca o conjunto de KPIs, gráficos e o conteúdo do popover "Configurar Widgets".
- Estado do módulo ativo + visibilidade de widgets persistido em `localStorage` (`erp:dashboard-prefs`).
- Toggle global **Tipo de negócio**: `Revenda` | `Serviço` | `Ambos` — controla disponibilidade dos widgets condicionais (Estoque só em Revenda; Churn só em Serviço; Vendas muda opções).

**Fonte de dados — integração real com módulos:**
- Estender `src/lib/erp-store.ts`:
  - Tipos `Produto` (com `categoria`, `precoCusto`, `precoVenda`, `estoque`, `estoqueMin`, `ultimaMov`) e hook `useProdutos()`.
  - Tipo `MovimentacaoEstoque` (entrada/saída/data/qtd/sku) + hook `useMovimentacoes()`.
  - Já existem `useFaturados`, `useOrcamentos`, `useClientes`, `useFornecedores` — reutilizar.
- `src/routes/estoque.tsx` e `src/routes/cadastros.tsx` passam a ler/escrever via esses hooks para que o Dashboard reflita movimentos reais.

**Arquivo novo:**
- `src/lib/dashboard-metrics.ts` — funções puras que agregam os hooks acima em séries para os gráficos (giro, curva ABC, top produtos, ticket médio, funil, ativos vs inativos, distribuição por UF, novos clientes/mês, churn).

**Refactor `src/routes/index.tsx`:**

```text
┌─ Header: [Módulo: Financeiro|Estoque|Vendas|Cadastros] [Tipo: Revenda/Serviço] [Período] [Configurar Widgets] ─┐
│                                                                                                                │
│  Conteúdo varia por módulo ativo (mesma shell, blocos diferentes)                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Módulo FINANCEIRO** (default — mantém o atual):
- KPIs: Faturamento, Conciliação, A Receber, A Pagar (do `useFaturados`)
- Widgets: Faturamento vs Conciliado · Fluxo de Caixa Previsto vs Realizado · Inadimplência Recente · Contas a Pagar do Dia

**Módulo ESTOQUE** (só Revenda):
- KPIs: Valor total do estoque, Nº itens abaixo do mínimo
- Widgets: Giro de Estoque (linha) · Curva ABC (Pareto) · Alertas de Reposição (barras horizontais) · Parados +90 dias · Valoração por Categoria (donut)

**Módulo VENDAS:**
- KPIs: Evolução mensal, Ticket médio
- Widgets Revenda: Top Produtos · Desempenho por Canal
- Widgets Serviço: Serviços Mais Prestados (rosca) · Horas Faturadas vs Disponíveis (gauge)
- Comum: Funil de Orçamentos (orçamentos → em negociação → aprovados → faturados, usando `useOrcamentos` + `useFaturados`)

**Módulo CADASTROS:**
- KPIs: Total de clientes, taxa de crescimento
- Widgets: Ativos vs Inativos (parâmetro X dias configurável) · Distribuição por UF (barras) · Novos Clientes/mês · Churn (só Serviço)

**Componentes auxiliares:**
- `src/components/dashboard/module-switcher.tsx`
- `src/components/dashboard/widget-popover.tsx` — recebe lista contextual de widgets do módulo ativo
- `src/components/dashboard/charts/` — `FunnelChart.tsx`, `GaugeChart.tsx`, `ParetoChart.tsx` (os outros reaproveitam Recharts já em uso)

**Recharts:** já instalado; `Funnel` e `RadialBar` (para gauge) vêm no pacote.

---

### Ordem de execução

1. Criar `tax-config.ts` + integrar em `vendas.tsx` (com dialog de edição).
2. Estender `erp-store.ts` com produtos/movimentações; ajustar `estoque.tsx` minimamente para popular dados reais.
3. Criar `dashboard-metrics.ts`.
4. Refazer `index.tsx` com switcher de módulo e widgets contextuais.
5. Criar componentes de gráfico novos (Funnel, Gauge, Pareto).

### Pergunta antes de implementar

O tipo de negócio (Revenda / Serviço / Ambos) deve ser **global do ERP** (escolhido uma vez nas configurações) ou **alternável no próprio Dashboard** como um toggle?
