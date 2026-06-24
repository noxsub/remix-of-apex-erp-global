import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Legend as RLegend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  FileCheck,
  LayoutGrid,
  TrendingUp,
  Wallet,
  Package,
  ShoppingCart,
  Users,
  Building2,
  AlertTriangle,
  Boxes,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { useClientes, useFaturados, useOrcamentos } from "@/lib/erp-store";
import {
  ativosVsInativos,
  churnHistorico,
  curvaABC,
  desempenhoCanais,
  distribuicaoUF,
  estoqueDemo,
  evolucaoVendas,
  funilOrcamentos,
  giroHistorico,
  novosClientesMes,
  servicosMaisPrestados,
  topProdutos,
  useModoNegocio,
  valorPorCategoria,
} from "@/lib/dashboard-metrics";
import { FlokiAlerts } from "@/components/floki-alerts";

export { StatusBadge };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Syntera ERP" },
      { name: "description", content: "Visão consolidada do Syntera por módulo, com insights da Floki." },
    ],
  }),
  component: Dashboard,
});

type Range = "mes" | "30d" | "90d" | "ano" | "custom";
const rangeLabels: Record<Range, string> = {
  mes: "Este Mês",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  ano: "Este Ano",
  custom: "Personalizado",
};

type Modulo = "financeiro" | "estoque" | "vendas" | "cadastros";

const GOLD = "oklch(0.78 0.09 85)";

function Dashboard() {
  const [modulo, setModulo] = useState<Modulo>("financeiro");
  const [range, setRange] = useState<Range>("mes");
  const modoNegocio = useModoNegocio();
  const [faturados] = useFaturados();
  const [orcamentos] = useOrcamentos();
  const [clientes] = useClientes();

  // Se o modo é serviço e usuário está em Estoque, joga pra Financeiro
  if (modulo === "estoque" && modoNegocio === "servico") {
    setTimeout(() => setModulo("financeiro"), 0);
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão consolidada por módulo do ERP."
      actions={
        <>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1">
            <Calendar className="h-3.5 w-3.5 text-gold ml-1" />
            <Select value={range} onValueChange={(v) => setRange(v as Range)}>
              <SelectTrigger className="h-7 w-[170px] border-0 bg-transparent shadow-none focus:ring-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(rangeLabels) as Range[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {rangeLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      }
    >
      <div className="mb-4">
        <FlokiAlerts />
      </div>
      <ModuleSwitcher value={modulo} onChange={setModulo} modoNegocio={modoNegocio} />

      {modulo === "financeiro" && <FinanceiroView faturados={faturados} />}
      {modulo === "estoque" && modoNegocio === "revenda" && <EstoqueView />}
      {modulo === "vendas" && (
        <VendasView
          faturados={faturados}
          orcamentos={orcamentos}
          modoNegocio={modoNegocio}
        />
      )}
      {modulo === "cadastros" && (
        <CadastrosView
          clientes={clientes}
          faturados={faturados}
          modoNegocio={modoNegocio}
        />
      )}
    </AppShell>
  );
}

// ─── Module Switcher ────────────────────────────────────────────────────────

function ModuleSwitcher({
  value,
  onChange,
  modoNegocio,
}: {
  value: Modulo;
  onChange: (m: Modulo) => void;
  modoNegocio: "revenda" | "servico";
}) {
  const opts: { key: Modulo; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { key: "financeiro", label: "Financeiro", icon: <Wallet className="h-3.5 w-3.5" /> },
    {
      key: "estoque",
      label: "Estoque",
      icon: <Package className="h-3.5 w-3.5" />,
      disabled: modoNegocio === "servico",
    },
    { key: "vendas", label: "Vendas / Faturamento", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
    { key: "cadastros", label: "Cadastros", icon: <Users className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
      {opts.map((o) => (
        <button
          key={o.key}
          disabled={o.disabled}
          onClick={() => onChange(o.key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            o.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
          )}
          title={o.disabled ? "Disponível apenas no modo Revenda" : undefined}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
        Modo: <span className="font-medium capitalize text-foreground">{modoNegocio}</span>
      </div>
    </div>
  );
}

function WidgetPopover({
  widgets,
  values,
  onChange,
}: {
  widgets: { key: string; label: string }[];
  values: Record<string, boolean>;
  onChange: (k: string, v: boolean) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
          <LayoutGrid className="h-3.5 w-3.5" /> Configurar Widgets
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Visibilidade dos blocos
        </div>
        <div className="space-y-2.5">
          {widgets.map((w) => (
            <div key={w.key} className="flex items-center justify-between gap-2">
              <Label htmlFor={`w-${w.key}`} className="text-sm font-normal">
                {w.label}
              </Label>
              <Switch
                id={`w-${w.key}`}
                checked={values[w.key] ?? true}
                onCheckedChange={(v) => onChange(w.key, v)}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── KPIs ───────────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  delta,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className="rounded-md bg-secondary p-1.5 text-gold">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      {delta && (
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${
            positive ? "text-emerald-600" : "text-destructive"
          }`}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{delta}</span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

// ─── FINANCEIRO ─────────────────────────────────────────────────────────────

type FinKey = "trend" | "fluxo" | "inad" | "pagar";

const baseRevenue = [
  { mes: "Jan", receita: 245000, conciliado: 238000, previsto: 250000, realizado: 232000 },
  { mes: "Fev", receita: 268000, conciliado: 262000, previsto: 275000, realizado: 261000 },
  { mes: "Mar", receita: 312000, conciliado: 305000, previsto: 305000, realizado: 308000 },
  { mes: "Abr", receita: 298000, conciliado: 290000, previsto: 310000, realizado: 296000 },
  { mes: "Mai", receita: 345000, conciliado: 339000, previsto: 340000, realizado: 348000 },
  { mes: "Jun", receita: 389000, conciliado: 378000, previsto: 380000, realizado: 391000 },
  { mes: "Jul", receita: 412000, conciliado: 401000, previsto: 410000, realizado: 408000 },
  { mes: "Ago", receita: 438000, conciliado: 428000, previsto: 435000, realizado: 442000 },
];

function FinanceiroView({
  faturados,
}: {
  faturados: ReturnType<typeof useFaturados>[0];
}) {
  const [widgets, setWidgets] = useState<Record<FinKey, boolean>>({
    trend: true,
    fluxo: true,
    inad: true,
    pagar: true,
  });
  const totalFat = faturados.reduce((s, f) => s + f.total, 0);
  const receita = baseRevenue.reduce((s, d) => s + d.receita, 0) + totalFat;
  const conc = baseRevenue.reduce((s, d) => s + d.conciliado, 0);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <WidgetPopover
          widgets={[
            { key: "trend", label: "Faturamento vs Conciliado" },
            { key: "fluxo", label: "Fluxo de Caixa (Previsto vs Realizado)" },
            { key: "inad", label: "Inadimplência Recente" },
            { key: "pagar", label: "Contas a Pagar do Dia" },
          ]}
          values={widgets}
          onChange={(k, v) => setWidgets((p) => ({ ...p, [k as FinKey]: v }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Faturamento"
          value={`R$ ${(receita / 1000).toFixed(0)}k`}
          delta="+12,4%"
          positive
        />
        <MetricCard
          icon={<FileCheck className="h-4 w-4" />}
          label="Conciliação"
          value={`${((conc / Math.max(receita, 1)) * 100).toFixed(1)}%`}
          delta="+1,2 pp"
          positive
        />
        <MetricCard
          icon={<Wallet className="h-4 w-4" />}
          label="A Receber"
          value={`R$ ${(184920).toLocaleString("pt-BR")}`}
          delta="-3,1%"
          positive={false}
        />
        <MetricCard
          icon={<Banknote className="h-4 w-4" />}
          label="A Pagar"
          value={`R$ ${(92180).toLocaleString("pt-BR")}`}
          delta="+4,8%"
          positive={false}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {widgets.trend && (
          <Card title="Faturamento vs Conciliado" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={baseRevenue}>
                <defs>
                  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="receita" stroke={GOLD} strokeWidth={2} fill="url(#gold)" />
                <Area type="monotone" dataKey="conciliado" stroke="var(--muted-foreground)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.fluxo && (
          <Card title="Fluxo de Caixa" description="Previsto vs Realizado">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={baseRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="previsto" fill="var(--muted-foreground)" opacity={0.4} barSize={12} />
                <Line type="monotone" dataKey="realizado" stroke={GOLD} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {(widgets.inad || widgets.pagar) && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {widgets.inad && (
            <Card title="Inadimplência recente">
              <DataTable
                columns={[
                  { key: "cliente", header: "Cliente" },
                  { key: "venc", header: "Vencimento" },
                  { key: "dias", header: "Dias", align: "right" },
                  { key: "valor", header: "Valor", align: "right" },
                ]}
                data={[
                  { cliente: "Contoso S.A.", venc: "01/06/2026", dias: 7, valor: "R$ 24.100,00" },
                  { cliente: "Umbrella SA", venc: "28/05/2026", dias: 11, valor: "R$ 15.910,00" },
                  { cliente: "Initech LLC", venc: "20/05/2026", dias: 19, valor: "R$ 8.420,00" },
                ]}
                filename="inadimplencia"
              />
            </Card>
          )}
          {widgets.pagar && (
            <Card title="Contas a pagar — hoje">
              <DataTable
                columns={[
                  { key: "fornecedor", header: "Fornecedor" },
                  { key: "categoria", header: "Categoria" },
                  { key: "valor", header: "Valor", align: "right" },
                ]}
                data={[
                  { fornecedor: "Fornecedor Alpha S.A.", categoria: "Mercadorias", valor: "R$ 18.420,00" },
                  { fornecedor: "Logística Express ME", categoria: "Frete", valor: "R$ 3.250,00" },
                  { fornecedor: "Energia Elétrica", categoria: "Utilidades", valor: "R$ 2.140,00" },
                ]}
                filename="contas-pagar"
              />
            </Card>
          )}
        </div>
      )}
    </>
  );
}

// ─── ESTOQUE ────────────────────────────────────────────────────────────────

type EstKey = "giro" | "abc" | "alertas" | "parados" | "valor";

function EstoqueView() {
  const [widgets, setWidgets] = useState<Record<EstKey, boolean>>({
    giro: true,
    abc: true,
    alertas: true,
    parados: true,
    valor: true,
  });
  const itens = estoqueDemo;
  const valorTotal = itens.reduce((s, i) => s + i.estoque * i.custo, 0);
  const abaixoMin = itens.filter((i) => i.estoque < i.estoqueMin).length;
  const abc = useMemo(() => curvaABC(itens), [itens]);
  const porCategoria = useMemo(() => valorPorCategoria(itens), [itens]);
  const alertas = itens
    .filter((i) => i.estoque < i.estoqueMin)
    .sort((a, b) => a.estoque / a.estoqueMin - b.estoque / b.estoqueMin);
  const parados = itens.filter((i) => i.diasParado >= 90);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <WidgetPopover
          widgets={[
            { key: "giro", label: "Giro de Estoque" },
            { key: "abc", label: "Curva ABC de Produtos" },
            { key: "alertas", label: "Alertas de Reposição Urgente" },
            { key: "parados", label: "Produtos Parados +90 dias" },
            { key: "valor", label: "Valoração por Categoria" },
          ]}
          values={widgets}
          onChange={(k, v) => setWidgets((p) => ({ ...p, [k as EstKey]: v }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Boxes className="h-4 w-4" />}
          label="Valor em estoque"
          value={valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Abaixo do mínimo"
          value={`${abaixoMin} itens`}
        />
        <MetricCard icon={<Package className="h-4 w-4" />} label="SKUs ativos" value={`${itens.length}`} />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Giro médio (ano)"
          value={(itens.reduce((s, i) => s + i.giro, 0) / itens.length).toFixed(1) + "x"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {widgets.giro && (
          <Card title="Giro de Estoque" description="Renovações por período" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={giroHistorico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="giro" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.valor && (
          <Card title="Valoração por Categoria">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={porCategoria} dataKey="valor" nameKey="categoria" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {porCategoria.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`oklch(${0.78 - i * 0.07} ${0.09 + i * 0.01} ${85 - i * 30})`}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <RLegend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {widgets.abc && (
          <Card title="Curva ABC" description="Classificação por valor de estoque">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={abc}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis yAxisId="l" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="l" dataKey="valor" barSize={20}>
                  {abc.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.classe === "A" ? GOLD : d.classe === "B" ? "oklch(0.72 0.10 85)" : "var(--muted-foreground)"}
                    />
                  ))}
                </Bar>
                <Line yAxisId="r" type="monotone" dataKey="percAcum" stroke="oklch(0.55 0.15 25)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.alertas && (
          <Card title="Alertas de Reposição Urgente" description="Itens abaixo do estoque mínimo">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={alertas} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="nome" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="estoque" fill="oklch(0.62 0.18 25)" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="estoqueMin" fill="var(--muted-foreground)" opacity={0.35} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {widgets.parados && parados.length > 0 && (
        <div className="mt-4">
          <Card title="Produtos parados há +90 dias">
            <DataTable
              columns={[
                { key: "sku", header: "SKU" },
                { key: "nome", header: "Produto" },
                { key: "categoria", header: "Categoria" },
                { key: "estoque", header: "Estoque", align: "right" },
                { key: "diasParado", header: "Dias parado", align: "right" },
              ]}
              data={parados}
              filename="parados"
            />
          </Card>
        </div>
      )}
    </>
  );
}

// ─── VENDAS ─────────────────────────────────────────────────────────────────

type VenKey = "evolucao" | "top" | "canais" | "servicos" | "horas" | "funil";

function VendasView({
  faturados,
  orcamentos,
  modoNegocio,
}: {
  faturados: ReturnType<typeof useFaturados>[0];
  orcamentos: ReturnType<typeof useOrcamentos>[0];
  modoNegocio: "revenda" | "servico";
}) {
  const [widgets, setWidgets] = useState<Record<VenKey, boolean>>({
    evolucao: true,
    top: true,
    canais: true,
    servicos: true,
    horas: true,
    funil: true,
  });
  const evol = useMemo(() => evolucaoVendas(faturados), [faturados]);
  const top = useMemo(() => topProdutos(faturados), [faturados]);
  const funil = useMemo(() => funilOrcamentos(orcamentos, faturados), [orcamentos, faturados]);

  const receitaTotal = evol.reduce((s, d) => s + d.receita, 0);
  const ticketMedio = receitaTotal / Math.max(faturados.length + 80, 1);
  const taxaOcupacao = 72;

  const widgetsList: { key: VenKey; label: string }[] = [
    { key: "evolucao", label: "Evolução de Vendas" },
    ...(modoNegocio === "revenda"
      ? ([
          { key: "top", label: "Top Produtos Mais Vendidos" },
          { key: "canais", label: "Desempenho por Canal" },
        ] as { key: VenKey; label: string }[])
      : ([
          { key: "servicos", label: "Serviços Mais Prestados" },
          { key: "horas", label: "Horas Faturadas vs Disponíveis" },
        ] as { key: VenKey; label: string }[])),
    { key: "funil", label: "Funil de Orçamentos" },
  ];

  return (
    <>
      <div className="mb-3 flex justify-end">
        <WidgetPopover
          widgets={widgetsList}
          values={widgets}
          onChange={(k, v) => setWidgets((p) => ({ ...p, [k as VenKey]: v }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Receita acumulada"
          value={receitaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          delta="+8,4%"
          positive
        />
        <MetricCard
          icon={<ShoppingCart className="h-4 w-4" />}
          label="Ticket médio"
          value={ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          delta="+2,1%"
          positive
        />
        <MetricCard
          icon={<FileCheck className="h-4 w-4" />}
          label="Pedidos faturados"
          value={`${faturados.length + 80}`}
        />
        <MetricCard
          icon={<Wallet className="h-4 w-4" />}
          label="Orçamentos em aberto"
          value={`${orcamentos.length + 18}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {widgets.evolucao && (
          <Card title="Evolução de Vendas" description="Receita e ticket médio mensal" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={evol}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="l" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="l" dataKey="receita" fill={GOLD} radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="r" type="monotone" dataKey="ticketMedio" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.funil && (
          <Card title="Funil de Orçamentos" description="Conversão por etapa">
            <ResponsiveContainer width="100%" height={260}>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="valor" data={funil} isAnimationActive>
                  <LabelList position="right" fill="var(--foreground)" stroke="none" dataKey="etapa" style={{ fontSize: 11 }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {modoNegocio === "revenda" && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {widgets.top && (
            <Card title="Top Produtos Mais Vendidos">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="nome" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={150} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                  <Bar dataKey="valor" fill={GOLD} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {widgets.canais && (
            <Card title="Desempenho por Canal">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={desempenhoCanais}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="canal" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="valor" fill={GOLD} radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {modoNegocio === "servico" && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {widgets.servicos && (
            <Card title="Serviços Mais Prestados">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={servicosMaisPrestados} dataKey="valor" nameKey="nome" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {servicosMaisPrestados.map((_, i) => (
                      <Cell key={i} fill={`oklch(${0.78 - i * 0.08} 0.09 ${85 + i * 20})`} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                  <RLegend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
          {widgets.horas && (
            <Card title="Horas Faturadas vs Disponíveis" description="Taxa de ocupação da equipe">
              <ResponsiveContainer width="100%" height={260}>
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "Ocupação", value: taxaOcupacao, fill: GOLD }]} startAngle={210} endAngle={-30}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="mt-[-180px] mb-[140px] text-center">
                <div className="text-3xl font-semibold tabular-nums">{taxaOcupacao}%</div>
                <div className="text-xs text-muted-foreground">do tempo disponível</div>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

// ─── CADASTROS ──────────────────────────────────────────────────────────────

type CadKey = "ativos" | "uf" | "novos" | "churn";

function CadastrosView({
  clientes,
  faturados,
  modoNegocio,
}: {
  clientes: ReturnType<typeof useClientes>[0];
  faturados: ReturnType<typeof useFaturados>[0];
  modoNegocio: "revenda" | "servico";
}) {
  const [widgets, setWidgets] = useState<Record<CadKey, boolean>>({
    ativos: true,
    uf: true,
    novos: true,
    churn: true,
  });
  const ativos = useMemo(() => ativosVsInativos(clientes, faturados), [clientes, faturados]);
  const uf = useMemo(() => distribuicaoUF(clientes), [clientes]);
  const taxaCrescimento =
    ((novosClientesMes[novosClientesMes.length - 1].novos -
      novosClientesMes[novosClientesMes.length - 2].novos) /
      novosClientesMes[novosClientesMes.length - 2].novos) *
    100;

  const widgetsList: { key: CadKey; label: string }[] = [
    { key: "ativos", label: "Clientes Ativos vs Inativos" },
    { key: "uf", label: "Distribuição Geográfica" },
    { key: "novos", label: "Novos Clientes Cadastrados" },
    ...(modoNegocio === "servico"
      ? ([{ key: "churn", label: "Taxa de Churn (Cancelamentos)" }] as { key: CadKey; label: string }[])
      : []),
  ];

  return (
    <>
      <div className="mb-3 flex justify-end">
        <WidgetPopover
          widgets={widgetsList}
          values={widgets}
          onChange={(k, v) => setWidgets((p) => ({ ...p, [k as CadKey]: v }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Clientes na base"
          value={`${clientes.length}`}
        />
        <MetricCard
          icon={<UserPlus className="h-4 w-4" />}
          label="Crescimento"
          value={`${taxaCrescimento.toFixed(1)}%`}
          delta="vs mês anterior"
          positive={taxaCrescimento > 0}
        />
        <MetricCard icon={<Building2 className="h-4 w-4" />} label="Ativos" value={`${ativos[0].valor}`} />
        <MetricCard
          icon={<Building2 className="h-4 w-4" />}
          label="Inativos"
          value={`${ativos[1].valor}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {widgets.ativos && (
          <Card title="Clientes Ativos vs Inativos">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ativos} dataKey="valor" nameKey="tipo" innerRadius={50} outerRadius={85}>
                  {ativos.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <RLegend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.uf && (
          <Card title="Distribuição Geográfica" description="Clientes por UF" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={uf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="uf" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" fill={GOLD} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {widgets.novos && (
          <Card title="Novos Clientes Cadastrados" description="Ritmo mensal">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={novosClientesMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="novos" fill={GOLD} radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        {widgets.churn && modoNegocio === "servico" && (
          <Card title="Taxa de Churn" description="Cancelamentos mensais (%)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={churnHistorico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="churn" stroke="oklch(0.62 0.18 25)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </>
  );
}