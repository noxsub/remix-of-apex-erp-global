import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Plus, Search, Eye, Copy, Send, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saidas/orcamentos")({ component: OrcamentosPage });

type Orcamento = {
  id: string; data: string; validade: string; cliente: string; vendedor: string;
  itens: number; subtotal: number; desconto: number; total: number;
  status: "aberto" | "enviado" | "aprovado" | "rejeitado" | "expirado" | "convertido";
};

const orcamentosIniciais: Orcamento[] = [
  { id: "ORC-0052", data: "26/06/2026", validade: "26/07/2026", cliente: "Acme Global Ltd.", vendedor: "João Silva", itens: 5, subtotal: 45000, desconto: 2250, total: 42750, status: "aberto" },
  { id: "ORC-0051", data: "24/06/2026", validade: "24/07/2026", cliente: "Northwind Trading", vendedor: "Maria Santos", itens: 3, subtotal: 18500, desconto: 0, total: 18500, status: "enviado" },
  { id: "ORC-0050", data: "20/06/2026", validade: "20/07/2026", cliente: "Contoso Ltd.", vendedor: "Pedro Costa", itens: 8, subtotal: 67200, desconto: 3360, total: 63840, status: "aprovado" },
  { id: "ORC-0049", data: "15/06/2026", validade: "15/07/2026", cliente: "Globex Corp.", vendedor: "João Silva", itens: 2, subtotal: 8900, desconto: 0, total: 8900, status: "convertido" },
  { id: "ORC-0048", data: "10/06/2026", validade: "10/07/2026", cliente: "Initech LLC", vendedor: "Maria Santos", itens: 4, subtotal: 22100, desconto: 1105, total: 20995, status: "rejeitado" },
  { id: "ORC-0047", data: "01/06/2026", validade: "01/07/2026", cliente: "Fabrikam Inc.", vendedor: "Pedro Costa", itens: 1, subtotal: 5600, desconto: 0, total: 5600, status: "expirado" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState(orcamentosIniciais);
  const [filtro, setFiltro] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState({ cliente: "", vendedor: "", validade: "", itens: 1, subtotal: 0, desconto: 0 });

  const filtrados = orcamentos.filter((o) => !filtro || o.cliente.toLowerCase().includes(filtro.toLowerCase()) || o.id.toLowerCase().includes(filtro.toLowerCase()));

  const converterPedido = (id: string) => {
    setOrcamentos(orcamentos.map(o => o.id === id ? { ...o, status: "convertido" as const } : o));
    toast.success("Orçamento convertido em pedido de venda!");
  };

  const cols: Column<Orcamento>[] = [
    { key: "id", header: "Nº" },
    { key: "data", header: "Data" },
    { key: "validade", header: "Validade" },
    { key: "cliente", header: "Cliente" },
    { key: "vendedor", header: "Vendedor" },
    { key: "itens", header: "Itens", align: "right" },
    { key: "total", header: "Total", align: "right", render: (r) => fmt(r.total) },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "aprovado" || r.status === "convertido" ? "default" : r.status === "rejeitado" || r.status === "expirado" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "Ações", render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => toast.info(`Orçamento ${r.id}`, { description: `${r.cliente} · ${r.itens} ite(ns) · ${r.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` })}><Eye className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" onClick={() => toast.info("Geração de PDF em desenvolvimento")}><Printer className="h-3.5 w-3.5" /></Button>
        {r.status === "aberto" && <Button size="sm" variant="ghost" onClick={() => setOrcamentos(orcamentos.map(o => o.id === r.id ? { ...o, status: "enviado" as const } : o))}><Send className="h-3.5 w-3.5" /></Button>}
        {r.status === "aprovado" && <Button size="sm" variant="ghost" onClick={() => converterPedido(r.id)}><Copy className="h-3.5 w-3.5" /></Button>}
      </div>
    )},
  ];

  const handleCriar = () => {
    const novo: Orcamento = {
      id: `ORC-${String(orcamentos.length + 53).padStart(4, "0")}`,
      data: new Date().toLocaleDateString("pt-BR"), validade: form.validade,
      cliente: form.cliente, vendedor: form.vendedor, itens: form.itens,
      subtotal: form.subtotal, desconto: form.desconto, total: form.subtotal - form.desconto, status: "aberto",
    };
    setOrcamentos([novo, ...orcamentos]);
    setNovoOpen(false);
    toast.success("Orçamento criado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar orçamento..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Orçamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Vendedor</Label><Input value={form.vendedor} onChange={(e) => setForm({ ...form, vendedor: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Validade</Label><Input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Qtd Itens</Label><Input type="number" value={form.itens} onChange={(e) => setForm({ ...form, itens: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Subtotal (R$)</Label><Input type="number" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Desconto (R$)</Label><Input type="number" value={form.desconto} onChange={(e) => setForm({ ...form, desconto: +e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleCriar}>Criar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Abertos</p><p className="text-lg font-bold text-blue-600">{orcamentos.filter(o => o.status === "aberto" || o.status === "enviado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Aprovados</p><p className="text-lg font-bold text-green-600">{orcamentos.filter(o => o.status === "aprovado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Convertidos</p><p className="text-lg font-bold">{orcamentos.filter(o => o.status === "convertido").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Taxa Conversão</p><p className="text-lg font-bold">{orcamentos.length > 0 ? Math.round(orcamentos.filter(o => o.status === "convertido").length / orcamentos.length * 100) : 0}%</p></Card>
      </div>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
