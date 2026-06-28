import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/entradas/devolucoes")({ component: DevolucoesEntradaPage });

type DevolucaoEntrada = {
  id: string; nfOrigem: string; nfDevolucao: string; data: string; fornecedor: string;
  motivo: string; valorOriginal: number; valorDevolvido: number;
  estornoICMS: number; estornoPIS: number; estornoCOFINS: number; estornoIPI: number;
  impactoFinanceiro: "credito_fornecedor" | "reembolso" | "abatimento";
  status: "pendente" | "processada" | "concluida";
};

const devolucoes: DevolucaoEntrada[] = [
  { id: "DE-001", nfOrigem: "NF-e 45210", nfDevolucao: "NF-e 45215", data: "24/06/2026", fornecedor: "BRDrilling Equipamentos", motivo: "Material fora da especificação", valorOriginal: 45000, valorDevolvido: 45000, estornoICMS: 8100, estornoPIS: 742.5, estornoCOFINS: 3420, estornoIPI: 2250, impactoFinanceiro: "credito_fornecedor", status: "concluida" },
  { id: "DE-002", nfOrigem: "NF-e 45190", nfDevolucao: "", data: "20/06/2026", fornecedor: "Fornecedor ABC", motivo: "Quantidade divergente da nota", valorOriginal: 12000, valorDevolvido: 4000, estornoICMS: 720, estornoPIS: 66, estornoCOFINS: 304, estornoIPI: 0, impactoFinanceiro: "abatimento", status: "pendente" },
  { id: "DE-003", nfOrigem: "NF-e 45150", nfDevolucao: "NF-e 45160", data: "15/06/2026", fornecedor: "Indústria XYZ", motivo: "Defeito de fabricação", valorOriginal: 28000, valorDevolvido: 28000, estornoICMS: 5040, estornoPIS: 462, estornoCOFINS: 2128, estornoIPI: 1400, impactoFinanceiro: "reembolso", status: "processada" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DevolucoesEntradaPage() {
  const [filtro, setFiltro] = useState("");
  const filtrados = devolucoes.filter(d => !filtro || d.fornecedor.toLowerCase().includes(filtro.toLowerCase()));

  const totalEstorno = devolucoes.reduce((s, d) => s + d.estornoICMS + d.estornoPIS + d.estornoCOFINS + d.estornoIPI, 0);

  const cols: Column<DevolucaoEntrada>[] = [
    { key: "id", header: "Nº" },
    { key: "nfOrigem", header: "NF Origem" },
    { key: "data", header: "Data" },
    { key: "fornecedor", header: "Fornecedor" },
    { key: "motivo", header: "Motivo" },
    { key: "valorDevolvido", header: "Valor", align: "right", render: (r) => fmt(r.valorDevolvido) },
    { key: "estornoICMS", header: "Est. ICMS", align: "right", render: (r) => fmt(r.estornoICMS) },
    { key: "estornoPIS", header: "Est. PIS", align: "right", render: (r) => fmt(r.estornoPIS) },
    { key: "estornoCOFINS", header: "Est. COFINS", align: "right", render: (r) => fmt(r.estornoCOFINS) },
    { key: "impactoFinanceiro", header: "Impacto", render: (r) => <Badge variant="outline">{r.impactoFinanceiro.replace("_", " ")}</Badge> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "concluida" ? "default" : r.status === "processada" ? "secondary" : "outline"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar devolução..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Nova Devolução</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Devoluções</p><p className="text-lg font-bold">{devolucoes.length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Valor Devolvido</p><p className="text-lg font-bold">{fmt(devolucoes.reduce((s, d) => s + d.valorDevolvido, 0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Estornos</p><p className="text-lg font-bold text-red-600">{fmt(totalEstorno)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Pendentes</p><p className="text-lg font-bold text-amber-600">{devolucoes.filter(d => d.status === "pendente").length}</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
