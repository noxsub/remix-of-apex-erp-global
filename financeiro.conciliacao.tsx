import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { Upload, CheckCircle2, AlertTriangle, Link2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro/conciliacao")({ component: ConciliacaoPage });

type MovimentoBancario = {
  id: string; data: string; descricao: string; valor: number; tipo: "credito" | "debito";
  banco: string; agencia: string; conta: string;
  tituloVinculado?: string; status: "conciliado" | "pendente" | "divergente";
};

const movimentos: MovimentoBancario[] = [
  { id: "MOV-001", data: "26/06/2026", descricao: "TED RECEBIDA - ACME GLOBAL", valor: 18420, tipo: "credito", banco: "Itaú", agencia: "1234", conta: "56789-0", tituloVinculado: "CR-001", status: "conciliado" },
  { id: "MOV-002", data: "25/06/2026", descricao: "PIX RECEBIDO - NORTHWIND", valor: 9890.5, tipo: "credito", banco: "Itaú", agencia: "1234", conta: "56789-0", tituloVinculado: "CR-002", status: "conciliado" },
  { id: "MOV-003", data: "25/06/2026", descricao: "PGTO BOLETO - BRDRILLING", valor: 120000, tipo: "debito", banco: "Itaú", agencia: "1234", conta: "56789-0", tituloVinculado: "CP-001", status: "conciliado" },
  { id: "MOV-004", data: "24/06/2026", descricao: "TED ENVIADA - CPFL ENERGIA", valor: 7000, tipo: "debito", banco: "Itaú", agencia: "1234", conta: "56789-0", status: "pendente" },
  { id: "MOV-005", data: "24/06/2026", descricao: "CREDITO DESCONHECIDO", valor: 3500, tipo: "credito", banco: "Itaú", agencia: "1234", conta: "56789-0", status: "divergente" },
  { id: "MOV-006", data: "23/06/2026", descricao: "TARIFA BANCÁRIA", valor: 89.9, tipo: "debito", banco: "Itaú", agencia: "1234", conta: "56789-0", status: "pendente" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ConciliacaoPage() {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const filtrados = movimentos.filter(m => filtroStatus === "todos" || m.status === filtroStatus);

  const cols: Column<MovimentoBancario>[] = [
    { key: "data", header: "Data" },
    { key: "descricao", header: "Descrição" },
    { key: "valor", header: "Valor", align: "right", render: (r) => <span className={r.tipo === "credito" ? "text-green-600" : "text-red-600"}>{r.tipo === "debito" ? "-" : ""}{fmt(r.valor)}</span> },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant={r.tipo === "credito" ? "default" : "secondary"}>{r.tipo === "credito" ? "C" : "D"}</Badge> },
    { key: "tituloVinculado", header: "Título", render: (r) => r.tituloVinculado || "—" },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "conciliado" ? "default" : r.status === "divergente" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "", render: (r) => r.status === "pendente" ? <Button size="sm" variant="ghost" onClick={() => toast.success("Vinculado!")}><Link2 className="h-3.5 w-3.5" /></Button> : null },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="conciliado">Conciliados</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="divergente">Divergentes</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-1.5"><Upload className="h-3.5 w-3.5" />Importar OFX</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Conciliados</p><p className="text-lg font-bold text-green-600">{movimentos.filter(m => m.status === "conciliado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Pendentes</p><p className="text-lg font-bold text-amber-600">{movimentos.filter(m => m.status === "pendente").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Divergentes</p><p className="text-lg font-bold text-red-600">{movimentos.filter(m => m.status === "divergente").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Saldo Banco</p><p className="text-lg font-bold">{fmt(movimentos.reduce((s, m) => s + (m.tipo === "credito" ? m.valor : -m.valor), 0))}</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
