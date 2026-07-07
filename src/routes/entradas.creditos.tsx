import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator, Download, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export-excel";

export const Route = createFileRoute("/entradas/creditos")({ component: CreditosEntradaPage });

type CreditoFiscal = {
  id: string; periodo: string; imposto: "ICMS" | "PIS" | "COFINS" | "IPI" | "IBS" | "CBS";
  origem: "NF-e Compra" | "CT-e Frete" | "NFS-e Serviço" | "Ativo Imobilizado" | "Energia" | "Telecom";
  documento: string; fornecedor: string;
  baseCalculo: number; aliquota: number; credito: number;
  status: "apropriado" | "pendente" | "glosado" | "estornado";
  competencia: string;
};

const creditosIniciais: CreditoFiscal[] = [
  { id: "CR-001", periodo: "06/2026", imposto: "ICMS", origem: "NF-e Compra", documento: "NF 45210", fornecedor: "BRDrilling", baseCalculo: 120000, aliquota: 18, credito: 21600, status: "apropriado", competencia: "06/2026" },
  { id: "CR-002", periodo: "06/2026", imposto: "PIS", origem: "NF-e Compra", documento: "NF 45210", fornecedor: "BRDrilling", baseCalculo: 120000, aliquota: 1.65, credito: 1980, status: "apropriado", competencia: "06/2026" },
  { id: "CR-003", periodo: "06/2026", imposto: "COFINS", origem: "NF-e Compra", documento: "NF 45210", fornecedor: "BRDrilling", baseCalculo: 120000, aliquota: 7.6, credito: 9120, status: "apropriado", competencia: "06/2026" },
  { id: "CR-004", periodo: "06/2026", imposto: "ICMS", origem: "CT-e Frete", documento: "CT-e 000512", fornecedor: "Transp. Rápida", baseCalculo: 4500, aliquota: 18, credito: 810, status: "apropriado", competencia: "06/2026" },
  { id: "CR-005", periodo: "06/2026", imposto: "PIS", origem: "Energia", documento: "Fatura Jun/26", fornecedor: "CPFL", baseCalculo: 7000, aliquota: 1.65, credito: 115.5, status: "pendente", competencia: "06/2026" },
  { id: "CR-006", periodo: "06/2026", imposto: "COFINS", origem: "Energia", documento: "Fatura Jun/26", fornecedor: "CPFL", baseCalculo: 7000, aliquota: 7.6, credito: 532, status: "pendente", competencia: "06/2026" },
  { id: "CR-007", periodo: "06/2026", imposto: "PIS", origem: "Telecom", documento: "Fatura Jun/26", fornecedor: "Vivo", baseCalculo: 3000, aliquota: 1.65, credito: 49.5, status: "pendente", competencia: "06/2026" },
  { id: "CR-008", periodo: "06/2026", imposto: "COFINS", origem: "Telecom", documento: "Fatura Jun/26", fornecedor: "Vivo", baseCalculo: 3000, aliquota: 7.6, credito: 228, status: "pendente", competencia: "06/2026" },
  { id: "CR-009", periodo: "06/2026", imposto: "ICMS", origem: "Ativo Imobilizado", documento: "CIAP Jun/26", fornecedor: "Diversos", baseCalculo: 500000, aliquota: 18, credito: 1875, status: "apropriado", competencia: "06/2026" },
  { id: "CR-010", periodo: "06/2026", imposto: "CBS", origem: "NF-e Compra", documento: "NF 45210", fornecedor: "BRDrilling", baseCalculo: 120000, aliquota: 0.9, credito: 1080, status: "pendente", competencia: "06/2026" },
];

const resumoPorImposto = [
  { imposto: "ICMS", apropriado: 24285, pendente: 0, glosado: 0 },
  { imposto: "PIS", apropriado: 1980, pendente: 165, glosado: 0 },
  { imposto: "COFINS", apropriado: 9120, pendente: 760, glosado: 0 },
  { imposto: "IPI", apropriado: 0, pendente: 0, glosado: 0 },
  { imposto: "CBS", apropriado: 0, pendente: 1080, glosado: 0 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function CreditosEntradaPage() {
  const [periodo, setPeriodo] = useState("202606");
  const [filtroImposto, setFiltroImposto] = useState("todos");

  const filtrados = creditosIniciais
    .filter(c => filtroImposto === "todos" || c.imposto === filtroImposto);

  const totalApropriado = filtrados.filter(c => c.status === "apropriado").reduce((s, c) => s + c.credito, 0);
  const totalPendente = filtrados.filter(c => c.status === "pendente").reduce((s, c) => s + c.credito, 0);

  const cols: Column<CreditoFiscal>[] = [
    { key: "imposto", header: "Imposto", render: (r) => <Badge variant="outline">{r.imposto}</Badge> },
    { key: "origem", header: "Origem" },
    { key: "documento", header: "Documento" },
    { key: "fornecedor", header: "Fornecedor" },
    { key: "baseCalculo", header: "Base", align: "right", render: (r) => fmt(r.baseCalculo) },
    { key: "aliquota", header: "Alíq. %", align: "right", render: (r) => `${r.aliquota}%` },
    { key: "credito", header: "Crédito", align: "right", render: (r) => <span className="font-semibold text-green-600">{fmt(r.credito)}</span> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "apropriado" ? "default" : r.status === "glosado" ? "destructive" : "secondary"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <div className="flex gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="202606">Junho / 2026</SelectItem>
              <SelectItem value="202605">Maio / 2026</SelectItem>
              <SelectItem value="202604">Abril / 2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroImposto} onValueChange={setFiltroImposto}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ICMS">ICMS</SelectItem>
              <SelectItem value="PIS">PIS</SelectItem>
              <SelectItem value="COFINS">COFINS</SelectItem>
              <SelectItem value="IPI">IPI</SelectItem>
              <SelectItem value="CBS">CBS</SelectItem>
              <SelectItem value="IBS">IBS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Créditos apropriados!")}><Calculator className="h-3.5 w-3.5" />Apropriar Tudo</Button>
          <Button variant="outline" className="gap-1.5" onClick={() => exportToExcel(filtrados, "creditos-fiscais")}><Download className="h-3.5 w-3.5" />Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Créditos</p><p className="text-lg font-bold text-green-600">{fmt(totalApropriado + totalPendente)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Apropriados</p><p className="text-lg font-bold">{fmt(totalApropriado)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Pendentes</p><p className="text-lg font-bold text-amber-600">{fmt(totalPendente)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Origens</p><p className="text-lg font-bold">{new Set(filtrados.map(c => c.origem)).size}</p></Card>
      </div>

      <Card className="p-4 border-border">
        <h3 className="text-sm font-semibold mb-4">Resumo de Créditos por Imposto</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={resumoPorImposto}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="imposto" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip formatter={(v: any) => fmt(v)} />
            <Legend />
            <Bar dataKey="apropriado" fill="#10b981" name="Apropriado" radius={[4,4,0,0]} />
            <Bar dataKey="pendente" fill="#f59e0b" name="Pendente" radius={[4,4,0,0]} />
            <Bar dataKey="glosado" fill="#ef4444" name="Glosado" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
