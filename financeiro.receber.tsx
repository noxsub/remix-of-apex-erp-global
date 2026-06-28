import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro/receber")({ component: ContasReceberPage });

type TituloReceber = {
  id: string; documento: string; cliente: string; emissao: string; vencimento: string;
  valor: number; juros: number; multa: number; totalReceber: number;
  formaPgto: "boleto" | "pix" | "ted" | "cartao" | "cheque";
  centroCusto?: string; status: "aberto" | "vencido" | "recebido" | "parcial";
  origemAuto?: string;
};

const titulosIniciais: TituloReceber[] = [
  { id: "CR-001", documento: "NF 000184", cliente: "Acme Global Ltd.", emissao: "26/06/2026", vencimento: "26/07/2026", valor: 18420, juros: 0, multa: 0, totalReceber: 18420, formaPgto: "boleto", centroCusto: "Comercial", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-002", documento: "NF 000183", cliente: "Northwind Trading", emissao: "25/06/2026", vencimento: "25/07/2026", valor: 9890.5, juros: 0, multa: 0, totalReceber: 9890.5, formaPgto: "pix", centroCusto: "Comercial", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-003", documento: "NF 000181", cliente: "Contoso Ltd.", emissao: "23/06/2026", vencimento: "23/07/2026", valor: 27800, juros: 0, multa: 0, totalReceber: 27800, formaPgto: "boleto", centroCusto: "Projetos", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-004", documento: "NF 000170", cliente: "Initech LLC", emissao: "10/06/2026", vencimento: "10/07/2026", valor: 15150, juros: 0, multa: 0, totalReceber: 15150, formaPgto: "ted", centroCusto: "Projetos", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-005", documento: "NF 000160", cliente: "Sabesp", emissao: "01/06/2026", vencimento: "01/07/2026", valor: 45000, juros: 495, multa: 900, totalReceber: 46395, formaPgto: "ted", centroCusto: "Projetos", status: "vencido", origemAuto: "Medição Sabesp" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ContasReceberPage() {
  const [titulos, setTitulos] = useState(titulosIniciais);
  const [filtro, setFiltro] = useState("");
  const filtrados = titulos.filter(t => !filtro || t.cliente.toLowerCase().includes(filtro.toLowerCase()));

  const baixar = (id: string) => { setTitulos(titulos.map(t => t.id === id ? { ...t, status: "recebido" as const } : t)); toast.success("Recebimento confirmado!"); };

  const cols: Column<TituloReceber>[] = [
    { key: "documento", header: "Documento" },
    { key: "cliente", header: "Cliente" },
    { key: "vencimento", header: "Vencimento" },
    { key: "totalReceber", header: "Valor", align: "right", render: (r) => fmt(r.totalReceber) },
    { key: "formaPgto", header: "Forma", render: (r) => <Badge variant="secondary">{r.formaPgto.toUpperCase()}</Badge> },
    { key: "centroCusto", header: "Centro Custo" },
    { key: "origemAuto", header: "Origem", render: (r) => r.origemAuto ? <Badge variant="outline" className="text-[10px]">{r.origemAuto}</Badge> : "Manual" },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "recebido" ? "default" : r.status === "vencido" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "", render: (r) => r.status !== "recebido" ? <Button size="sm" variant="ghost" onClick={() => baixar(r.id)}><CheckCircle2 className="h-3.5 w-3.5" /></Button> : null },
  ];

  const totalAberto = filtrados.filter(t => t.status === "aberto").reduce((s, t) => s + t.totalReceber, 0);
  const totalVencido = filtrados.filter(t => t.status === "vencido").reduce((s, t) => s + t.totalReceber, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar cliente..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" /></div>
        <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Título</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Em Aberto</p><p className="text-lg font-bold text-blue-600">{fmt(totalAberto)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Vencidos</p><p className="text-lg font-bold text-red-600">{fmt(totalVencido)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Recebidos Mês</p><p className="text-lg font-bold text-green-600">{filtrados.filter(t => t.status === "recebido").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Inadimplência</p><p className="text-lg font-bold text-amber-600">{totalAberto > 0 ? ((totalVencido / (totalAberto + totalVencido)) * 100).toFixed(1) : 0}%</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
