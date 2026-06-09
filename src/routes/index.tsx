import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  FileCheck,
  Banknote,
  Calendar,
  LayoutGrid,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Global ERP" },
      { name: "description", content: "Métricas de faturamento e conciliação." },
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

const rangeFactor: Record<Range, number> = {
  mes: 1,
  "30d": 1.08,
  "90d": 2.85,
  ano: 9.4,
  custom: 1.3,
};

const baseRevenue = [
  { month: "Jan", receita: 245000, conciliado: 238000 },
  { month: "Fev", receita: 268000, conciliado: 262000 },
  { month: "Mar", receita: 312000, conciliado: 305000 },
  { month: "Abr", receita: 298000, conciliado: 290000 },
  { month: "Mai", receita: 345000, conciliado: 339000 },
  { month: "Jun", receita: 389000, conciliado: 378000 },
  { month: "Jul", receita: 412000, conciliado: 401000 },
  { month: "Ago", receita: 438000, conciliado: 428000 },
];

const baseChannel = [
  { canal: "E-commerce", valor: 184000 },
  { canal: "Marketplace", valor: 142000 },
  { canal: "Atacado", valor: 78000 },
  { canal: "Internacional", valor: 34000 },
];

type ConciliacaoRow = {
  data: string;
  documento: string;
  cliente: string;
  valor: string;
  status: string;
  canal: string;
  mes: string;
};

const conciliacaoRows: ConciliacaoRow[] = [
  { data: "08/06/2026", documento: "NF-00012458", cliente: "Acme Global Ltd.", valor: "R$ 18.420,00", status: "Conciliado", canal: "E-commerce", mes: "Ago" },
  { data: "08/06/2026", documento: "NF-00012457", cliente: "Northwind Trading", valor: "R$ 9.890,50", status: "Conciliado", canal: "Atacado", mes: "Ago" },
  { data: "07/06/2026", documento: "NF-00012456", cliente: "Contoso S.A.", valor: "R$ 24.100,00", status: "Pendente", canal: "Marketplace", mes: "Jul" },
  { data: "07/06/2026", documento: "NF-00012455", cliente: "Fabrikam Inc.", valor: "R$ 3.250,00", status: "Divergente", canal: "Internacional", mes: "Jul" },
  { data: "06/06/2026", documento: "NF-00012454", cliente: "Initech LLC", valor: "R$ 12.780,00", status: "Conciliado", canal: "E-commerce", mes: "Jun" },
  { data: "05/06/2026", documento: "NF-00012453", cliente: "Globex Corp.", valor: "R$ 7.420,00", status: "Conciliado", canal: "Marketplace", mes: "Jun" },
  { data: "04/06/2026", documento: "NF-00012452", cliente: "Umbrella SA", valor: "R$ 15.910,00", status: "Pendente", canal: "Atacado", mes: "Mai" },
  { data: "03/06/2026", documento: "NF-00012451", cliente: "Stark Industries", valor: "R$ 31.200,00", status: "Conciliado", canal: "Internacional", mes: "Mai" },
];

const conciliacaoColumns: Column<ConciliacaoRow>[] = [
  { key: "data", header: "Data" },
  { key: "documento", header: "Documento" },
  { key: "cliente", header: "Cliente" },
  { key: "valor", header: "Valor", align: "right" },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge value={r.status} />,
  },
];

type WidgetKey = "kpis" | "trend" | "channel" | "table";

function Dashboard() {
  const [range, setRange] = useState<Range>("mes");
  const [filterCanal, setFilterCanal] = useState<string | null>(null);
  const [filterMes, setFilterMes] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>({
    kpis: true,
    trend: true,
    channel: true,
    table: true,
  });

  const factor = rangeFactor[range];

  const revenueData = useMemo(
    () =>
      baseRevenue.map((d) => ({
        ...d,
        receita: Math.round(d.receita * factor * 0.6 + d.receita * 0.4),
        conciliado: Math.round(d.conciliado * factor * 0.6 + d.conciliado * 0.4),
      })),
    [factor],
  );
  const channelData = useMemo(
    () =>
      baseChannel.map((c) => ({
        ...c,
        valor: Math.round(c.valor * factor * 0.7 + c.valor * 0.3),
      })),
    [factor],
  );

  const totals = useMemo(() => {
    const receita = revenueData.reduce((s, d) => s + d.receita, 0);
    const conc = revenueData.reduce((s, d) => s + d.conciliado, 0);
    return {
      faturamento: `R$ ${(receita / 1000).toFixed(0)}k`,
      conciliacao: `${((conc / receita) * 100).toFixed(1)}%`,
      receber: `R$ ${Math.round(184920 * factor * 0.6 + 184920 * 0.4).toLocaleString("pt-BR")}`,
      pagar: `R$ ${Math.round(92180 * factor * 0.6 + 92180 * 0.4).toLocaleString("pt-BR")}`,
    };
  }, [revenueData, factor]);

  const filteredRows = conciliacaoRows.filter(
    (r) =>
      (!filterCanal || r.canal === filterCanal) &&
      (!filterMes || r.mes === filterMes),
  );

  const hasFilters = filterCanal || filterMes;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão consolidada de faturamento e conciliação financeira."
      actions={
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
                <LayoutGrid className="h-3.5 w-3.5" /> Configurar Widgets
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Visibilidade dos blocos
              </div>
              <div className="space-y-2.5">
                {(
                  [
                    ["kpis", "Cartões de KPI"],
                    ["trend", "Faturamento vs Conciliado"],
                    ["channel", "Receita por canal"],
                    ["table", "Conciliação recente"],
                  ] as [WidgetKey, string][]
                ).map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <Label htmlFor={`w-${k}`} className="text-sm font-normal">
                      {label}
                    </Label>
                    <Switch
                      id={`w-${k}`}
                      checked={widgets[k]}
                      onCheckedChange={(v) => setWidgets((p) => ({ ...p, [k]: v }))}
                    />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {filterCanal && (
            <button
              onClick={() => setFilterCanal(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 hover:border-gold"
            >
              Canal: <strong>{filterCanal}</strong>
              <X className="h-3 w-3" />
            </button>
          )}
          {filterMes && (
            <button
              onClick={() => setFilterMes(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 hover:border-gold"
            >
              Mês: <strong>{filterMes}</strong>
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={() => {
              setFilterCanal(null);
              setFilterMes(null);
            }}
            className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Limpar todos
          </button>
        </div>
      )}

      {widgets.kpis && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Faturamento (mês)"
          value={totals.faturamento}
          delta="+12,4%"
          positive
        />
        <MetricCard
          icon={<FileCheck className="h-4 w-4" />}
          label="Conciliação"
          value={totals.conciliacao}
          delta="+1,2 pp"
          positive
        />
        <MetricCard
          icon={<Wallet className="h-4 w-4" />}
          label="A Receber"
          value={totals.receber}
          delta="-3,1%"
          positive={false}
        />
        <MetricCard
          icon={<Banknote className="h-4 w-4" />}
          label="A Pagar"
          value={totals.pagar}
          delta="+4,8%"
          positive={false}
        />
      </div>
      )}

      {(widgets.trend || widgets.channel) && (
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {widgets.trend && (
        <div className="rounded-lg border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Faturamento vs Conciliado</h3>
              <p className="text-xs text-muted-foreground">
                Clique em um mês para filtrar a tabela · {rangeLabels[range]}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <Legend color="var(--gold)" label="Receita" />
              <Legend color="var(--muted-foreground)" label="Conciliado" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={revenueData}
              onClick={(e: { activeLabel?: string }) => {
                if (e?.activeLabel) {
                  setFilterMes((cur) => (cur === e.activeLabel ? null : e.activeLabel!));
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.09 85)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.78 0.09 85)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="receita" stroke="oklch(0.78 0.09 85)" strokeWidth={2} fill="url(#gold)" />
              <Area type="monotone" dataKey="conciliado" stroke="var(--muted-foreground)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}

        {widgets.channel && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold tracking-tight">Receita por canal</h3>
            <p className="text-xs text-muted-foreground">Clique para filtrar a tabela</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={channelData}
              layout="vertical"
              margin={{ left: 12 }}
              onClick={(e: { activeLabel?: string }) => {
                if (e?.activeLabel) {
                  setFilterCanal((cur) => (cur === e.activeLabel ? null : e.activeLabel!));
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="canal" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="valor" fill="oklch(0.78 0.09 85)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>
      )}

      {widgets.table && (
      <div className="mt-4">
        <DataTable
          title="Conciliação recente"
          description={
            hasFilters
              ? `Filtrado por ${[filterCanal, filterMes].filter(Boolean).join(" · ")} — ${filteredRows.length} de ${conciliacaoRows.length}`
              : "Documentos emitidos com status de conciliação bancária."
          }
          columns={conciliacaoColumns}
          data={filteredRows}
          filename="conciliacao"
        />
      </div>
      )}
    </AppShell>
  );
}

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
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className="rounded-md bg-secondary p-1.5 text-gold">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-emerald-600" : "text-destructive"}`}>
        {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{delta}</span>
        <span className="text-muted-foreground">vs mês anterior</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Conciliado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pendente: "bg-gold-soft/30 text-foreground border-gold-soft",
    Divergente: "bg-red-50 text-red-700 border-red-200",
    Pago: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Em aberto": "bg-secondary text-foreground border-border",
    Vencido: "bg-red-50 text-red-700 border-red-200",
    Faturado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rascunho: "bg-secondary text-muted-foreground border-border",
    Enviado: "bg-gold-soft/30 text-foreground border-gold-soft",
    Ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Baixo: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[value] ?? "bg-secondary text-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {value}
    </span>
  );
}
