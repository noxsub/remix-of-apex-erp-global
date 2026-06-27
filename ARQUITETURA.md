# 🏗️ Sintera ERP — Arquitetura e Guia de Desenvolvimento

Bem-vindo ao **Sintera ERP**, a plataforma gerencial completa de apuração fiscal e financeira, impulsionada por **Floki** — seu assistente de IA.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Módulos Principais](#módulos-principais)
4. [Fluxos de Sincronização](#fluxos-de-sincronização)
5. [Reforma Tributária (IBS/CBS)](#reforma-tributária-ibscbs)
6. [Óbrigações Acessórias](#óbrigações-acessórias)
7. [Sistema Floki](#sistema-floki)
8. [Como Desenvolver](#como-desenvolver)
9. [Testes](#testes)

---

## 🎯 Visão Geral

**Sintera** é um ERP gerencial focado em:

✅ **Apuração Automática de Impostos** — Lucro Real, Presumido, Simples Nacional  
✅ **Reforma Tributária (IBS/CBS)** — Preparado para 2026+  
✅ **Óbrigações Acessórias** — ECF, ECD, SPED Fiscal, Guias (DARF/GPS)  
✅ **Fluxo de Caixa Dinâmico** — Com impacto de reforma tributária em tempo real  
✅ **Inteligência com Floki** — Assistente de IA que guia e sugere ações  
✅ **Sincronização em Cascata** — Dados integrados entre todos os módulos  

**Target:** E-commerce, Varejo, Indústria (pequeno, médio e grande porte)

---

## 🏛️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Floki)                        │
│         Visão consolidada + Alertas em tempo real            │
└──────────┬──────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────────────┐
    │                                                  │
    v                                                  v
┌──────────────────────┐                ┌────────────────────────┐
│   FISCAL             │                │   FINANCEIRO           │
├──────────────────────┤                ├────────────────────────┤
│ • Empresa            │                │ • Contas a Pagar       │
│ • CNAEs              │                │ • Contas a Receber     │
│ • Alíquotas          │                │ • Fluxo de Caixa       │
│ • NF-e / NFS-e       │                │ • Juros / Multas       │
│ • IRPJ / CSLL        │                │ • Análise de Margem    │
└──────┬───────────────┘                └────────────┬───────────┘
       │                                             │
       │    SINCRONIZAÇÃO EM CASCATA ←───────────→  │
       │                                             │
       v                                             v
┌──────────────────────┐                ┌────────────────────────┐
│  REFORMA TRIBUTÁRIA  │                │    ÓBRIGAÇÕES          │
│  (IBS/CBS)           │                │   ACESSÓRIAS           │
├──────────────────────┤                ├────────────────────────┤
│ • Créditos IBS       │                │ • Calendário Fiscal    │
│ • Débitos            │                │ • ECF / ECD            │
│ • Apuração Mensal    │                │ • SPED Fiscal          │
│ • Progressão 2026-35 │                │ • Guias (DARF/GPS)     │
│ • Saldo Credor/Devel │                │ • Protocolos           │
└──────────────────────┘                └────────────────────────┘
       │                                             │
       └─────────────────┬──────────────────────────┘
                         │
                         v
         ┌──────────────────────────────┐
         │    FLOKI (IA Assistant)      │
         ├──────────────────────────────┤
         │ • Sugestões de Ações         │
         │ • Alertas Críticos           │
         │ • Insights Financeiros       │
         │ • Automação de Tarefas       │
         │ • Recomendações Tributárias  │
         └──────────────────────────────┘
```

---

## 📦 Módulos Principais

### 1. **Fiscal** (`/fiscal`)
- Cadastro de empresa, regime tributário, CNAEs
- Configuração de alíquotas por operação
- Emissão de NF-e / NFS-e
- Cálculo de IRPJ / CSLL

**Store:** `src/lib/fiscal-store.ts`

### 2. **Reforma Tributária** (`/reforma-tributaria`)
- Apuração de IBS (Imposto sobre Bens e Serviços)
- Apuração de CBS (Contribuição Social)
- Crédito de entrada, ativo e serviço
- Sincronização com ambiente RFB

**Store:** `src/lib/reforma-tributaria-store.ts`

### 3. **Óbrigações Acessórias** (`/obrigacoes`)
- Calendário de obrigações fiscais
- Geração de arquivos (ECF, ECD, SPED)
- Guias de recolhimento (DARF, GPS, RPA)
- Controle de protocolos

**Store:** `src/lib/obrigacoes-store.ts`

### 4. **Financeiro** (`/financeiro`)
- Contas a pagar e receber
- Fluxo de caixa projetado
- Análise de vencimentos
- Impacto de reforma tributária

**Store:** `src/lib/erp-store.ts`

### 5. **Dashboard** (`/`)
- Visão consolidada de todos os módulos
- KPIs e métricas em tempo real
- Alertas de Floki
- Filtragem por período

---

## 🔄 Fluxos de Sincronização

### Mapa de Propagação de Eventos

Quando um evento ocorre em um módulo, ele se propaga automaticamente em cascata:

```
NF Emitida (Fiscal)
    ├→ Financeiro (gera lançamento)
    ├→ Estoque (atualiza saldo)
    ├→ Reforma Tributária (calcula crédito/débito)
    └→ Óbrigações (marca SPED Fiscal como pendente)

Compra Registrada (Estoque)
    ├→ Fiscal (gera apuração)
    ├→ Financeiro (agenda pagamento)
    ├→ Reforma Tributária (crédito de entrada)
    └→ Floki (alerta de pagamento próximo)

Imposto Apurado (Fiscal)
    ├→ Financeiro (cria guia DARF)
    ├→ Óbrigações (marca obrigação como pronta)
    └→ Floki (alerta de vencimento)

Crédito IBS Adicionado (Reforma)
    ├→ Financeiro (impacta fluxo de caixa)
    └→ Dashboard (atualiza KPI de saldo)
```

**Implementation:** `src/lib/sincronizacao-cascata.ts`

---

## 🏛️ Reforma Tributária (IBS/CBS)

### Alíquota Progressiva 2026-2035

```
2026: 0.90% (50% de alíquota)    → Coeficiente 0.5
2027: 1.80% (alíquota integral)  → Coeficiente 1.0
2028: 2.90% (alíquota máxima)    → Coeficiente 1.0
2029+: Alíquota esperada ~2.9%
```

### Tipos de Crédito

- **Entrada:** Adquirição de bens/insumos
- **Ativo:** Adquisição de ativo imobilizado
- **Serviço:** Contratação de serviços

### Apuração Mensal

```
Total Débitos = Operações × Alíquota
Total Créditos = Σ(Entradas + Ativos + Serviços)

Saldo Credor = Total Créditos - Total Débitos (se positivo)
Saldo Devedor = Total Débitos - Total Créditos (se positivo)

Alíquota Efetiva = (Débitos - Créditos) / Débitos
```

---

## 📋 Óbrigações Acessórias

### Calendário Padrão (Brasil)

| Obrigação | Tipo | Vencimento | Regime |
|-----------|------|-----------|--------|
| SPED Fiscal | XML | 15 dias após mês | Todos |
| ECF | XML | 31º dia do mês | Lucro Real |
| ECD | XML | 31º dia do mês | Lucro Real |
| DARF (IRPJ/CSLL) | Guia | 20º dia do mês | Lucro Real/Presumido |
| GPS | Guia | 20º dia do mês | Todos |
| DACON | XML | Trimestral | Lucro Presumido |

### Geração de Arquivos

Cada obrigação pode gerar múltiplos arquivos:
- XML (assinado digitalmente)
- TXT (SPED Fiscal)
- ZIP (lotes)
- PDF (guias)

---

## 🤖 Sistema Floki

**Floki** é o assistente de IA central que:

### Funcionalidades

1. **Sugestões Inteligentes**
   - "Complete o cadastro da empresa" (quando não configurado)
   - "Você tem 3 obrigações vencidas" (alerta crítico)
   - "Aproveite crédito de entrada de IBS" (recomendação tributária)

2. **Alertas em Tempo Real**
   - Crítico: Obrigação atrasada, erro de sincronização
   - Atenção: Vencimento próximo, análise recomendada
   - Info: Informação, novidades

3. **Insights Financeiros**
   - "Fluxo de caixa está **-15% vs. mês anterior**"
   - "Alíquota média de impostos: 28.5% — acima da média"
   - "Oportunidade de planejamento tributário identificada"

4. **Automação**
   - Gera automaticamente obrigações mensais
   - Calcula apurações
   - Sugere ações baseadas em análise de dados

**Store:** `src/lib/floki-store.ts`

---

## 💻 Como Desenvolver

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Build para produção
npm run build
```

### Adicionando Novo Módulo

1. **Criar a store** (`src/lib/seu-modulo-store.ts`)
   ```typescript
   import { create } from "zustand";
   
   interface SeuModuloState {
     dados: any[];
     // métodos...
   }
   
   export const useSeuModulo = create<SeuModuloState>((set, get) => ({
     // implementação
   }));
   ```

2. **Criar a rota** (`src/routes/seu-modulo.tsx`)
   ```typescript
   import { createFileRoute } from "@tanstack/react-router";
   
   export const Route = createFileRoute("/seu-modulo")({
     component: SeuModuloPage,
   });
   ```

3. **Adicionar ao sidebar** (`src/components/app-sidebar.tsx`)
   ```typescript
   { title: "Seu Módulo", url: "/seu-modulo", icon: SeuIcon }
   ```

4. **Integrar sincronização** (`src/lib/sincronizacao-cascata.ts`)
   - Mapear eventos que disparam no novo módulo
   - Definir destinos (quais módulos devem ser notificados)

### Adicionando Sincronização

```typescript
// Em seu componente, quando algo mudar:
import { useSincronizacao } from "@/lib/sincronizacao-cascata";

const { dispararEvento } = useSincronizacao();

// Disparar evento que se propaga em cascata
await dispararEvento("nf-emitida", "vendas", {
  numero: 12345,
  valor: 5000,
  cliente: "ABC Corp",
});
```

---

## 🧪 Testes

### Executar Testes

```typescript
import { rodare_testes } from "@/lib/testes";

// Em desenvolvimento
await rodare_testes();
```

### Cobertura de Testes

- ✅ Cálculos de apuração (Reforma Tributária)
- ✅ Geração de óbrigações
- ✅ Sincronização em cascata
- ✅ Performance (1000+ registros)
- ✅ Fluxos integrados

---

## 📊 KPIs e Métricas

### Dashboard

- **Faturamento Total** (mês)
- **Imposto Devido** (IRPJ, CSLL, IBS/CBS)
- **Fluxo de Caixa** (projetado vs. realizado)
- **Alíquota Efetiva** (média do período)
- **Taxa de Cumprimento** (óbrigações acessórias)
- **Créditos Disponíveis** (IBS/CBS)

---

## 🔐 Segurança e Compliance

- **Certificado Digital A1/A3** — Para assinatura de documentos
- **Conformidade LGPD** — Proteção de dados pessoais
- **Auditoria de Sincronização** — Log de todas as alterações
- **Backup Automático** — De dados críticos
- **Validação de Integridade** — Hash SHA-256 para arquivos

---

## 📱 Roadmap (Próximas Fases)

### Fase 2 (Setembro 2026)
- [ ] API REST completa
- [ ] Integração com Receita Federal (IBS/CBS)
- [ ] Mobile app (iOS/Android)
- [ ] Relatórios PDF automáticos

### Fase 3 (Dezembro 2026)
- [ ] Integração SAP, Protheus, Omegasoft
- [ ] Análise preditiva com Machine Learning
- [ ] Marketplace de integrações
- [ ] White-label

---

## 💬 Suporte

Para dúvidas ou contribuições, abra uma issue no GitHub ou entre em contato:
- **Email:** dev@sintera.com
- **Slack:** #sintera-erp
- **Docs:** https://docs.sintera.com

---

**Desenvolvido com ❤️ para o mercado tributário brasileiro**

Sintera ERP v1.0.0 — Powered by Floki
