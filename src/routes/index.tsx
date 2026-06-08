import { createFileRoute } from "@tanstack/react-router";
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
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, FileCheck, Banknote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Global ERP" },
      { name: "description", content: "Métricas de faturamento e conciliação." },
    ],
  }),
  component: Dashboard,
});

const revenueData = [
  { month: "Jan", receita: 245000, conciliado: 238000 },
  { month: "Fev", receita: 268000, conciliado: 262000 },
  { month: "Mar", receita: 312000, conciliado: 305000 },
  { month: "Abr", receita: 298000, conciliado: 290000 },
  { month: "Mai", receita: 345000, conciliado: 339000 },
  { month: "Jun", receita: 389000, conciliado: 378000 },
  { month: "Jul", receita: 412000, conciliado: 401000 },
  { month: "Ago", receita: 438000, conciliado: 428000 },
];

const channelData = [
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
};

const conciliacaoRows: ConciliacaoRow[] = [
  { data: "08/06/2026", documento: "NF-00012458", cliente: "Acme Global Ltd.", valor: "R$ 18.420,00", status: "Conciliado" },
  { data: "08/06/2026", documento: "NF-00012457", cliente: "Northwind Trading", valor: "R$ 9.890,50", status: "Conciliado" },
  { data: "07/06/2026", documento: "NF-00012456", cliente: "Contoso S.A.", valor: "R$ 24.100,00", status: "Pendente" },
  { data: "07/06/2026", documento: "NF-00012455", cliente: "Fabrikam Inc.", valor: "R$ 3.250,00", status: "Divergente" },
  { data: "06/06/2026", documento: "NF-00012454", cliente: "Initech LLC", valor: "R$ 12.780,00", status: "Conciliado" },
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

function Dashboard() {
  return (
    <AppShell title="Dashboard" subtitle="Visão consolidada de faturamento e conciliação financeira.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Faturamento (mês)"
          value="R$ 438.250"
          delta="+12,4%"
          positive
        />
        <MetricCard
          icon={<FileCheck className="h-4 w-4" />}
          label="Conciliação"
          value="97,6%"
          delta="+1,2 pp"
          positive
        />
        <MetricCard
          icon={<Wallet className="h-4 w-4" />}
          label="A Receber"
          value="R$ 184.920"
          delta="-3,1%"
          positive={false}
        />
        <MetricCard
          icon={<Banknote className="h-4 w-4" />}
          label="A Pagar"
          value="R$ 92.180"
          delta="+4,8%"
          positive={false}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Faturamento vs Conciliado</h3>
              <p className="text-xs text-muted-foreground">Últimos 8 meses</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <Legend color="var(--gold)" label="Receita" />
              <Legend color="var(--muted-foreground)" label="Conciliado" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
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

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold tracking-tight">Receita por canal</h3>
            <p className="text-xs text-muted-foreground">Mês corrente</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={channelData} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="canal" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="valor" fill="oklch(0.78 0.09 85)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          title="Conciliação recente"
          description="Documentos emitidos com status de conciliação bancária."
          columns={conciliacaoColumns}
          data={conciliacaoRows}
          filename="conciliacao"
        />
      </div>
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
