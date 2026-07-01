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
import { Plus, Search, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro/pagar")({ component: ContasPagarPage });

type TituloPagar = {
  id: string; documento: string; fornecedor: string; categoria: "fornecedores" | "impostos" | "folha" | "encargos" | "utilidades" | "outros";
  emissao: string; vencimento: string; valor: number; juros: number; multa: number; totalPagar: number;
  formaPgto: "boleto" | "pix" | "ted" | "debito" | "darf" | "gps";
  centroCusto?: string; status: "aberto" | "vencido" | "pago" | "parcial" | "cancelado";
  origemAuto?: string;
};

const titulosIniciais: TituloPagar[] = [
  { id: "CP-001", documento: "NF 45210", fornecedor: "BRDrilling Equipamentos", categoria: "fornecedores", emissao: "25/06/2026", vencimento: "25/07/2026", valor: 120000, juros: 0, multa: 0, totalPagar: 120000, formaPgto: "boleto", centroCusto: "Operações", status: "aberto", origemAuto: "Entrada NF" },
  { id: "CP-002", documento: "INSS-RET Jun/26", fornecedor: "Receita Federal", categoria: "impostos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 8450, juros: 0, multa: 0, totalPagar: 8450, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
  { id: "CP-003", documento: "CSRF Jun/26", fornecedor: "Receita Federal", categoria: "impostos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 4230, juros: 0, multa: 0, totalPagar: 4230, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
  { id: "CP-004", documento: "GPS Jun/26", fornecedor: "INSS", categoria: "encargos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 15800, juros: 0, multa: 0, totalPagar: 15800, formaPgto: "gps", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-005", documento: "FGTS Jun/26", fornecedor: "Caixa Econômica", categoria: "encargos", emissao: "30/06/2026", vencimento: "07/07/2026", valor: 5280, juros: 0, multa: 0, totalPagar: 5280, formaPgto: "ted", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-006", documento: "Folha Jun/26", fornecedor: "Funcionários", categoria: "folha", emissao: "30/06/2026", vencimento: "05/07/2026", valor: 21140, juros: 0, multa: 0, totalPagar: 21140, formaPgto: "ted", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-007", documento: "Fatura Energia", fornecedor: "CPFL Energia", categoria: "utilidades", emissao: "10/06/2026", vencimento: "10/07/2026", valor: 7000, juros: 0, multa: 0, totalPagar: 7000, formaPgto: "boleto", centroCusto: "Administrativo", status: "aberto" },
  { id: "CP-008", documento: "NF 45190", fornecedor: "Fornecedor ABC", categoria: "fornecedores", emissao: "01/06/2026", vencimento: "01/07/2026", valor: 12000, juros: 0, multa: 0, totalPagar: 12000, formaPgto: "boleto", centroCusto: "Operações", status: "aberto", origemAuto: "Entrada NF" },
  { id: "CP-009", documento: "ISS-RET Jun/26", fornecedor: "Prefeitura", categoria: "impostos", emissao: "30/06/2026", vencimento: "15/07/2026", valor: 2100, juros: 0, multa: 0, totalPagar: 2100, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ContasPagarPage() {
  const [titulos, setTitulos] = useState(titulosIniciais);
  const [filtro, setFiltro] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState({
    documento: "", fornecedor: "", categoria: "fornecedores" as TituloPagar["categoria"],
    vencimento: "", valor: "", formaPgto: "boleto" as TituloPagar["formaPgto"], centroCusto: "",
  });

  const criarTitulo = () => {
    if (!form.documento || !form.fornecedor || !form.vencimento || !form.valor) {
      toast.error("Preencha documento, fornecedor, vencimento e valor.");
      return;
    }
    const valorNum = Number(form.valor.replace(",", "."));
    const novo: TituloPagar = {
      id: `CP-${String(titulos.length + 1).padStart(3, "0")}`,
      documento: form.documento, fornecedor: form.fornecedor, categoria: form.categoria,
      emissao: new Date().toLocaleDateString("pt-BR"), vencimento: form.vencimento,
      valor: valorNum, juros: 0, multa: 0, totalPagar: valorNum,
      formaPgto: form.formaPgto, centroCusto: form.centroCusto || undefined, status: "aberto",
    };
    setTitulos([novo, ...titulos]);
    setForm({ documento: "", fornecedor: "", categoria: "fornecedores", vencimento: "", valor: "", formaPgto: "boleto", centroCusto: "" });
    setNovoOpen(false);
    toast.success("Título lançado com sucesso!");
  };

  const filtrados = titulos
    .filter(t => filtroCategoria === "todos" || t.categoria === filtroCategoria)
    .filter(t => !filtro || t.fornecedor.toLowerCase().includes(filtro.toLowerCase()) || t.documento.includes(filtro));

  const baixarTitulo = (id: string) => {
    setTitulos(titulos.map(t => t.id === id ? { ...t, status: "pago" as const } : t));
    toast.success("Título baixado com sucesso!");
  };

  const cols: Column<TituloPagar>[] = [
    { key: "documento", header: "Documento" },
    { key: "fornecedor", header: "Fornecedor / Destino" },
    { key: "categoria", header: "Categoria", render: (r) => <Badge variant="outline">{r.categoria}</Badge> },
    { key: "vencimento", header: "Vencimento" },
    { key: "totalPagar", header: "Valor", align: "right", render: (r) => fmt(r.totalPagar) },
    { key: "formaPgto", header: "Forma", render: (r) => <Badge variant="secondary">{r.formaPgto.toUpperCase()}</Badge> },
    { key: "centroCusto", header: "Centro Custo", render: (r) => r.centroCusto || "—" },
    { key: "origemAuto", header: "Origem", render: (r) => r.origemAuto ? <Badge variant="outline" className="text-[10px]">{r.origemAuto}</Badge> : "Manual" },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "pago" ? "default" : r.status === "vencido" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "", render: (r) => r.status === "aberto" ? <Button size="sm" variant="ghost" onClick={() => baixarTitulo(r.id)}><CheckCircle2 className="h-3.5 w-3.5" /></Button> : null },
  ];

  const totalAberto = filtrados.filter(t => t.status === "aberto").reduce((s, t) => s + t.totalPagar, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar título..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              <SelectItem value="fornecedores">Fornecedores</SelectItem>
              <SelectItem value="impostos">Impostos / Retenções</SelectItem>
              <SelectItem value="folha">Folha de Pagamento</SelectItem>
              <SelectItem value="encargos">Encargos (GPS/FGTS)</SelectItem>
              <SelectItem value="utilidades">Utilidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Título</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Título a Pagar</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Documento *</Label>
                <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ex: NF 45300" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Fornecedor / Destino *</Label>
                <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as TituloPagar["categoria"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fornecedores">Fornecedores</SelectItem>
                    <SelectItem value="impostos">Impostos / Retenções</SelectItem>
                    <SelectItem value="folha">Folha de Pagamento</SelectItem>
                    <SelectItem value="encargos">Encargos (GPS/FGTS)</SelectItem>
                    <SelectItem value="utilidades">Utilidades</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Forma de Pagamento</Label>
                <Select value={form.formaPgto} onValueChange={(v) => setForm({ ...form, formaPgto: v as TituloPagar["formaPgto"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="darf">DARF</SelectItem>
                    <SelectItem value="gps">GPS</SelectItem>
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
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Centro de Custo</Label>
                <Input value={form.centroCusto} onChange={(e) => setForm({ ...form, centroCusto: e.target.value })} />
              </div>
              <div className="col-span-2">
                <AnexarDocumento label="Anexar boleto / nota fiscal (PDF)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setNovoOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={criarTitulo}>Lançar Título</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Em Aberto</p><p className="text-lg font-bold text-red-600">{fmt(totalAberto)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Fornecedores</p><p className="text-lg font-bold">{fmt(filtrados.filter(t => t.categoria === "fornecedores" && t.status === "aberto").reduce((s,t) => s+t.totalPagar,0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Impostos</p><p className="text-lg font-bold">{fmt(filtrados.filter(t => t.categoria === "impostos" && t.status === "aberto").reduce((s,t) => s+t.totalPagar,0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Folha+Encargos</p><p className="text-lg font-bold">{fmt(filtrados.filter(t => (t.categoria === "folha" || t.categoria === "encargos") && t.status === "aberto").reduce((s,t) => s+t.totalPagar,0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Pagos Mês</p><p className="text-lg font-bold text-green-600">{filtrados.filter(t => t.status === "pago").length}</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
