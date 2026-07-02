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
import { Plus, Search, Send, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useFaturados } from "@/lib/erp-store";
import { useContasReceber, proximoId } from "@/lib/financeiro-store";
import { useItensFiscais } from "@/lib/fiscal-store";

export const Route = createFileRoute("/saidas/faturamento")({ component: FaturamentoPage });

type ItemFaturamento = {
  codigo: string; descricao: string; ncm: string; cfop: string;
  un: string; qtd: number; unitario: number; total: number;
  icms: number; ipi: number; pis: number; cofins: number;
};

type NfEmissao = {
  id: string; pedido: string; cliente: string; cpfCnpj: string;
  modelo: "55" | "65" | "NFS-e"; serie: string; numero: string;
  naturezaOp: string; itens: ItemFaturamento[];
  subtotal: number; desconto: number; frete: number; seguro: number; outrasDespesas: number;
  totalNf: number; totalImpostos: number;
  status: "rascunho" | "validando" | "autorizada" | "rejeitada" | "cancelada";
  chaveAcesso?: string; protocolo?: string;
};

const itensExemplo: ItemFaturamento[] = [
  { codigo: "PRD-001", descricao: "Tubo de perfuração HDD 4\"", ncm: "7304.19.00", cfop: "5.102", un: "UN", qtd: 10, unitario: 1200, total: 12000, icms: 2160, ipi: 600, pis: 198, cofins: 912 },
  { codigo: "PRD-002", descricao: "Cabeça de perfuração direcional", ncm: "8207.19.00", cfop: "5.102", un: "UN", qtd: 2, unitario: 3210, total: 6420, icms: 1155.6, ipi: 321, pis: 105.93, cofins: 488.72 },
];

const nfsIniciais: NfEmissao[] = [
  { id: "FAT-001", pedido: "PV-2026-0184", cliente: "Acme Global Ltd.", cpfCnpj: "12.345.678/0001-99", modelo: "55", serie: "001", numero: "000184", naturezaOp: "Venda de mercadoria", itens: itensExemplo, subtotal: 18420, desconto: 0, frete: 0, seguro: 0, outrasDespesas: 0, totalNf: 18420, totalImpostos: 5942.25, status: "autorizada", chaveAcesso: "35260612345678000199550010001840001234567890", protocolo: "135260600001234" },
  { id: "FAT-002", pedido: "PV-2026-0183", cliente: "Northwind Trading", cpfCnpj: "98.765.432/0001-11", modelo: "55", serie: "001", numero: "000185", naturezaOp: "Venda de mercadoria", itens: [], subtotal: 9890.5, desconto: 0, frete: 0, seguro: 0, outrasDespesas: 0, totalNf: 9890.5, totalImpostos: 3184.27, status: "rascunho" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FaturamentoPage() {
  const [nfs, setNfs] = useState(nfsIniciais);
  const [novoOpen, setNovoOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [, setFaturados] = useFaturados();
  const [, setContasReceber] = useContasReceber();
  const [, setItens] = useItensFiscais();
  const [form, setForm] = useState({
    pedido: "", cliente: "", cpfCnpj: "", modelo: "55" as const,
    naturezaOp: "Venda de mercadoria", subtotal: 0, desconto: 0, frete: 0,
  });

  const filtrados = nfs.filter(n => !filtro || n.cliente.toLowerCase().includes(filtro.toLowerCase()) || n.pedido.includes(filtro));

  const emitirNf = (id: string) => {
    const nf = nfs.find((n) => n.id === id);
    if (!nf) return;
    setNfs(nfs.map(n => n.id === id ? { ...n, status: "autorizada" as const, chaveAcesso: `3526061234567800019955001000${n.numero}1234567890`, protocolo: `13526060000${Date.now().toString().slice(-4)}` } : n));

    // fecha o ciclo Venda → Financeiro: gera título a receber
    setContasReceber((prev) => [
      {
        id: proximoId(prev, "CR"),
        documento: `NF ${nf.numero}`,
        cliente: nf.cliente,
        emissao: new Date().toLocaleDateString("pt-BR"),
        vencimento: new Date(Date.now() + 30 * 86400000).toLocaleDateString("pt-BR"),
        valor: nf.totalNf,
        juros: 0,
        multa: 0,
        totalReceber: nf.totalNf,
        formaPgto: "boleto",
        centroCusto: "Comercial",
        status: "aberto",
        origemAuto: "Faturamento NF",
      },
      ...prev,
    ]);

    // fecha o ciclo Venda → Dashboard: alimenta o KPI "Receita faturada"
    setFaturados((prev) => [
      { nf: `${nf.modelo}-${nf.numero}`, data: new Date().toLocaleDateString("pt-BR"), clienteNome: nf.cliente, itens: nf.itens.length || 1, total: nf.totalNf, status: "Faturado" },
      ...prev,
    ]);

    // fecha o ciclo Venda → Estoque: desconta os itens vendidos que possuem SKU cadastrado
    if (nf.itens.length > 0) {
      setItens((prev) =>
        prev.map((it) => {
          const vendido = nf.itens.find((li) => li.codigo === it.sku);
          return vendido ? { ...it, estoqueAtual: Math.max(0, (it.estoqueAtual ?? 0) - vendido.qtd) } : it;
        }),
      );
    }

    toast.success("NF-e autorizada na SEFAZ!", { description: "Título a receber gerado em Financeiro." });
  };

  const cols: Column<NfEmissao>[] = [
    { key: "numero", header: "Número", render: (r) => `NF-${r.modelo}-${r.serie}-${r.numero}` },
    { key: "pedido", header: "Pedido" },
    { key: "cliente", header: "Cliente" },
    { key: "naturezaOp", header: "Nat. Operação" },
    { key: "totalNf", header: "Total NF", align: "right", render: (r) => fmt(r.totalNf) },
    { key: "totalImpostos", header: "Impostos", align: "right", render: (r) => fmt(r.totalImpostos) },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "autorizada" ? "default" : r.status === "rejeitada" || r.status === "cancelada" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "Ações", render: (r) => (
      <div className="flex gap-1">
        {r.status === "rascunho" && <Button size="sm" variant="ghost" className="gap-1" onClick={() => emitirNf(r.id)}><Send className="h-3.5 w-3.5" />Emitir</Button>}
        {r.status === "autorizada" && <Button size="sm" variant="ghost"><FileText className="h-3.5 w-3.5" /></Button>}
      </div>
    )},
  ];

  const handleCriar = () => {
    const novo: NfEmissao = {
      id: `FAT-${String(nfs.length + 3).padStart(3, "0")}`,
      pedido: form.pedido, cliente: form.cliente, cpfCnpj: form.cpfCnpj,
      modelo: form.modelo, serie: "001", numero: String(nfs.length + 186).padStart(6, "0"),
      naturezaOp: form.naturezaOp, itens: [],
      subtotal: form.subtotal, desconto: form.desconto, frete: form.frete, seguro: 0, outrasDespesas: 0,
      totalNf: form.subtotal - form.desconto + form.frete,
      totalImpostos: (form.subtotal - form.desconto + form.frete) * 0.3225,
      status: "rascunho",
    };
    setNfs([novo, ...nfs]);
    setNovoOpen(false);
    toast.success("NF criada como rascunho!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou pedido..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Nova NF</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Emitir Nota Fiscal</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Pedido de Origem</Label><Input value={form.pedido} onChange={(e) => setForm({ ...form, pedido: e.target.value })} placeholder="PV-2026-0000" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Modelo</Label>
                <Select value={form.modelo} onValueChange={(v: any) => setForm({ ...form, modelo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="55">NF-e (Modelo 55)</SelectItem>
                    <SelectItem value="65">NFC-e (Modelo 65)</SelectItem>
                    <SelectItem value="NFS-e">NFS-e (Serviço)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Natureza da Operação</Label><Input value={form.naturezaOp} onChange={(e) => setForm({ ...form, naturezaOp: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Subtotal (R$)</Label><Input type="number" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Desconto (R$)</Label><Input type="number" value={form.desconto} onChange={(e) => setForm({ ...form, desconto: +e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Frete (R$)</Label><Input type="number" value={form.frete} onChange={(e) => setForm({ ...form, frete: +e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleCriar}>Criar Rascunho</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Rascunho</p><p className="text-lg font-bold text-amber-600">{nfs.filter(n => n.status === "rascunho").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Autorizadas</p><p className="text-lg font-bold text-green-600">{nfs.filter(n => n.status === "autorizada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Rejeitadas</p><p className="text-lg font-bold text-red-600">{nfs.filter(n => n.status === "rejeitada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Faturado</p><p className="text-lg font-bold">{fmt(nfs.filter(n => n.status === "autorizada").reduce((s, n) => s + n.totalNf, 0))}</p></Card>
      </div>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
