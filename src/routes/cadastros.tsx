import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Plus, Settings2, Package, Briefcase, Loader2, MapPin, Building2 } from "lucide-react";
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
  fantasia?: string;
  cnpj: string;
  ie: string;
  cidade: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  telefone?: string;
  email?: string;
};
type Colaborador = {
  nome: string;
  cpf?: string;
  cargo: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
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
  const [estoqueAtivo, setEstoqueAtivo] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem("erp:estoqueAtivo");
    return v === null ? true : v === "true";
  });
  useEffect(() => {
    window.localStorage.setItem("erp:estoqueAtivo", String(estoqueAtivo));
    window.dispatchEvent(
      new CustomEvent("erp:estoque-toggle", { detail: { ativo: estoqueAtivo } }),
    );
  }, [estoqueAtivo]);
  const [clientes, setClientes] = useState(clientesIniciais);
  const [fornecedores, setFornecedores] = useState(fornecedoresIniciais);
  const [colaboradores, setColaboradores] = useState(colaboradoresIniciais);
  const [openCliente, setOpenCliente] = useState(false);
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [openColaborador, setOpenColaborador] = useState(false);

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
              <Dialog open={openFornecedor} onOpenChange={setOpenFornecedor}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Plus className="h-3.5 w-3.5" /> Novo Fornecedor
                  </Button>
                </DialogTrigger>
                <NovoFornecedorDialog
                  onSave={(f) => {
                    setFornecedores((p) => [...p, f]);
                    setOpenFornecedor(false);
                    toast.success("Fornecedor cadastrado", { description: f.razao });
                  }}
                />
              </Dialog>
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
              <Dialog open={openColaborador} onOpenChange={setOpenColaborador}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Plus className="h-3.5 w-3.5" /> Novo Colaborador
                  </Button>
                </DialogTrigger>
                <NovoColaboradorDialog
                  onSave={(c) => {
                    setColaboradores((p) => [...p, c]);
                    setOpenColaborador(false);
                    toast.success("Colaborador cadastrado", { description: c.nome });
                  }}
                />
              </Dialog>
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

function NovoColaboradorDialog({ onSave }: { onSave: (c: Colaborador) => void }) {
  const [form, setForm] = useState<Colaborador>({
    nome: "",
    cpf: "",
    cargo: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    telefone: "",
    comissao: "0,0%",
  });
  const [loadingCep, setLoadingCep] = useState(false);

  function formatCpf(s: string) {
    const d = onlyDigits(s).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  async function consultarCep() {
    const d = onlyDigits(form.cep ?? "");
    if (d.length !== 8) {
      toast.error("CEP inválido", { description: "Informe os 8 dígitos do CEP." });
      return;
    }
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
      } else {
        setForm((p) => ({
          ...p,
          endereco: [data.logradouro, data.bairro, data.localidade, data.uf]
            .filter(Boolean)
            .join(", "),
        }));
        toast.success("Endereço preenchido", { description: data.logradouro });
      }
    } catch {
      toast.error("Falha ao consultar ViaCEP");
    } finally {
      setLoadingCep(false);
    }
  }

  const canSave = form.nome.trim().length > 0;

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Novo Colaborador</DialogTitle>
        <DialogDescription>
          Cadastro de colaborador com integração ViaCEP para preenchimento automático do endereço.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Nome *</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">CPF</Label>
          <Input
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: formatCpf(e.target.value) })}
          />
        </div>

        <div className="col-span-6 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">CEP</Label>
          <div className="flex gap-2">
            <Input
              placeholder="00000-000"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: formatCep(e.target.value) })}
              onBlur={() => {
                if (onlyDigits(form.cep ?? "").length === 8) consultarCep();
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={consultarCep}
              disabled={loadingCep}
            >
              {loadingCep ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-4">
          <Label className="text-xs">Endereço</Label>
          <Input
            placeholder="Preenchido via ViaCEP"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          />
        </div>

        <div className="col-span-3 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Número</Label>
          <Input
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
          />
        </div>
        <div className="col-span-3 space-y-1.5 sm:col-span-4">
          <Label className="text-xs">Complemento</Label>
          <Input
            value={form.complemento}
            onChange={(e) => setForm({ ...form, complemento: e.target.value })}
          />
        </div>

        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Telefone</Label>
          <Input
            placeholder="(00) 00000-0000"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: formatTel(e.target.value) })}
          />
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Cargo</Label>
          <Input
            placeholder="Ex.: Vendedor, Cabeleireiro..."
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!canSave}
          onClick={() =>
            onSave({
              ...form,
              cargo: form.cargo || "—",
              telefone: form.telefone || "—",
            })
          }
        >
          Salvar colaborador
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}
function formatCnpj(s: string) {
  const d = onlyDigits(s).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
function formatCep(s: string) {
  const d = onlyDigits(s).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}
function formatTel(s: string) {
  const d = onlyDigits(s).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3");
}

function NovoFornecedorDialog({ onSave }: { onSave: (f: Fornecedor) => void }) {
  const [form, setForm] = useState<Fornecedor>({
    razao: "",
    fantasia: "",
    cnpj: "",
    ie: "",
    cidade: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    telefone: "",
    email: "",
  });
  const [loadingIe, setLoadingIe] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  async function consultarCnpj() {
    const d = onlyDigits(form.cnpj);
    if (d.length !== 14) {
      toast.error("CNPJ inválido", { description: "Informe os 14 dígitos do CNPJ." });
      return;
    }
    setLoadingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`);
      if (!res.ok) throw new Error("not ok");
      const data = await res.json();
      const endereco = [data.logradouro, data.bairro].filter(Boolean).join(", ");
      const cidade = [data.municipio, data.uf].filter(Boolean).join(" / ");
      const cep = data.cep ? formatCep(String(data.cep)) : form.cep;
      const telefone = data.ddd_telefone_1 ? formatTel(String(data.ddd_telefone_1)) : form.telefone;
      setForm((p) => ({
        ...p,
        razao: data.razao_social ?? p.razao,
        fantasia: data.nome_fantasia || p.fantasia,
        cep,
        endereco: endereco || p.endereco,
        numero: data.numero ? String(data.numero) : p.numero,
        complemento: data.complemento || p.complemento,
        cidade: cidade || p.cidade,
        telefone: telefone || p.telefone,
        email: data.email || p.email,
      }));
      toast.success("CNPJ encontrado", { description: data.razao_social });
    } catch {
      toast.error("Não foi possível consultar o CNPJ", {
        description: "Verifique o número ou tente novamente.",
      });
    } finally {
      setLoadingCnpj(false);
    }
  }

  async function consultarSefaz() {
    const d = onlyDigits(form.cnpj);
    if (d.length !== 14) {
      toast.error("CNPJ inválido", { description: "Informe os 14 dígitos do CNPJ." });
      return;
    }
    setLoadingIe(true);
    // Simulação da consulta SEFAZ — em produção integra-se ao SINTEGRA / SEFAZ estadual.
    await new Promise((r) => setTimeout(r, 900));
    const last = Number(d.slice(-1));
    const isento = last % 2 === 0;
    const ie = isento
      ? "ISENTO"
      : `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}`;
    setForm((p) => ({ ...p, ie }));
    setLoadingIe(false);
    toast.success("SEFAZ consultada", {
      description: isento ? "Empresa isenta de I.E." : `Inscrição encontrada: ${ie}`,
    });
  }

  async function consultarCep() {
    const d = onlyDigits(form.cep ?? "");
    if (d.length !== 8) {
      toast.error("CEP inválido", { description: "Informe os 8 dígitos do CEP." });
      return;
    }
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
      } else {
        setForm((p) => ({
          ...p,
          endereco: [data.logradouro, data.bairro].filter(Boolean).join(", "),
          cidade: `${data.localidade} / ${data.uf}`,
        }));
        toast.success("Endereço preenchido", { description: data.logradouro });
      }
    } catch {
      toast.error("Falha ao consultar ViaCEP");
    } finally {
      setLoadingCep(false);
    }
  }

  const canSave = form.razao.trim().length > 0 && onlyDigits(form.cnpj).length === 14;

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Novo Fornecedor</DialogTitle>
        <DialogDescription>
          Cadastro completo com integração SEFAZ (Inscrição Estadual) e ViaCEP (endereço).
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Razão Social *</Label>
          <Input
            value={form.razao}
            onChange={(e) => setForm({ ...form, razao: e.target.value })}
          />
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Nome Fantasia</Label>
          <Input
            value={form.fantasia}
            onChange={(e) => setForm({ ...form, fantasia: e.target.value })}
          />
        </div>

        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">CNPJ *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: formatCnpj(e.target.value) })}
              onBlur={() => {
                if (onlyDigits(form.cnpj).length === 14) consultarCnpj();
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={consultarCnpj}
              disabled={loadingCnpj}
              title="Preencher automaticamente via Receita Federal"
            >
              {loadingCnpj ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              Buscar
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Preenche automaticamente os demais campos via Receita Federal.
          </p>
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Inscrição Estadual</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Auto via SEFAZ"
              value={form.ie}
              onChange={(e) => setForm({ ...form, ie: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={consultarSefaz}
              disabled={loadingIe}
            >
              {loadingIe ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              SEFAZ
            </Button>
          </div>
        </div>

        <div className="col-span-6 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">CEP</Label>
          <div className="flex gap-2">
            <Input
              placeholder="00000-000"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: formatCep(e.target.value) })}
              onBlur={() => {
                if (onlyDigits(form.cep ?? "").length === 8) consultarCep();
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={consultarCep}
              disabled={loadingCep}
            >
              {loadingCep ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-4">
          <Label className="text-xs">Endereço</Label>
          <Input
            placeholder="Preenchido via ViaCEP"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          />
        </div>

        <div className="col-span-3 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Número</Label>
          <Input
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
          />
        </div>
        <div className="col-span-3 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Complemento</Label>
          <Input
            value={form.complemento}
            onChange={(e) => setForm({ ...form, complemento: e.target.value })}
          />
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Cidade / UF</Label>
          <Input
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          />
        </div>

        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Telefone (opcional)</Label>
          <Input
            placeholder="(00) 00000-0000"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: formatTel(e.target.value) })}
          />
        </div>
        <div className="col-span-6 space-y-1.5 sm:col-span-3">
          <Label className="text-xs">E-mail (opcional)</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!canSave}
          onClick={() =>
            onSave({
              ...form,
              ie: form.ie || "—",
              cidade: form.cidade || "—",
            })
          }
        >
          Salvar fornecedor
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}