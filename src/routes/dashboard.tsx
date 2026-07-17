import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  FileCheck2,
  Landmark,
  Map as MapIcon,
  Radar,
  Network,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes, useFaturados, useOrcamentos } from "@/lib/erp-store";
import {
  ativosVsInativos,
  curvaABC,
  desempenhoCanais,
  estoqueDemo,
  evolucaoVendas,
  funilOrcamentos,
  giroHistorico,
  valorPorCategoria,
} from "@/lib/dashboard-metrics";
import { usePedidosMarketplace } from "@/lib/omnilink-store";
import { formatAxisCompact, formatBRLCompact } from "@/lib/format";
import { requireAuthenticatedRoute } from "@/lib/require-auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    return requireAuthenticatedRoute();
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Syntera ERP" },
      {
        name: "description",
        content:
          "Painel operacional integrado do Syntera ERP com visão financeira, fiscal, estoque e vendas.",
      },
    ],
  }),
  component: DashboardPage,
});

const moduleOptions = [
  { value: "geral", label: "Visão geral" },
  { value: "financeiro", label: "Financeiro" },
  { value: "estoque", label: "Estoque" },
  { value: "vendas", label: "Vendas" },
  { value: "cadastros", label: "Cadastros" },
] as const;

const quickModules = [
  { label: "Entradas", to: "/entradas", icon: ArrowDownToLine },
  { label: "Saídas", to: "/saidas", icon: ArrowUpFromLine },
  { label: "Financeiro", to: "/financeiro", icon: Wallet },
  { label: "Fiscal", to: "/fiscal", icon: Receipt },
  { label: "Estoque", to: "/estoque", icon: Boxes },
  { label: "Cadastros", to: "/cadastros", icon: Users },
  { label: "Omnilink", to: "/omnilink", icon: Network },
  { label: "Obrigações", to: "/obrigacoes", icon: FileCheck2 },
] as const;

const financeiroData = [
  { mes: "Jan", entradas: 145000, saidas: 128000, saldo: 17000 },
  { mes: "Fev", entradas: 132000, saidas: 135000, saldo: -3000 },
  { mes: "Mar", entradas: 168000, saidas: 142000, saldo: 26000 },
  { mes: "Abr", entradas: 155000, saidas: 148000, saldo: 7000 },
  { mes: "Mai", entradas: 178000, saidas: 162000, saldo: 16000 },
  { mes: "Jun", entradas: 192000, saidas: 171000, saldo: 21000 },
];

function DashboardPage() {
  const [faturados] = useFaturados();
  const [orcamentos] = useOrcamentos();
  const [clientes] = useClientes();
  const [pedidosMarketplace] = usePedidosMarketplace();

  const receitaFaturada = faturados.reduce((sum, pedido) => sum + pedido.total, 0);
  const receitaMarketplace = pedidosMarketplace.reduce((sum, pedido) => sum + pedido.valorLiquido, 0);
  const saldoFinanceiro = financeiroData.reduce((sum, item) => sum + item.saldo, 0) + receitaFaturada + receitaMarketplace;
  const estoqueValorizado = estoqueDemo.reduce((sum, item) => sum + item.estoque * item.custo, 0);
  const orcamentosAbertos = orcamentos.reduce((sum, item) => sum + item.total, 0);

  const vendasData = evolucaoVendas(faturados);
  const funilData = funilOrcamentos(orcamentos, faturados);
  const abcData = curvaABC(estoqueDemo).slice(0, 5);
  const categoriasData = valorPorCategoria(estoqueDemo);
  const clientesData = ativosVsInativos(clientes, faturados);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Centro operacional do Syntera — acesse módulos, acompanhe movimentações e leia os sinais do Floki."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
            <Link to="/mapa-operacional">
              <MapIcon className="h-3.5 w-3.5" /> Mapa Operacional
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
            <Link to="/vetorcore">
              <Radar className="h-3.5 w-3.5" /> VetorCore
            </Link>
          </Button>
          <Select defaultValue="geral">
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Landmark} label="Saldo operacional" value={formatBRLCompact(saldoFinanceiro)} hint="financeiro + faturamento + marketplace" />
          <MetricCard icon={TrendingUp} label="Receita faturada" value={formatBRLCompact(receitaFaturada + receitaMarketplace)} hint={`${faturados.length + pedidosMarketplace.length} pedido(s) integrado(s)`} />
          <MetricCard icon={Boxes} label="Estoque valorizado" value={formatBRLCompact(estoqueValorizado)} hint="base de custo atual" />
          <MetricCard icon={Receipt} label="Orçamentos em aberto" value={formatBRLCompact(orcamentosAbertos)} hint={`${orcamentos.length} orçamento(s) retomáveis`} />
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickModules.map((module) => (
            <Link
              key={module.to}
              to={module.to}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-gold/60 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground transition group-hover:border-gold/40 group-hover:text-gold">
                <module.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{module.label}</span>
                <span className="text-xs text-muted-foreground">Abrir módulo</span>
              </span>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Receita e ticket médio</h2>
                <p className="text-xs text-muted-foreground">Vendas faturadas sincronizadas com o financeiro.</p>
              </div>
              <Badge variant="outline">Vendas</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vendasData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={formatAxisCompact} />
                  <Tooltip formatter={(value) => formatBRLCompact(Number(value))} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="var(--gold)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ticketMedio" name="Ticket médio" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Funil comercial</h2>
                <p className="text-xs text-muted-foreground">Orçamentos retomáveis até faturamento.</p>
              </div>
              <Badge variant="outline">CRM</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funilData} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis type="category" dataKey="etapa" stroke="var(--muted-foreground)" fontSize={12} width={96} />
                  <Tooltip />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                    {funilData.map((entry) => <Cell key={entry.etapa} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <DashboardChart title="Fluxo financeiro" badge="Financeiro" data={financeiroData} xKey="mes" bars={["entradas", "saidas"]} />
          <DashboardChart title="Giro de estoque" badge="Estoque" data={giroHistorico} xKey="mes" bars={["giro"]} />
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Clientes ativos</h2>
              <Badge variant="outline">Cadastros</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={clientesData} dataKey="valor" nameKey="tipo" innerRadius={54} outerRadius={82} paddingAngle={3}>
                    {clientesData.map((entry) => <Cell key={entry.tipo} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="p-4 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Curva ABC — Estoque</h2>
              <Badge variant="outline">Valor por produto</Badge>
            </div>
            <div className="space-y-3">
              {abcData.map((item) => (
                <div key={item.nome} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {item.nome}
                      <Badge variant="secondary">Classe {item.classe}</Badge>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(item.percAcum, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatBRLCompact(item.valor)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="text-sm font-semibold text-foreground">Floki Insights</h2>
            </div>
            <div className="space-y-3 text-sm">
              <Insight text={`Receita integrada de ${formatBRLCompact(receitaFaturada + receitaMarketplace)} pronta para conciliação.`} />
              <Insight text={`${categoriasData.length} categorias de estoque compõem a base de custo e giro.`} />
              <Insight text={`${desempenhoCanais.length} canais comerciais disponíveis para comparação de margem.`} />
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: typeof Wallet; label: string; value: string; hint: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-gold">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

function DashboardChart({ title, badge, data, xKey, bars }: { title: string; badge: string; data: Record<string, string | number>[]; xKey: string; bars: string[] }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Badge variant="outline">{badge}</Badge>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={formatAxisCompact} />
            <Tooltip formatter={(value) => typeof value === "number" && Math.abs(value) > 999 ? formatBRLCompact(value) : value} />
            {bars.map((bar, index) => (
              <Bar key={bar} dataKey={bar} fill={index === 0 ? "var(--gold)" : "var(--muted-foreground)"} radius={[5, 5, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-muted-foreground">
      {text}
    </div>
  );
}