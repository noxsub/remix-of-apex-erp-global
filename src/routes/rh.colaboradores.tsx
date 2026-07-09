import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rh/colaboradores")({ component: ColaboradoresPage });

type Colaborador = {
  matricula: string;
  nome: string;
  cpf: string;
  cargo: string;
  departamento: string;
  telefone: string;
  email: string;
  admissao: string;
  salario: number;
  status: "ativo" | "afastado" | "desligado";
};

const colaboradoresIniciais: Colaborador[] = [
  { matricula: "001", nome: "João Silva", cpf: "123.456.789-01", cargo: "Analista Fiscal", departamento: "Fiscal", telefone: "(11) 98888-1001", email: "joao.silva@syntera.com.br", admissao: "15/03/2024", salario: 5800, status: "ativo" },
  { matricula: "002", nome: "Maria Santos", cpf: "234.567.890-12", cargo: "Vendedora", departamento: "Comercial", telefone: "(11) 98888-1002", email: "maria.santos@syntera.com.br", admissao: "02/08/2023", salario: 3200, status: "ativo" },
  { matricula: "003", nome: "Pedro Costa", cpf: "345.678.901-23", cargo: "Estoquista", departamento: "Operações", telefone: "(11) 98888-1003", email: "pedro.costa@syntera.com.br", admissao: "10/01/2025", salario: 2600, status: "ativo" },
  { matricula: "004", nome: "Ana Oliveira", cpf: "456.789.012-34", cargo: "Financeiro", departamento: "Financeiro", telefone: "(11) 98888-1004", email: "ana.oliveira@syntera.com.br", admissao: "05/06/2023", salario: 4500, status: "ativo" },
  { matricula: "005", nome: "Carlos Souza", cpf: "567.890.123-45", cargo: "Motorista", departamento: "Logística", telefone: "(11) 98888-1005", email: "carlos.souza@syntera.com.br", admissao: "20/11/2022", salario: 2900, status: "afastado" },
  { matricula: "006", nome: "Luciana Ferreira", cpf: "678.901.234-56", cargo: "Analista de RH", departamento: "RH", telefone: "(11) 98888-1006", email: "luciana.ferreira@syntera.com.br", admissao: "12/02/2024", salario: 4100, status: "ativo" },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresIniciais);
  const [filtro, setFiltro] = useState("");
  const [filtroDept, setFiltroDept] = useState("todos");
  const [novoOpen, setNovoOpen] = useState(false);

  const departamentos = [...new Set(colaboradoresIniciais.map((c) => c.departamento))];

  const filtrados = colaboradores.filter(
    (c) =>
      (filtroDept === "todos" || c.departamento === filtroDept) &&
      (!filtro || c.nome.toLowerCase().includes(filtro.toLowerCase()) || c.matricula.includes(filtro)),
  );

  const cols: Column<Colaborador>[] = [
    { key: "matricula", header: "Mat." },
    { key: "nome", header: "Nome" },
    { key: "cargo", header: "Cargo" },
    { key: "departamento", header: "Departamento" },
    { key: "telefone", header: "Telefone" },
    { key: "admissao", header: "Admissão" },
    { key: "salario", header: "Salário", align: "right", render: (r) => brl(r.salario) },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={r.status === "ativo" ? "default" : r.status === "afastado" ? "secondary" : "destructive"}>
          {r.status}
        </Badge>
      ),
    },
  ];

  const kpis = {
    total: colaboradores.length,
    ativos: colaboradores.filter((c) => c.status === "ativo").length,
    afastados: colaboradores.filter((c) => c.status === "afastado").length,
    folhaTotal: colaboradores.filter((c) => c.status === "ativo").reduce((s, c) => s + c.salario, 0),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Total</p>
          <p className="text-lg font-bold">{kpis.total}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Ativos</p>
          <p className="text-lg font-bold text-green-600">{kpis.ativos}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Afastados</p>
          <p className="text-lg font-bold text-amber-600">{kpis.afastados}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Folha (ativos)</p>
          <p className="text-lg font-bold">{brl(kpis.folhaTotal)}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou matrícula..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="w-64 pl-8" />
          </div>
          <Select value={filtroDept} onValueChange={setFiltroDept}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os departamentos</SelectItem>
              {departamentos.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NovoColaboradorDialog
          open={novoOpen}
          onOpenChange={setNovoOpen}
          proximaMatricula={String(colaboradores.length + 1).padStart(3, "0")}
          onSalvar={(novo) => {
            setColaboradores((prev) => [...prev, novo]);
            toast.success("Colaborador cadastrado!", { description: novo.nome });
          }}
        />
      </div>

      <DataTable columns={cols} data={filtrados} filename="colaboradores" />
    </div>
  );
}

function NovoColaboradorDialog({
  open,
  onOpenChange,
  proximaMatricula,
  onSalvar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proximaMatricula: string;
  onSalvar: (c: Colaborador) => void;
}) {
  const [form, setForm] = useState({
    nome: "", cpf: "", cargo: "", departamento: "", telefone: "", email: "", admissao: "", salario: "",
  });

  const salvar = () => {
    if (!form.nome || !form.cpf || !form.cargo || !form.departamento) {
      toast.error("Preencha nome, CPF, cargo e departamento.");
      return;
    }
    onSalvar({
      matricula: proximaMatricula,
      nome: form.nome,
      cpf: form.cpf,
      cargo: form.cargo,
      departamento: form.departamento,
      telefone: form.telefone,
      email: form.email,
      admissao: form.admissao || new Date().toLocaleDateString("pt-BR"),
      salario: Number(form.salario.replace(",", ".")) || 0,
      status: "ativo",
    });
    setForm({ nome: "", cpf: "", cargo: "", departamento: "", telefone: "", email: "", admissao: "", salario: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Colaborador</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Cadastrar Colaborador</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Nome completo *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CPF *</Label>
            <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cargo *</Label>
            <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Departamento *</Label>
            <Input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefone</Label>
            <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de admissão</Label>
            <Input type="date" onChange={(e) => setForm({ ...form, admissao: e.target.value.split("-").reverse().join("/") })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Salário (R$)</Label>
            <Input value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} placeholder="0,00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={salvar}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
