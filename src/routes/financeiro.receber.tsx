import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable, type Column } from "@/components/data-table";
import { AnexarDocumento } from "@/components/anexar-documento";
import { Plus, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useContasReceber, proximoId, type TituloReceber } from "@/lib/financeiro-store";

export const Route = createFileRoute("/financeiro/receber")({ component: ContasReceberPage });

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ContasReceberPage() {
  const [titulos, setTitulos] = useContasReceber();
  const [filtro, setFiltro] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState({
    documento: "", cliente: "", vencimento: "", valor: "",
    formaPgto: "boleto" as TituloReceber["formaPgto"], centroCusto: "",
  });

  const filtrados = titulos.filter(t => !filtro || t.cliente.toLowerCase().includes(filtro.toLowerCase()));

  const baixar = (id: string) => { setTitulos(titulos.map(t => t.id === id ? { ...t, status: "recebido" as const } : t)); toast.success("Recebimento confirmado!"); };

  const criarTitulo = () => {
    if (!form.documento || !form.cliente || !form.vencimento || !form.valor) {
      toast.error("Preencha documento, cliente, vencimento e valor.");
      return;
    }
    const valorNum = Number(form.valor.replace(",", "."));
    const novo: TituloReceber = {
      id: proximoId(titulos, "CR"),
      documento: form.documento, cliente: form.cliente,
      emissao: new Date().toLocaleDateString("pt-BR"), vencimento: form.vencimento,
      valor: valorNum, juros: 0, multa: 0, totalReceber: valorNum,
      formaPgto: form.formaPgto, centroCusto: form.centroCusto || undefined, status: "aberto",
    };
    setTitulos([novo, ...titulos]);
    setForm({ documento: "", cliente: "", vencimento: "", valor: "", formaPgto: "boleto", centroCusto: "" });
    setNovoOpen(false);
    toast.success("Título lançado com sucesso!");
  };

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
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Título</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Título a Receber</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Documento *</Label>
                <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ex: NF 000200" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Cliente *</Label>
                <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Forma de Recebimento</Label>
                <Select value={form.formaPgto} onValueChange={(v) => setForm({ ...form, formaPgto: v as TituloReceber["formaPgto"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vencimento *</Label>
                <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valor (R$) *</Label>
                <Input value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Centro de Custo</Label>
                <Input value={form.centroCusto} onChange={(e) => setForm({ ...form, centroCusto: e.target.value })} />
              </div>
              <div className="col-span-2">
                <AnexarDocumento label="Anexar nota fiscal / contrato (PDF)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setNovoOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={criarTitulo}>Lançar Título</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
