import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";

export const Route = createFileRoute("/financeiro/fluxo")({ component: FluxoCaixaPage });

const fluxoDiario = [
  { dia: "01", realizado: 8500, projetado: 9000 },
  { dia: "05", realizado: 12300, projetado: 11000 },
  { dia: "10", realizado: -15000, projetado: -14000 },
  { dia: "15", realizado: 22000, projetado: 20000 },
  { dia: "20", realizado: -28500, projetado: -25000 },
  { dia: "25", realizado: 35000, projetado: 30000 },
  { dia: "30", realizado: 0, projetado: 15000 },
];

const fluxoCategoria = [
  { categoria: "Clientes", realizado: 192000, projetado: 185000 },
  { categoria: "Fornecedores", realizado: -132000, projetado: -128000 },
  { categoria: "Impostos", realizado: -30580, projetado: -32000 },
  { categoria: "Folha", realizado: -42220, projetado: -42000 },
  { categoria: "Utilidades", realizado: -10000, projetado: -9500 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FluxoCaixaPage() {
  const [visao, setVisao] = useState("diario");
  const saldoRealizado = fluxoCategoria.reduce((s, c) => s + c.realizado, 0);
  const saldoProjetado = fluxoCategoria.reduce((s, c) => s + c.projetado, 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end justify-between">
        <Select value={visao} onValueChange={setVisao}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Fluxo Diário</SelectItem>
            <SelectItem value="categoria">Por Categoria</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={() =>
            exportToExcel(
              visao === "diario" ? fluxoDiario : fluxoCategoria,
              `fluxo-caixa-${visao}`,
            )
          }
        >
          <Download className="h-3.5 w-3.5" />Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 border-border"><p className="text-xs text-muted-foreground">Saldo Realizado</p><p className={`mt-2 text-xl font-bold ${saldoRealizado >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(saldoRealizado)}</p></Card>
        <Card className="p-4 border-border"><p className="text-xs text-muted-foreground">Saldo Projetado</p><p className={`mt-2 text-xl font-bold ${saldoProjetado >= 0 ? "text-blue-600" : "text-red-600"}`}>{fmt(saldoProjetado)}</p></Card>
        <Card className="p-4 border-border"><p className="text-xs text-muted-foreground">Variação</p><p className="mt-2 text-xl font-bold">{fmt(saldoRealizado - saldoProjetado)}</p><p className="text-xs text-muted-foreground mt-1">{saldoRealizado > saldoProjetado ? "Acima do projetado" : "Abaixo do projetado"}</p></Card>
        <Card className="p-4 border-border"><p className="text-xs text-muted-foreground">Aderência</p><p className="mt-2 text-xl font-bold">{saldoProjetado !== 0 ? ((saldoRealizado / saldoProjetado) * 100).toFixed(1) : 0}%</p></Card>
      </div>

      {visao === "diario" ? (
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Fluxo Diário — Realizado × Projetado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoDiario}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="realizado" stroke="#10b981" strokeWidth={2} name="Realizado" />
              <Line type="monotone" dataKey="projetado" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Projetado" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Fluxo por Categoria — Realizado × Projetado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fluxoCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="categoria" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Bar dataKey="realizado" fill="#10b981" name="Realizado" radius={[4,4,0,0]} />
              <Bar dataKey="projetado" fill="#3b82f6" name="Projetado" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
