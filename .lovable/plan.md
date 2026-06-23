## Expansão do módulo Fiscal — escopo desta entrega

Tudo continua em `localStorage` (sem backend). Single source of truth = `fiscal-store`.

### 1. Vendas amarrado ao catálogo fiscal
**`src/routes/vendas.tsx`**
- O seletor de produtos do orçamento passa a ler de `useItensFiscais()` (não mais lista mock interna).
- Cada linha do orçamento guarda `itemFiscalId`; tipo (produto/serviço) sai do item.
- `ConferenciaView` calcula CBS/IBS/IS/PIS/COFINS/ICMS/ISS por linha = `alíquota do ItemFiscal` (com fallback para alíquotas padrão do Fiscal), e retenções (IRRF/CSLL/PIS/COFINS/ISS/INSS) a partir do **perfil fiscal do cliente**.
- Aviso "Cadastro fiscal incompleto" com botão "Abrir no Fiscal" se o item ou o cliente não tiver perfil.

### 2. Apuração IRPJ e CSLL
**`src/lib/fiscal-store.ts`**
- Nova entidade `ApuracaoConfig`: regime (Presumido/Real), periodicidade (trimestral/anual), % presunção IRPJ e CSLL por atividade (comércio 8%/12%, serviços 32%/32%, etc.), adicional IRPJ (10% acima de R$ 20k/mês), alíquota IRPJ (15%) e CSLL (9%).
- Hook `useApuracaoConfig`.

**`src/routes/fiscal.tsx`** — nova aba **"IRPJ / CSLL"**:
- Edita os percentuais de presunção e alíquotas.
- Tabela de apuração por período lendo `useFaturados()`: receita bruta → base IRPJ/CSLL (presumido) → IRPJ devido + adicional + CSLL devido, separando produto vs. serviço.
- Mostra também total de retenções IRRF/CSLL (compensáveis) sobre o período.

### 3. CNAE — modal flutuante de cadastro
Na aba **Empresa**, botão "+" abre `Dialog` para cadastrar CNAE (código, descrição, principal/secundário, atividade preponderante = produto|serviço|ambos, % presunção IRPJ/CSLL sugerido). Lista de CNAEs já cadastrados com remover/editar.

### 4. Códigos de serviço LC 116 sugeridos por IA a partir dos CNAEs
- Ativar **Lovable Cloud** + AI Gateway (Gemini Flash) para a sugestão.
- Botão **"Sugerir códigos de serviço (IA)"** na aba **Itens/Serviços** → chama edge/server fn `suggest-service-codes` com os CNAEs cadastrados → retorna lista `{ codigo LC116, descricao, cnaeRelacionado, issSugerido }`.
- Resultado vai para uma **biblioteca de códigos de serviço** (`useCodigosServico`) usada como autocomplete ao cadastrar item tipo serviço.
- Cache local; usuário pode aceitar/rejeitar item por item antes de gravar.

### 5. Importação de estoque (planilha padrão)
- Novo botão **"Importar estoque (XLSX/CSV)"** na aba **Itens/Serviços**.
- Botão **"Baixar modelo"** gera XLSX com colunas: `sku, nome, unidade, preco, ncm, cest, origem, cstCsosn, icms, ipi, pis, cofins, cbs, ibs, is, beneficioFiscal, peso, volume, cfopSaidaDentroUF, cfopSaidaForaUF, cfopEntrada, custoMedio, estoqueAtual, estoqueMinimo`.
- Parser via `xlsx` (SheetJS) → valida → preview com erros por linha → confirma → grava em `useItensFiscais` (+ cria/atualiza saldos em `estoque-store`).
- Lib: `bun add xlsx`.

### 6. Base para Módulo de Entradas (preparação, não implementação completa)
- Nova entidade `ConfigEntradaSaidaItem` em `ItemFiscal`: CFOP entrada, CFOP saída UF/fora UF, CST entrada, alíquotas de crédito (ICMS/PIS/COFINS), origem do custo (média/última entrada).
- Aba **Itens/Serviços** ganha sub-aba por item: "Dados fiscais", "Entrada", "Saída".
- TODO comentado: ao importar XML NF-e modelo 55 (futuro módulo Entradas), abrir mesma tela com os campos pré-preenchidos pelo XML; se SKU não existir, cria item fiscal automaticamente.

### Arquivos
- editar `src/lib/fiscal-store.ts` (CNAE, ApuracaoConfig, CodigosServico, ConfigEntradaSaida)
- editar `src/routes/fiscal.tsx` (modal CNAE, aba IRPJ/CSLL, botão IA, import XLSX, sub-abas por item)
- editar `src/routes/vendas.tsx` (seletor lê de itens fiscais, cálculo via perfis)
- novo `src/lib/xlsx-template.ts` (gera/parseia modelo)
- novo `src/lib/api/suggest-service-codes.functions.ts` (server fn → AI Gateway)
- ativar Lovable Cloud

### Fora do escopo
- Emissão real de NF, SPED, ECD/ECF.
- Parser real de XML NF-e (vem com o módulo Entradas).
- DIFAL e ICMS-ST.
