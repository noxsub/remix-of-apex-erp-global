import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Search, Download, Eye, Printer, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saidas/notas-emitidas")({ component: NotasEmitidasPage });

type NfEmitida = {
  numero: string; serie: string; modelo: string; chaveAcesso: string; protocolo: string;
  dataEmissao: string; dataAutorizacao: string; cliente: string; cpfCnpj: string;
  naturezaOp: string; valorTotal: number; valorImpostos: number; valorLiquido: number;
  status: "autorizada" | "cancelada" | "inutilizada" | "denegada";
  xml?: string;
};

const notas: NfEmitida[] = [
  { numero: "000184", serie: "001", modelo: "55", chaveAcesso: "35260612345678000199550010001840001234567890", protocolo: "135260600001234", dataEmissao: "26/06/2026", dataAutorizacao: "26/06/2026 10:15", cliente: "Acme Global Ltd.", cpfCnpj: "12.345.678/0001-99", naturezaOp: "Venda de mercadoria", valorTotal: 18420, valorImpostos: 5942.25, valorLiquido: 12477.75, status: "autorizada" },
  { numero: "000183", serie: "001", modelo: "55", chaveAcesso: "35260612345678000199550010001830009876543210", protocolo: "135260600001233", dataEmissao: "25/06/2026", dataAutorizacao: "25/06/2026 14:30", cliente: "Northwind Trading", cpfCnpj: "98.765.432/0001-11", naturezaOp: "Venda de mercadoria", valorTotal: 9890.5, valorImpostos: 3184.27, valorLiquido: 6706.23, status: "autorizada" },
  { numero: "000182", serie: "001", modelo: "55", chaveAcesso: "35260612345678000199550010001820001111222233", protocolo: "135260600001232", dataEmissao: "24/06/2026", dataAutorizacao: "24/06/2026 09:45", cliente: "Fabrikam Inc.", cpfCnpj: "11.222.333/0001-44", naturezaOp: "Venda de mercadoria", valorTotal: 3250, valorImpostos: 1047.56, valorLiquido: 2202.44, status: "autorizada" },
  { numero: "000181", serie: "001", modelo: "55", chaveAcesso: "35260612345678000199550010001810005555666677", protocolo: "135260600001231", dataEmissao: "23/06/2026", dataAutorizacao: "23/06/2026 16:20", cliente: "Contoso Ltd.", cpfCnpj: "55.666.777/0001-88", naturezaOp: "Venda de mercadoria", valorTotal: 27800, valorImpostos: 8959.5, valorLiquido: 18840.5, status: "autorizada" },
  { numero: "000175", serie: "001", modelo: "55", chaveAcesso: "35260612345678000199550010001750003333444455", protocolo: "135260600001225", dataEmissao: "15/06/2026", dataAutorizacao: "15/06/2026 11:00", cliente: "Globex Corp.", cpfCnpj: "33.444.555/0001-22", naturezaOp: "Venda de mercadoria", valorTotal: 4320, valorImpostos: 1392.12, valorLiquido: 2927.88, status: "cancelada" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function NotasEmitidasPage() {
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [notaSel, setNotaSel] = useState<NfEmitida | null>(null);

  const filtradas = notas
    .filter(n => filtroStatus === "todos" || n.status === filtroStatus)
    .filter(n => !filtro || n.cliente.toLowerCase().includes(filtro.toLowerCase()) || n.numero.includes(filtro) || n.chaveAcesso.includes(filtro));

  const cols: Column<NfEmitida>[] = [
    { key: "numero", header: "Número", render: (r) => `${r.modelo}-${r.serie}-${r.numero}` },
    { key: "dataEmissao", header: "Emissão" },
    { key: "cliente", header: "Cliente" },
    { key: "cpfCnpj", header: "CNPJ" },
    { key: "valorTotal", header: "Valor Total", align: "right", render: (r) => fmt(r.valorTotal) },
    { key: "valorImpostos", header: "Impostos", align: "right", render: (r) => fmt(r.valorImpostos) },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "autorizada" ? "default" : "destructive"}>{r.status}</Badge> },
    { key: "acoes", header: "Ações", render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => { setNotaSel(r); setDetalheOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" onClick={() => toast.success("DANFE gerado!")}><Printer className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" onClick={() => toast.success("XML baixado!")}><Download className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nº, cliente ou chave..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="autorizada">Autorizadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
            <SelectItem value="inutilizada">Inutilizadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Autorizadas</p><p className="text-lg font-bold text-green-600">{notas.filter(n => n.status === "autorizada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Canceladas</p><p className="text-lg font-bold text-red-600">{notas.filter(n => n.status === "cancelada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Emitido</p><p className="text-lg font-bold">{fmt(notas.filter(n => n.status === "autorizada").reduce((s, n) => s + n.valorTotal, 0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Impostos</p><p className="text-lg font-bold">{fmt(notas.filter(n => n.status === "autorizada").reduce((s, n) => s + n.valorImpostos, 0))}</p></Card>
      </div>

      <DataTable columns={cols} data={filtradas} />

      <Dialog open={detalheOpen} onOpenChange={setDetalheOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>NF-e {notaSel?.numero}</DialogTitle></DialogHeader>
          {notaSel && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Cliente:</span> {notaSel.cliente}</div>
                <div><span className="text-muted-foreground">CNPJ:</span> {notaSel.cpfCnpj}</div>
                <div><span className="text-muted-foreground">Emissão:</span> {notaSel.dataEmissao}</div>
                <div><span className="text-muted-foreground">Autorização:</span> {notaSel.dataAutorizacao}</div>
                <div><span className="text-muted-foreground">Natureza:</span> {notaSel.naturezaOp}</div>
                <div><span className="text-muted-foreground">Protocolo:</span> {notaSel.protocolo}</div>
              </div>
              <div className="rounded-md border p-3 bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-1">Chave de Acesso</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono flex-1 break-all">{notaSel.chaveAcesso}</code>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(notaSel.chaveAcesso); toast.success("Chave copiada!"); }}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Total NF</p><p className="font-semibold">{fmt(notaSel.valorTotal)}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Impostos</p><p className="font-semibold">{fmt(notaSel.valorImpostos)}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Líquido</p><p className="font-semibold">{fmt(notaSel.valorLiquido)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
