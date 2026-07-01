import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { AnexarDocumento } from "@/components/anexar-documento";
import { Plus, Search, Eye, Printer, Trash2, Copy, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saidas/pedidos")({
  component: PedidosVendaPage,
});

type PedidoVenda = {
  id: string;
  data: string;
  cliente: string;
  cpfCnpj: string;
  vendedor: string;
  condicaoPagamento: string;
  itens: number;
  subtotal: number;
  desconto: number;
  frete: number;
  totalLiquido: number;
  status: "rascunho" | "aguardando" | "aprovado" | "faturado" | "cancelado" | "em_separacao";
  observacoes?: string;
};

const pedidosIniciais: PedidoVenda[] = [
  { id: "PV-2026-0184", data: "26/06/2026", cliente: "Acme Global Ltd.", cpfCnpj: "12.345.678/0001-99", vendedor: "João Silva", condicaoPagamento: "30/60/90", itens: 4, subtotal: 19200, desconto: 780, frete: 0, totalLiquido: 18420, status: "faturado" },
  { id: "PV-2026-0183", data: "25/06/2026", cliente: "Northwind Trading", cpfCnpj: "98.765.432/0001-11", vendedor: "Maria Santos", condicaoPagamento: "À vista", itens: 2, subtotal: 9890.5, desconto: 0, frete: 0, totalLiquido: 9890.5, status: "aguardando" },
  { id: "PV-2026-0182", data: "24/06/2026", cliente: "Fabrikam Inc.", cpfCnpj: "11.222.333/0001-44", vendedor: "João Silva", condicaoPagamento: "30 dias", itens: 1, subtotal: 3250, desconto: 0, frete: 0, totalLiquido: 3250, status: "faturado" },
  { id: "PV-2026-0181", data: "23/06/2026", cliente: "Contoso Ltd.", cpfCnpj: "55.666.777/0001-88", vendedor: "Pedro Costa", condicaoPagamento: "30/60", itens: 6, subtotal: 28500, desconto: 700, frete: 0, totalLiquido: 27800, status: "em_separacao" },
  { id: "PV-2026-0180", data: "22/06/2026", cliente: "Globex Corp.", cpfCnpj: "33.444.555/0001-22", vendedor: "Maria Santos", condicaoPagamento: "À vista", itens: 3, subtotal: 4320, desconto: 0, frete: 0, totalLiquido: 4320, status: "cancelado" },
  { id: "PV-2026-0179", data: "21/06/2026", cliente: "Initech LLC", cpfCnpj: "77.888.999/0001-66", vendedor: "João Silva", condicaoPagamento: "30 dias", itens: 5, subtotal: 15200, desconto: 300, frete: 250, totalLiquido: 15150, status: "aprovado" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PedidosVendaPage() {
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [pedidoSel, setPedidoSel] = useState<PedidoVenda | null>(null);
  const [form, setForm] = useState({
    cliente: "", cpfCnpj: "", vendedor: "", condicaoPagamento: "À vista",
    observacoes: "", itens: 1, subtotal: 0, desconto: 0, frete: 0,
  });

  const filtrados = pedidos
    .filter((p) => filtroStatus === "todos" || p.status === filtroStatus)
    .filter((p) => !filtro || p.cliente.toLowerCase().includes(filtro.toLowerCase()) || p.id.toLowerCase().includes(filtro.toLowerCase()));

  const cols: Column<PedidoVenda>[] = [
    { key: "id", header: "Nº Pedido" },
    { key: "data", header: "Data" },
    { key: "cliente", header: "Cliente" },
    { key: "vendedor", header: "Vendedor" },
    { key: "condicaoPagamento", header: "Condição Pgto" },
    { key: "itens", header: "Itens", align: "right" },
    { key: "totalLiquido", header: "Total", align: "right", render: (r) => fmt(r.totalLiquido) },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status === "em_separacao" ? "Em separação" : r.status === "aguardando" ? "Aguardando" : r.status === "aprovado" ? "Aprovado" : r.status === "faturado" ? "Faturado" : r.status === "rascunho" ? "Rascunho" : "Cancelado"} /> },
    {
      key: "acoes", header: "Ações", render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => { setPedidoSel(r); setDetalheOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost"><Printer className="h-3.5 w-3.5" /></Button>
          {r.status === "aprovado" && <Button size="sm" variant="ghost" onClick={() => { setPedidos(pedidos.map(p => p.id === r.id ? { ...p, status: "faturado" as const } : p)); toast.success("Pedido faturado!"); }}><Send className="h-3.5 w-3.5" /></Button>}
        </div>
      ),
    },
  ];

  const handleCriar = () => {
    const novo: PedidoVenda = {
      id: `PV-2026-${String(pedidos.length + 185).padStart(4, "0")}`,
      data: new Date().toLocaleDateString("pt-BR"),
      cliente: form.cliente,
      cpfCnpj: form.cpfCnpj,
      vendedor: form.vendedor,
      condicaoPagamento: form.condicaoPagamento,
      itens: form.itens,
      subtotal: form.subtotal,
      desconto: form.desconto,
      frete: form.frete,
      totalLiquido: form.subtotal - form.desconto + form.frete,
      status: "rascunho",
      observacoes: form.observacoes,
    };
    setPedidos([novo, ...pedidos]);
    setNovoOpen(false);
    setForm({ cliente: "", cpfCnpj: "", vendedor: "", condicaoPagamento: "À vista", observacoes: "", itens: 1, subtotal: 0, desconto: 0, frete: 0 });
    toast.success("Pedido criado com sucesso!");
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por pedido ou cliente..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="em_separacao">Em Separação</SelectItem>
              <SelectItem value="faturado">Faturado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Novo Pedido de Venda</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Vendedor</Label><Input value={form.vendedor} onChange={(e) => setForm({ ...form, vendedor: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Condição de Pagamento</Label>
                <Select value={form.condicaoPagamento} onValueChange={(v) => setForm({ ...form, condicaoPagamento: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="À vista">À vista</SelectItem>
                    <SelectItem value="30 dias">30 dias</SelectItem>
                    <SelectItem value="30/60">30/60 dias</SelectItem>
                    <SelectItem value="30/60/90">30/60/90 dias</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Qtd Itens</Label><Input type="number" value={form.itens} onChange={(e) => setForm({ ...form, itens: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Subtotal (R$)</Label><Input type="number" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Desconto (R$)</Label><Input type="number" value={form.desconto} onChange={(e) => setForm({ ...form, desconto: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Frete (R$)</Label><Input type="number" value={form.frete} onChange={(e) => setForm({ ...form, frete: +e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label className="text-xs">Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
              <div className="col-span-2">
                <AnexarDocumento label="Anexar orçamento / condição comercial (PDF)" />
              </div>
            </div>
            <DialogFooter><Button onClick={handleCriar}>Criar Pedido</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total</p><p className="text-lg font-bold">{filtrados.length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Aguardando</p><p className="text-lg font-bold text-amber-600">{filtrados.filter(p => p.status === "aguardando").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Aprovados</p><p className="text-lg font-bold text-blue-600">{filtrados.filter(p => p.status === "aprovado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Faturados</p><p className="text-lg font-bold text-green-600">{filtrados.filter(p => p.status === "faturado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Valor Total</p><p className="text-lg font-bold">{fmt(filtrados.reduce((s, p) => s + p.totalLiquido, 0))}</p></Card>
      </div>

      {/* Tabela */}
      <DataTable columns={cols} data={filtrados} />

      {/* Detalhe */}
      <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Pedido {pedidoSel?.id}</DialogTitle></DialogHeader>
          {pedidoSel && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Cliente:</span> {pedidoSel.cliente}</div>
                <div><span className="text-muted-foreground">CNPJ:</span> {pedidoSel.cpfCnpj}</div>
                <div><span className="text-muted-foreground">Vendedor:</span> {pedidoSel.vendedor}</div>
                <div><span className="text-muted-foreground">Pagamento:</span> {pedidoSel.condicaoPagamento}</div>
                <div><span className="text-muted-foreground">Subtotal:</span> {fmt(pedidoSel.subtotal)}</div>
                <div><span className="text-muted-foreground">Desconto:</span> {fmt(pedidoSel.desconto)}</div>
                <div><span className="text-muted-foreground">Frete:</span> {fmt(pedidoSel.frete)}</div>
                <div><span className="text-muted-foreground font-semibold">Total:</span> <span className="font-semibold">{fmt(pedidoSel.totalLiquido)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
