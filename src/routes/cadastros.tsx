import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Settings2, Package, Briefcase } from "lucide-react";
import { StatusBadge } from "./index";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros — Global ERP" },
      { name: "description", content: "Clientes, fornecedores e colaboradores." },
    ],
  }),
  component: CadastrosPage,
});

type Cliente = {
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  tipo: string;
  status: string;
};
type Fornecedor = {
  razao: string;
  cnpj: string;
  ie: string;
  cidade: string;
};
type Colaborador = {
  nome: string;
  cargo: string;
  telefone: string;
  comissao: string;
};

const clientesIniciais: Cliente[] = [
  { nome: "Acme Global Ltd.", documento: "12.345.678/0001-90", telefone: "(11) 4002-8922", email: "compras@acme.com", tipo: "Revendedor", status: "Ativo" },
  { nome: "Maria Silva", documento: "123.456.789-00", telefone: "(11) 99876-5432", email: "maria@email.com", tipo: "Consumidor Final", status: "Ativo" },
  { nome: "Northwind Trading", documento: "98.765.432/0001-10", telefone: "(21) 3030-4040", email: "ops@northwind.com", tipo: "Revendedor", status: "Ativo" },
  { nome: "João Pereira", documento: "987.654.321-00", telefone: "(31) 98765-1122", email: "joao.p@email.com", tipo: "Consumidor Final", status: "Ativo" },
];

const fornecedoresIniciais: Fornecedor[] = [
  { razao: "Fornecedor Alpha S.A.", cnpj: "11.222.333/0001-44", ie: "123.456.789.110", cidade: "São Paulo / SP" },
  { razao: "Distribuidora Beta Ltda", cnpj: "22.333.444/0001-55", ie: "987.654.321.000", cidade: "Curitiba / PR" },
  { razao: "Logística Express ME", cnpj: "33.444.555/0001-66", ie: "ISENTO", cidade: "Belo Horizonte / MG" },
];

const colaboradoresIniciais: Colaborador[] = [
  { nome: "Marina Almeida", cargo: "Vendedora Sênior", telefone: "(11) 99111-2233", comissao: "5,0%" },
  { nome: "Lucas Costa", cargo: "Atendente", telefone: "(11) 98222-3344", comissao: "3,0%" },
  { nome: "Beatriz Santos", cargo: "Cabeleireira", telefone: "(11) 97333-4455", comissao: "40,0%" },
];

function CadastrosPage() {
  const [estoqueAtivo, setEstoqueAtivo] = useState(true);
  const [clientes, setClientes] = useState(clientesIniciais);
  const [fornecedores, setFornecedores] = useState(fornecedoresIniciais);
  const [colaboradores, setColaboradores] = useState(colaboradoresIniciais);
  const [openCliente, setOpenCliente] = useState(false);

  const colClientes: Column<Cliente>[] = [
    { key: "nome", header: "Nome" },
    { key: "documento", header: "CPF / CNPJ" },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "E-mail" },
    { key: "tipo", header: "Tipo" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  const colFornecedores: Column<Fornecedor>[] = [
    { key: "razao", header: "Razão Social" },
    { key: "cnpj", header: "CNPJ" },
    { key: "ie", header: "Inscrição Estadual" },
    { key: "cidade", header: "Cidade / UF" },
  ];
  const colColaboradores: Column<Colaborador>[] = [
    { key: "nome", header: "Nome" },
    { key: "cargo", header: "Cargo" },
    { key: "telefone", header: "Telefone" },
    { key: "comissao", header: "Comissão (%)", align: "right" },
  ];

  return (
    <AppShell
      title="Cadastros"
      subtitle="Clientes, fornecedores, colaboradores e preferências do sistema."
    >
      {/* Configurações do Sistema */}
      <div className="mb-5 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Configurações do Sistema
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-md p-1.5 ${
                estoqueAtivo ? "bg-gold/10 text-gold" : "bg-secondary text-muted-foreground"
              }`}
            >
              {estoqueAtivo ? <Package className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
            </div>
            <div>
              <Label htmlFor="toggle-estoque" className="text-sm font-medium">
                Ativar Controle de Estoque de Produtos
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {estoqueAtivo
                  ? "Empresa orientada a produtos — movimentação de estoque habilitada."
                  : "Empresa orientada a serviços — controle de estoque desabilitado."}
              </p>
            </div>
          </div>
          <Switch
            id="toggle-estoque"
            checked={estoqueAtivo}
            onCheckedChange={(v) => {
              setEstoqueAtivo(v);
              toast.success(
                v ? "Controle de estoque ativado" : "Modo Serviços ativado",
                {
                  description: v
                    ? "O sistema irá rastrear entradas, saídas e saldos."
                    : "O foco passa a ser serviços — estoque oculto nas vendas.",
                },
              );
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="colaboradores">Colaboradores / Profissionais</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-4">
          <DataTable
            title="Clientes"
            description="Base de clientes — consumidores finais e revendedores."
            columns={colClientes}
            data={clientes}
            filename="clientes"
            toolbar={
              <Dialog open={openCliente} onOpenChange={setOpenCliente}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Plus className="h-3.5 w-3.5" /> Novo Cliente
                  </Button>
                </DialogTrigger>
                <NovoClienteDialog
                  onSave={(c) => {
                    setClientes((p) => [...p, c]);
                    setOpenCliente(false);
                    toast.success("Cliente cadastrado", { description: c.nome });
                  }}
                />
              </Dialog>
            }
          />
        </TabsContent>

        <TabsContent value="fornecedores" className="mt-4">
          <DataTable
            title="Fornecedores"
            description="Parceiros e fornecedores cadastrados."
            columns={colFornecedores}
            data={fornecedores}
            filename="fornecedores"
            toolbar={
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  setFornecedores((p) => [
                    ...p,
                    { razao: "Novo Fornecedor", cnpj: "00.000.000/0001-00", ie: "ISENTO", cidade: "—" },
                  ]);
                  toast.success("Fornecedor adicionado");
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Novo Fornecedor
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="colaboradores" className="mt-4">
          <DataTable
            title="Colaboradores / Profissionais"
            description="Equipe e percentuais de comissão por profissional."
            columns={colColaboradores}
            data={colaboradores}
            filename="colaboradores"
            toolbar={
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  setColaboradores((p) => [
                    ...p,
                    { nome: "Novo Colaborador", cargo: "—", telefone: "—", comissao: "0,0%" },
                  ]);
                  toast.success("Colaborador adicionado");
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Novo Colaborador
              </Button>
            }
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function NovoClienteDialog({ onSave }: { onSave: (c: Cliente) => void }) {
  const [form, setForm] = useState<Cliente>({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    tipo: "Consumidor Final",
    status: "Ativo",
  });
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Novo Cliente</DialogTitle>
        <DialogDescription>Preencha os dados do cliente.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Nome / Razão Social</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">CPF / CNPJ</Label>
          <Input
            value={form.documento}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
              <SelectItem value="Revendedor">Revendedor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!form.nome || !form.documento}
          onClick={() => onSave(form)}
        >
          Salvar cliente
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}