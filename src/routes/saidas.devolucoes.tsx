import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Search, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saidas/devolucoes")({ component: DevolucoesPage });

type Devolucao = {
  id: string; nfOrigem: string; nfDevolucao?: string; data: string; cliente: string;
  motivo: string; itens: number; valorDevolvido: number;
  status: "aberta" | "em_analise" | "aprovada" | "concluida" | "rejeitada";
  tipo: "total" | "parcial";
};

const devolucoesIniciais: Devolucao[] = [
  { id: "DEV-0012", nfOrigem: "NF-55-001-000175", data: "25/06/2026", cliente: "Globex Corp.", motivo: "Produto com defeito", itens: 1, valorDevolvido: 4320, status: "concluida", tipo: "total", nfDevolucao: "NF-55-001-000176" },
  { id: "DEV-0011", nfOrigem: "NF-55-001-000170", data: "20/06/2026", cliente: "Initech LLC", motivo: "Quantidade divergente", itens: 2, valorDevolvido: 2400, status: "aprovada", tipo: "parcial" },
  { id: "DEV-0010", nfOrigem: "NF-55-001-000168", data: "18/06/2026", cliente: "Contoso Ltd.", motivo: "Troca de modelo", itens: 1, valorDevolvido: 5600, status: "em_analise", tipo: "total" },
  { id: "DEV-0009", nfOrigem: "NF-55-001-000160", data: "10/06/2026", cliente: "Fabrikam Inc.", motivo: "Desistência da compra", itens: 3, valorDevolvido: 8900, status: "aberta", tipo: "total" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DevolucoesPage() {
  const [devolucoes, setDevolucoes] = useState(devolucoesIniciais);
  const [filtro, setFiltro] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState({ nfOrigem: "", cliente: "", motivo: "", tipo: "total" as const, itens: 1, valorDevolvido: 0 });

  const filtrados = devolucoes.filter(d => !filtro || d.cliente.toLowerCase().includes(filtro.toLowerCase()) || d.nfOrigem.includes(filtro));

  const cols: Column<Devolucao>[] = [
    { key: "id", header: "Nº" },
    { key: "nfOrigem", header: "NF Origem" },
    { key: "data", header: "Data" },
    { key: "cliente", header: "Cliente" },
    { key: "motivo", header: "Motivo" },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipo}</Badge> },
    { key: "valorDevolvido", header: "Valor", align: "right", render: (r) => fmt(r.valorDevolvido) },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "concluida" ? "default" : r.status === "rejeitada" ? "destructive" : "secondary"}>{r.status.replace("_", " ")}</Badge> },
    { key: "acoes", header: "Ações", render: (r) => (
      <div className="flex gap-1">
        {r.status === "aberta" && <Button size="sm" variant="ghost" onClick={() => { setDevolucoes(devolucoes.map(d => d.id === r.id ? { ...d, status: "em_analise" as const } : d)); toast.success("Enviado para análise"); }}>Analisar</Button>}
        {r.status === "em_analise" && <Button size="sm" variant="ghost" onClick={() => { setDevolucoes(devolucoes.map(d => d.id === r.id ? { ...d, status: "aprovada" as const } : d)); toast.success("Devolução aprovada!"); }}>Aprovar</Button>}
        {r.status === "aprovada" && <Button size="sm" variant="ghost" onClick={() => { setDevolucoes(devolucoes.map(d => d.id === r.id ? { ...d, status: "concluida" as const } : d)); toast.success("Devolução concluída!"); }}><CheckCircle2 className="h-3.5 w-3.5" /></Button>}
      </div>
    )},
  ];

  const handleCriar = () => {
    const nova: Devolucao = {
      id: `DEV-${String(devolucoes.length + 13).padStart(4, "0")}`,
      nfOrigem: form.nfOrigem, data: new Date().toLocaleDateString("pt-BR"),
      cliente: form.cliente, motivo: form.motivo, itens: form.itens,
      valorDevolvido: form.valorDevolvido, status: "aberta", tipo: form.tipo,
    };
    setDevolucoes([nova, ...devolucoes]);
    setNovoOpen(false);
    toast.success("Devolução registrada!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar devolução..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Nova Devolução</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Devolução</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">NF de Origem</Label><Input value={form.nfOrigem} onChange={(e) => setForm({ ...form, nfOrigem: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="total">Total</SelectItem><SelectItem value="parcial">Parcial</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Qtd Itens</Label><Input type="number" value={form.itens} onChange={(e) => setForm({ ...form, itens: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Valor (R$)</Label><Input type="number" value={form.valorDevolvido} onChange={(e) => setForm({ ...form, valorDevolvido: +e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label className="text-xs">Motivo</Label><Textarea value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleCriar}>Registrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Abertas</p><p className="text-lg font-bold text-amber-600">{devolucoes.filter(d => d.status === "aberta" || d.status === "em_analise").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Aprovadas</p><p className="text-lg font-bold text-blue-600">{devolucoes.filter(d => d.status === "aprovada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Concluídas</p><p className="text-lg font-bold text-green-600">{devolucoes.filter(d => d.status === "concluida").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Devolvido</p><p className="text-lg font-bold">{fmt(devolucoes.reduce((s, d) => s + d.valorDevolvido, 0))}</p></Card>
      </div>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
