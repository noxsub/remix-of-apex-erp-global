import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Users, Wallet, Calendar, Heart, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/rh/")({ component: RhIndex });

const custoMensal = [
  { mes: "Jan", salarios: 98000, beneficios: 22000, encargos: 35000 },
  { mes: "Fev", salarios: 98000, beneficios: 22000, encargos: 35000 },
  { mes: "Mar", salarios: 102000, beneficios: 23000, encargos: 36500 },
  { mes: "Abr", salarios: 102000, beneficios: 23000, encargos: 36500 },
  { mes: "Mai", salarios: 105000, beneficios: 24000, encargos: 37800 },
  { mes: "Jun", salarios: 105000, beneficios: 24000, encargos: 37800 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function RhIndex() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Funcionários Ativos</p><p className="mt-2 text-xl font-bold">14</p></div><Users className="h-5 w-5 text-blue-600" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Folha Mensal</p><p className="mt-2 text-xl font-bold">R$ 166.800</p></div><Wallet className="h-5 w-5 text-green-600" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Férias Pendentes</p><p className="mt-2 text-xl font-bold text-amber-600">3</p></div><Calendar className="h-5 w-5 text-amber-600" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Custo por Funcionário</p><p className="mt-2 text-xl font-bold">R$ 11.914</p></div><TrendingUp className="h-5 w-5 text-muted-foreground" /></div>
        </Card>
      </div>

      <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">3 colaboradores com férias vencidas</p>
          <p className="text-xs text-muted-foreground mt-1">João Silva (12 meses), Maria Santos (14 meses), Pedro Costa (13 meses). Regularize conforme CLT Art. 134.</p>
        </div>
      </div>

      <Card className="p-4 border-border">
        <h3 className="text-sm font-semibold mb-4">Custo Mensal de Pessoal</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={custoMensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip formatter={(v: any) => fmt(v as number)} />
            <Bar dataKey="salarios" fill="#3b82f6" name="Salários" stackId="a" />
            <Bar dataKey="beneficios" fill="#10b981" name="Benefícios" stackId="a" />
            <Bar dataKey="encargos" fill="#f59e0b" name="Encargos" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
