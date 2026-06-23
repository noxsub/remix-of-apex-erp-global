## Módulo Fiscal — escopo desta entrega

Novo módulo central de tributação. Vira a fonte da verdade para alíquotas, perfis e numeração de NF. Cadastros e Vendas passam a consumir dele.

### 1. Nova rota `/fiscal` (`src/routes/fiscal.tsx`)

Layout em abas, padrão dos outros módulos:

- **Empresa** — regime (Simples Nacional / Lucro Presumido / Lucro Real / MEI), CNAE principal + secundários, IE, IM, CRT, regime de apuração (caixa/competência).
- **Escopo Tributário (Clientes)** — biblioteca de **Perfis Fiscais de Cliente** reutilizáveis: contribuinte ICMS (sim/não/isento), Suframa, indicador de IE, CFOP padrão dentro/fora UF, retenções aplicáveis (IRRF, CSLL, PIS, COFINS, ISS, INSS), observações da nota.
- **Itens / Serviços** — cadastro completo: tipo (produto/serviço), NCM, CEST, código de serviço LC 116, origem (0–8), unidade, CST/CSOSN, alíquotas próprias (ICMS, IPI, PIS, COFINS, ISS, **CBS, IBS, IS**), benefício fiscal, peso/volume. Vira a base de produtos/serviços para Estoque e Vendas.
- **Alíquotas padrão** — CBS/IBS/IS + IRRF/CSLL/PIS/COFINS/ISS por tipo de operação (produto/serviço). Migra o que hoje está no diálogo de Vendas para cá; o diálogo de Vendas vira só leitura/atalho.
- **NF-e / NFS-e** — ambiente (homologação/produção), série, próximo número, modelo (55/65/NFS-e), CSC (placeholder), regime de emissão.

Tudo persistido em `localStorage` seguindo o padrão de `erp-store.ts`.

### 2. Novos stores em `src/lib/`

- `fiscal-store.ts` — `useEmpresaFiscal`, `usePerfisFiscaisCliente`, `useItensFiscais`, `useNFConfig`.
- Refator `tax-config.ts` → passa a viver dentro do Fiscal (chave/`hook` mantidos para não quebrar Vendas).

### 3. Integração com Cadastros (`src/routes/cadastros.tsx`)

Aba **Clientes** ganha uma seção/aba **"Escopo Tributário"** no formulário de novo/editar cliente:

- Seleciona um **Perfil Fiscal** da biblioteca **ou** preenche inline (contribuinte ICMS, IE, Suframa, regime presumido do cliente, retenções específicas, CFOP override).
- Campos ficam salvos junto do cliente (`Cliente.fiscal`).
- Aviso visual se faltar escopo tributário (não bloqueia o cadastro, mas alerta no faturamento).

Aba **Produtos/Serviços** passa a refletir os itens cadastrados no Fiscal (single source of truth).

### 4. Integração com Vendas (`src/routes/vendas.tsx`)

Na tela **Conferência / Enviar ao Fiscal**:

- Calcula CBS/IBS/IS/retenções a partir do **perfil fiscal do cliente** + **item fiscal**.
- Se cliente ou item não tem perfil → mostra alerta "Cadastro fiscal incompleto" com link direto para o Fiscal.
- Mantém o botão "Configurar alíquotas" só como atalho para o módulo (em vez de editar inline).
- Número da NF passa a vir do contador em `NFConfig` (incrementa de verdade).

### 5. Navegação

- Adiciona item **"Fiscal"** na sidebar (`src/components/app-sidebar.tsx`), entre Vendas e Financeiro.
- Ícone `Receipt` ou `Scale` do lucide.

### Detalhes técnicos

- Sem backend ainda — tudo `localStorage` (`erp:fiscal:*`).
- `Cliente` e `ItemFiscal` ganham campo opcional `perfilFiscalId` para apontar para a biblioteca.
- Mantém compat: `useTaxConfig` continua exportado de `tax-config.ts`, mas agora lê de `useNFAliquotasPadrao` por baixo.
- Sem migração destrutiva: clientes existentes ficam sem escopo tributário e aparecem com badge "Pendente fiscal".

### Fora do escopo desta entrega

- Integração real com SEFAZ / emissão de XML.
- Cálculo de DIFAL, ICMS-ST por UF, partilha — fica como TODO comentado.
- Importação de tabela NCM oficial — campo livre por enquanto.
