import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/financeiro/centros-custo")({ component: CentrosCustoPage });

type CentroCusto = { codigo: string; nome: string; responsavel: string; orcamento: number; realizado: number; saldo: number; percentual: number; status: "ok" | "alerta" | "estourado" };

const centros: CentroCusto[] = [
  { codigo: "CC-01", nome: "Operações", responsavel: "Ana Oliveira", orcamento: 250000, realizado: 218000, saldo: 32000, percentual: 87.2, status: "ok" },
  { codigo: "CC-02", nome: "Administrativo", responsavel: "Luciana Ferreira", orcamento: 80000, realizado: 72000, saldo: 8000, percentual: 90, status: "alerta" },
  { codigo: "CC-03", nome: "Comercial", responsavel: "João Silva", orcamento: 45000, realizado: 38000, saldo: 7000, percentual: 84.4, status: "ok" },
  { codigo: "CC-04", nome: "RH / Pessoal", responsavel: "Maria Santos", orcamento: 180000, realizado: 166800, saldo: 13200, percentual: 92.7, status: "alerta" },
  { codigo: "CC-05", nome: "Fiscal / Tributário", responsavel: "Mateus", orcamento: 35000, realizado: 30580, saldo: 4420, percentual: 87.4, status: "ok" },
  { codigo: "CC-06", nome: "Projetos (Sabesp)", responsavel: "Ana Oliveira", orcamento: 320000, realizado: 298000, saldo: 22000, percentual: 93.1, status: "alerta" },
  { codigo: "CC-07", nome: "Logística", responsavel: "Carlos Souza", orcamento: 60000, realizado: 67000, saldo: -7000, percentual: 111.7, status: "estourado" },
];

const pieData = centros.map(c => ({ name: c.nome, value: c.realizado }));
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function CentrosCustoPage() {
  const cols: Column<CentroCusto>[] = [
    { key: "codigo", header: "Código" },
    { key: "nome", header: "Centro de Custo" },
    { key: "responsavel", header: "Responsável" },
    { key: "orcamento", header: "Orçamento", align: "right", render: (r) => fmt(r.orcamento) },
    { key: "realizado", header: "Realizado", align: "right", render: (r) => fmt(r.realizado) },
    { key: "saldo", header: "Saldo", align: "right", render: (r) => <span className={r.saldo >= 0 ? "text-green-600" : "text-red-600"}>{fmt(r.saldo)}</span> },
    { key: "percentual", header: "% Usado", align: "right", render: (r) => `${r.percentual.toFixed(1)}%` },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "ok" ? "default" : r.status === "estourado" ? "destructive" : "secondary"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Distribuição por Centro de Custo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <div className="grid grid-cols-2 gap-3 content-start">
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Orçamento Total</p><p className="text-lg font-bold">{fmt(centros.reduce((s,c) => s+c.orcamento,0))}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Realizado Total</p><p className="text-lg font-bold">{fmt(centros.reduce((s,c) => s+c.realizado,0))}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Centros OK</p><p className="text-lg font-bold text-green-600">{centros.filter(c => c.status === "ok").length}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Estourados</p><p className="text-lg font-bold text-red-600">{centros.filter(c => c.status === "estourado").length}</p></Card>
        </div>
      </div>
      <DataTable columns={cols} data={centros} />
    </div>
  );
}
