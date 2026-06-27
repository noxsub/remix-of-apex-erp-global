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
import { Plus, Search, Eye, Printer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rh/funcionarios")({ component: FuncionariosPage });

type Funcionario = {
  matricula: string; nome: string; cpf: string; cargo: string; departamento: string;
  dataAdmissao: string; salarioBase: number; tipo: "CLT" | "PJ" | "Estágio" | "Temporário";
  status: "ativo" | "afastado" | "ferias" | "desligado";
  ctps?: string; pis?: string; email?: string; telefone?: string;
};

const funcionariosIniciais: Funcionario[] = [
  { matricula: "001", nome: "João Silva", cpf: "123.456.789-00", cargo: "Operador de Perfuração", departamento: "Operações", dataAdmissao: "15/03/2020", salarioBase: 4500, tipo: "CLT", status: "ativo", email: "joao@fs.com", telefone: "(11) 99999-0001" },
  { matricula: "002", nome: "Maria Santos", cpf: "987.654.321-00", cargo: "Analista Fiscal", departamento: "Administrativo", dataAdmissao: "02/08/2021", salarioBase: 5200, tipo: "CLT", status: "ativo", email: "maria@fs.com", telefone: "(11) 99999-0002" },
  { matricula: "003", nome: "Pedro Costa", cpf: "456.789.123-00", cargo: "Técnico de Segurança", departamento: "Segurança", dataAdmissao: "10/01/2022", salarioBase: 3800, tipo: "CLT", status: "ferias", email: "pedro@fs.com", telefone: "(11) 99999-0003" },
  { matricula: "004", nome: "Ana Oliveira", cpf: "321.654.987-00", cargo: "Gerente de Projetos", departamento: "Engenharia", dataAdmissao: "05/06/2019", salarioBase: 8500, tipo: "CLT", status: "ativo", email: "ana@fs.com", telefone: "(11) 99999-0004" },
  { matricula: "005", nome: "Carlos Souza", cpf: "654.321.987-00", cargo: "Motorista", departamento: "Logística", dataAdmissao: "20/11/2023", salarioBase: 3200, tipo: "CLT", status: "ativo", email: "carlos@fs.com", telefone: "(11) 99999-0005" },
  { matricula: "006", nome: "Luciana Ferreira", cpf: "789.123.456-00", cargo: "Auxiliar Administrativo", departamento: "Administrativo", dataAdmissao: "01/04/2024", salarioBase: 2800, tipo: "CLT", status: "ativo", email: "luciana@fs.com", telefone: "(11) 99999-0006" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState(funcionariosIniciais);
  const [filtro, setFiltro] = useState("");
  const [filtroDept, setFiltroDept] = useState("todos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "", cpf: "", cargo: "", departamento: "Operações", salarioBase: 0,
    tipo: "CLT" as const, email: "", telefone: "", ctps: "", pis: "",
  });

  const filtrados = funcionarios
    .filter(f => filtroDept === "todos" || f.departamento === filtroDept)
    .filter(f => !filtro || f.nome.toLowerCase().includes(filtro.toLowerCase()) || f.matricula.includes(filtro));

  const departamentos = [...new Set(funcionarios.map(f => f.departamento))];

  const cols: Column<Funcionario>[] = [
    { key: "matricula", header: "Matrícula" },
    { key: "nome", header: "Nome" },
    { key: "cpf", header: "CPF" },
    { key: "cargo", header: "Cargo" },
    { key: "departamento", header: "Departamento" },
    { key: "dataAdmissao", header: "Admissão" },
    { key: "salarioBase", header: "Salário", align: "right", render: (r) => fmt(r.salarioBase) },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipo}</Badge> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "ativo" ? "default" : r.status === "desligado" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "acoes", header: "", render: (r) => (
      <div className="flex gap-1"><Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button></div>
    )},
  ];

  const handleCriar = () => {
    const novo: Funcionario = {
      matricula: String(funcionarios.length + 7).padStart(3, "0"),
      nome: form.nome, cpf: form.cpf, cargo: form.cargo, departamento: form.departamento,
      dataAdmissao: new Date().toLocaleDateString("pt-BR"), salarioBase: form.salarioBase,
      tipo: form.tipo, status: "ativo", email: form.email, telefone: form.telefone,
      ctps: form.ctps, pis: form.pis,
    };
    setFuncionarios([...funcionarios, novo]);
    setNovoOpen(false);
    toast.success("Funcionário cadastrado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar funcionário..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
          </div>
          <Select value={filtroDept} onValueChange={setFiltroDept}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {departamentos.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Funcionário</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Cadastrar Funcionário</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Nome Completo</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Cargo</Label><Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Departamento</Label>
                <Select value={form.departamento} onValueChange={(v) => setForm({ ...form, departamento: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Engenharia">Engenharia</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Salário Base (R$)</Label><Input type="number" value={form.salarioBase} onChange={(e) => setForm({ ...form, salarioBase: +e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de Contrato</Label>
                <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">CTPS</Label><Input value={form.ctps} onChange={(e) => setForm({ ...form, ctps: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">PIS</Label><Input value={form.pis} onChange={(e) => setForm({ ...form, pis: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleCriar}>Cadastrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Ativos</p><p className="text-lg font-bold text-green-600">{funcionarios.filter(f => f.status === "ativo").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">De Férias</p><p className="text-lg font-bold text-blue-600">{funcionarios.filter(f => f.status === "ferias").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Afastados</p><p className="text-lg font-bold text-amber-600">{funcionarios.filter(f => f.status === "afastado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Folha Total</p><p className="text-lg font-bold">{fmt(funcionarios.filter(f => f.status !== "desligado").reduce((s, f) => s + f.salarioBase, 0))}</p></Card>
      </div>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
