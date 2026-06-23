import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Save, Trash2, Receipt, Building2, FileText, Layers, Calculator } from "lucide-react";
import { toast } from "sonner";
import {
  useEmpresaFiscal,
  usePerfisFiscaisCliente,
  useItensFiscais,
  useAliquotasPadrao,
  useNFConfig,
  type EmpresaFiscal,
  type PerfilFiscalCliente,
  type ItemFiscal,
  type AliquotasPadrao,
  type AliquotasPadraoOperacao,
  type NFConfig,
  type RegimeTributario,
  type TipoOperacao,
} from "@/lib/fiscal-store";

export const Route = createFileRoute("/fiscal")({
  head: () => ({
    meta: [
      { title: "Fiscal — Global ERP" },
      { name: "description", content: "Escopo tributário central: empresa, perfis de cliente, itens, alíquotas e NF." },
      { property: "og:title", content: "Fiscal — Global ERP" },
      { property: "og:description", content: "Cadastro tributário central que alimenta Vendas, Cadastros e Estoque." },
    ],
  }),
  component: FiscalPage,
});

function FiscalPage() {
  return (
    <AppShell
      title="Fiscal"
      subtitle="Escopo tributário central — alimenta Cadastros, Vendas e Estoque."
    >
      <Tabs defaultValue="empresa">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="empresa" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Empresa</TabsTrigger>
          <TabsTrigger value="perfis" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> Perfis de Cliente</TabsTrigger>
          <TabsTrigger value="itens" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Itens / Serviços</TabsTrigger>
          <TabsTrigger value="aliquotas" className="gap-1.5"><Calculator className="h-3.5 w-3.5" /> Alíquotas padrão</TabsTrigger>
          <TabsTrigger value="nf" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> NF-e / NFS-e</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-4"><EmpresaTab /></TabsContent>
        <TabsContent value="perfis" className="mt-4"><PerfisTab /></TabsContent>
        <TabsContent value="itens" className="mt-4"><ItensTab /></TabsContent>
        <TabsContent value="aliquotas" className="mt-4"><AliquotasTab /></TabsContent>
        <TabsContent value="nf" className="mt-4"><NFTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ─── Empresa ────────────────────────────────────────────────────────────────

function EmpresaTab() {
  const [empresa, setEmpresa] = useEmpresaFiscal();
  const [form, setForm] = useState<EmpresaFiscal>(empresa);
  const [cnaeNovo, setCnaeNovo] = useState("");
  const regimes: RegimeTributario[] = ["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI"];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">Dados da empresa emissora</h3>
        <p className="text-xs text-muted-foreground">
          Regime, CNAEs e identificação fiscal — base para a emissão de qualquer nota.
        </p>
      </div>
      <div className="grid grid-cols-6 gap-3 p-5">
        <Field label="Razão Social" cls="col-span-6 sm:col-span-4">
          <Input value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
        </Field>
        <Field label="Nome Fantasia" cls="col-span-6 sm:col-span-2">
          <Input value={form.fantasia} onChange={(e) => setForm({ ...form, fantasia: e.target.value })} />
        </Field>
        <Field label="CNPJ" cls="col-span-6 sm:col-span-3">
          <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
        </Field>
        <Field label="Inscrição Estadual" cls="col-span-3 sm:col-span-2">
          <Input value={form.ie} onChange={(e) => setForm({ ...form, ie: e.target.value })} />
        </Field>
        <Field label="Inscrição Municipal" cls="col-span-3 sm:col-span-1">
          <Input value={form.im} onChange={(e) => setForm({ ...form, im: e.target.value })} />
        </Field>

        <Field label="Regime Tributário" cls="col-span-6 sm:col-span-2">
          <Select value={form.regime} onValueChange={(v) => setForm({ ...form, regime: v as RegimeTributario })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {regimes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="CRT" cls="col-span-3 sm:col-span-1">
          <Select value={form.crt} onValueChange={(v) => setForm({ ...form, crt: v as EmpresaFiscal["crt"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 — Simples Nacional</SelectItem>
              <SelectItem value="2">2 — SN excesso sublimite</SelectItem>
              <SelectItem value="3">3 — Regime Normal</SelectItem>
              <SelectItem value="4">4 — MEI</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Regime de apuração" cls="col-span-3 sm:col-span-1">
          <Select value={form.regimeApuracao} onValueChange={(v) => setForm({ ...form, regimeApuracao: v as EmpresaFiscal["regimeApuracao"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="competencia">Competência</SelectItem>
              <SelectItem value="caixa">Caixa</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="UF" cls="col-span-2 sm:col-span-1">
          <Input value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })} />
        </Field>
        <Field label="Município" cls="col-span-4 sm:col-span-1">
          <Input value={form.municipio} onChange={(e) => setForm({ ...form, municipio: e.target.value })} />
        </Field>

        <Field label="CNAE Principal" cls="col-span-6 sm:col-span-3">
          <Input
            placeholder="Ex.: 4751-2/01"
            value={form.cnaePrincipal}
            onChange={(e) => setForm({ ...form, cnaePrincipal: e.target.value })}
          />
        </Field>
        <Field label="CNAEs Secundários" cls="col-span-6 sm:col-span-3">
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar CNAE"
              value={cnaeNovo}
              onChange={(e) => setCnaeNovo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cnaeNovo.trim()) {
                  setForm({ ...form, cnaesSecundarios: [...form.cnaesSecundarios, cnaeNovo.trim()] });
                  setCnaeNovo("");
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => {
                if (!cnaeNovo.trim()) return;
                setForm({ ...form, cnaesSecundarios: [...form.cnaesSecundarios, cnaeNovo.trim()] });
                setCnaeNovo("");
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {form.cnaesSecundarios.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.cnaesSecundarios.map((c, i) => (
                <Badge key={`${c}-${i}`} variant="secondary" className="gap-1.5">
                  {c}
                  <button
                    onClick={() => setForm({ ...form, cnaesSecundarios: form.cnaesSecundarios.filter((_, idx) => idx !== i) })}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Field>
      </div>
      <div className="flex justify-end border-t border-border px-5 py-3">
        <Button
          size="sm"
          className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => {
            setEmpresa(form);
            toast.success("Dados da empresa salvos");
          }}
        >
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// ─── Perfis de Cliente ──────────────────────────────────────────────────────

function PerfisTab() {
  const [perfis, setPerfis] = usePerfisFiscaisCliente();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<PerfilFiscalCliente | null>(null);

  const cols: Column<PerfilFiscalCliente>[] = [
    { key: "nome", header: "Perfil" },
    {
      key: "contribuinteIcms",
      header: "Contribuinte ICMS",
      render: (r) => <span className="capitalize">{r.contribuinteIcms}</span>,
    },
    { key: "cfopDentroUF", header: "CFOP intra" },
    { key: "cfopForaUF", header: "CFOP inter" },
    {
      key: "retencoes",
      header: "Retenções",
      render: (r) => {
        const ativas = Object.entries(r.retencoes).filter(([, v]) => v).map(([k]) => k.toUpperCase());
        return ativas.length ? (
          <div className="flex flex-wrap gap-1">
            {ativas.map((x) => <Badge key={x} variant="outline" className="text-[10px]">{x}</Badge>)}
          </div>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditando(r); setOpen(true); }}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-muted-foreground hover:text-destructive"
            onClick={() => setPerfis((p) => p.filter((x) => x.id !== r.id))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Perfis fiscais de cliente"
      description="Biblioteca reutilizável aplicada no cadastro de clientes."
      columns={cols}
      data={perfis}
      filename="perfis-fiscais"
      toolbar={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditando(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-3.5 w-3.5" /> Novo perfil
            </Button>
          </DialogTrigger>
          <PerfilDialog
            inicial={editando}
            onSave={(p) => {
              setPerfis((prev) => {
                const exists = prev.some((x) => x.id === p.id);
                return exists ? prev.map((x) => x.id === p.id ? p : x) : [p, ...prev];
              });
              setOpen(false);
              setEditando(null);
              toast.success("Perfil fiscal salvo", { description: p.nome });
            }}
          />
        </Dialog>
      }
    />
  );
}

function PerfilDialog({ inicial, onSave }: { inicial: PerfilFiscalCliente | null; onSave: (p: PerfilFiscalCliente) => void }) {
  const [f, setF] = useState<PerfilFiscalCliente>(
    inicial ?? {
      id: `pf-${Date.now()}`,
      nome: "",
      contribuinteIcms: "nao",
      indicadorIe: "nao_contribuinte",
      suframa: false,
      cfopDentroUF: "5102",
      cfopForaUF: "6108",
      retencoes: { irrf: false, csll: false, pis: false, cofins: false, iss: false, inss: false },
      observacoesNF: "",
    },
  );
  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{inicial ? "Editar perfil fiscal" : "Novo perfil fiscal"}</DialogTitle>
        <DialogDescription>Aplicável a clientes com tributação semelhante.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-6 gap-3">
        <Field label="Nome do perfil" cls="col-span-6">
          <Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        </Field>
        <Field label="Contribuinte ICMS" cls="col-span-3 sm:col-span-2">
          <Select value={f.contribuinteIcms} onValueChange={(v) => setF({ ...f, contribuinteIcms: v as PerfilFiscalCliente["contribuinteIcms"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
              <SelectItem value="isento">Isento</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Indicador de IE" cls="col-span-3 sm:col-span-2">
          <Select value={f.indicadorIe} onValueChange={(v) => setF({ ...f, indicadorIe: v as PerfilFiscalCliente["indicadorIe"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contribuinte">1 — Contribuinte</SelectItem>
              <SelectItem value="isento">2 — Isento</SelectItem>
              <SelectItem value="nao_contribuinte">9 — Não contribuinte</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Suframa" cls="col-span-6 sm:col-span-2">
          <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3">
            <Switch checked={f.suframa} onCheckedChange={(v) => setF({ ...f, suframa: v })} />
            <span className="text-xs text-muted-foreground">Cliente Suframa</span>
          </div>
        </Field>
        <Field label="CFOP dentro UF" cls="col-span-3">
          <Input value={f.cfopDentroUF} onChange={(e) => setF({ ...f, cfopDentroUF: e.target.value })} />
        </Field>
        <Field label="CFOP fora UF" cls="col-span-3">
          <Input value={f.cfopForaUF} onChange={(e) => setF({ ...f, cfopForaUF: e.target.value })} />
        </Field>
        <div className="col-span-6">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Retenções aplicáveis</Label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(f.retencoes) as (keyof PerfilFiscalCliente["retencoes"])[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                <Switch
                  checked={f.retencoes[k]}
                  onCheckedChange={(v) => setF({ ...f, retencoes: { ...f.retencoes, [k]: v } })}
                />
                <span className="font-medium uppercase">{k}</span>
              </label>
            ))}
          </div>
        </div>
        <Field label="Observações da NF" cls="col-span-6">
          <Textarea
            rows={2}
            value={f.observacoesNF}
            onChange={(e) => setF({ ...f, observacoesNF: e.target.value })}
          />
        </Field>
      </div>
      <DialogFooter>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!f.nome.trim()}
          onClick={() => onSave(f)}
        >
          Salvar perfil
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Itens / Serviços ───────────────────────────────────────────────────────

function ItensTab() {
  const [itens, setItens] = useItensFiscais();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<ItemFiscal | null>(null);

  const cols: Column<ItemFiscal>[] = [
    { key: "sku", header: "SKU" },
    { key: "nome", header: "Descrição" },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline" className="capitalize">{r.tipo}</Badge> },
    { key: "ncm", header: "NCM / Serviço", render: (r) => r.ncm ?? r.codigoServicoLC116 ?? "—" },
    { key: "cstCsosn", header: "CST/CSOSN" },
    {
      key: "preco",
      header: "Preço",
      align: "right",
      render: (r) => r.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditando(r); setOpen(true); }}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-muted-foreground hover:text-destructive"
            onClick={() => setItens((p) => p.filter((x) => x.id !== r.id))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Itens e serviços fiscais"
      description="Base única consumida por Estoque e Vendas — NCM, CST, alíquotas próprias."
      columns={cols}
      data={itens}
      filename="itens-fiscais"
      toolbar={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditando(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-3.5 w-3.5" /> Novo item / serviço
            </Button>
          </DialogTrigger>
          <ItemDialog
            inicial={editando}
            onSave={(it) => {
              setItens((prev) => {
                const exists = prev.some((x) => x.id === it.id);
                return exists ? prev.map((x) => x.id === it.id ? it : x) : [it, ...prev];
              });
              setOpen(false);
              setEditando(null);
              toast.success("Item fiscal salvo", { description: it.nome });
            }}
          />
        </Dialog>
      }
    />
  );
}

function ItemDialog({ inicial, onSave }: { inicial: ItemFiscal | null; onSave: (i: ItemFiscal) => void }) {
  const [f, setF] = useState<ItemFiscal>(
    inicial ?? {
      id: `if-${Date.now()}`,
      tipo: "produto",
      sku: "",
      nome: "",
      unidade: "un",
      preco: 0,
      ncm: "",
      cest: "",
      origem: "0",
      cstCsosn: "102",
      aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
    },
  );

  const isServico = f.tipo === "servico";

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{inicial ? "Editar item fiscal" : "Novo item / serviço"}</DialogTitle>
        <DialogDescription>Cadastro completo — base tributária para emissão de notas.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-6 gap-3">
        <Field label="Tipo" cls="col-span-2">
          <Select value={f.tipo} onValueChange={(v) => setF({ ...f, tipo: v as ItemFiscal["tipo"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="SKU / Código" cls="col-span-2">
          <Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} />
        </Field>
        <Field label="Unidade" cls="col-span-2">
          <Input value={f.unidade} onChange={(e) => setF({ ...f, unidade: e.target.value })} />
        </Field>
        <Field label="Descrição" cls="col-span-6">
          <Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        </Field>
        <Field label="Preço (R$)" cls="col-span-2">
          <Input
            type="number"
            step="0.01"
            value={f.preco}
            onChange={(e) => setF({ ...f, preco: Number(e.target.value) })}
          />
        </Field>
        {!isServico ? (
          <>
            <Field label="NCM" cls="col-span-2">
              <Input value={f.ncm ?? ""} onChange={(e) => setF({ ...f, ncm: e.target.value })} />
            </Field>
            <Field label="CEST" cls="col-span-2">
              <Input value={f.cest ?? ""} onChange={(e) => setF({ ...f, cest: e.target.value })} />
            </Field>
          </>
        ) : (
          <Field label="Código serviço (LC 116)" cls="col-span-4">
            <Input
              value={f.codigoServicoLC116 ?? ""}
              onChange={(e) => setF({ ...f, codigoServicoLC116: e.target.value })}
            />
          </Field>
        )}
        <Field label="Origem" cls="col-span-2">
          <Select value={f.origem} onValueChange={(v) => setF({ ...f, origem: v as ItemFiscal["origem"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["0","1","2","3","4","5","6","7","8"].map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="CST / CSOSN" cls="col-span-2">
          <Input value={f.cstCsosn} onChange={(e) => setF({ ...f, cstCsosn: e.target.value })} />
        </Field>
        <Field label="Benefício fiscal" cls="col-span-2">
          <Input
            placeholder="Opcional"
            value={f.beneficioFiscal ?? ""}
            onChange={(e) => setF({ ...f, beneficioFiscal: e.target.value })}
          />
        </Field>
        <div className="col-span-6 mt-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Alíquotas próprias (%)</Label>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {(Object.keys(f.aliquotas) as (keyof ItemFiscal["aliquotas"])[]).map((k) => (
              <div key={k} className="space-y-1">
                <Label className="text-[10px] uppercase">{k}</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8 text-right tabular-nums"
                  value={f.aliquotas[k]}
                  onChange={(e) => setF({ ...f, aliquotas: { ...f.aliquotas, [k]: Number(e.target.value) } })}
                />
              </div>
            ))}
          </div>
        </div>
        {!isServico && (
          <>
            <Field label="Peso (kg)" cls="col-span-3">
              <Input
                type="number"
                step="0.001"
                value={f.peso ?? 0}
                onChange={(e) => setF({ ...f, peso: Number(e.target.value) })}
              />
            </Field>
            <Field label="Volume (m³)" cls="col-span-3">
              <Input
                type="number"
                step="0.001"
                value={f.volume ?? 0}
                onChange={(e) => setF({ ...f, volume: Number(e.target.value) })}
              />
            </Field>
          </>
        )}
      </div>
      <DialogFooter>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!f.sku.trim() || !f.nome.trim()}
          onClick={() => onSave(f)}
        >
          Salvar item
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Alíquotas padrão ───────────────────────────────────────────────────────

function AliquotasTab() {
  const [aliquotas, setAliquotas] = useAliquotasPadrao();
  const [draft, setDraft] = useState<AliquotasPadrao>(aliquotas);
  const campos: (keyof AliquotasPadraoOperacao)[] = ["cbs", "ibs", "is", "irrf", "csll", "pis", "cofins", "iss"];
  const labels: Record<keyof AliquotasPadraoOperacao, string> = {
    cbs: "CBS", ibs: "IBS", is: "IS", irrf: "IRRF", csll: "CSLL", pis: "PIS", cofins: "COFINS", iss: "ISS",
  };
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">Alíquotas padrão por tipo de operação</h3>
        <p className="text-xs text-muted-foreground">
          Fallback usado quando o item ou o perfil do cliente não trazem a alíquota explícita. Já cobre CBS/IBS/IS da reforma tributária.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        {(["produto", "servico"] as TipoOperacao[]).map((t) => (
          <div key={t} className="rounded-md border border-border p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t === "produto" ? "Produto (revenda)" : "Serviço"}
            </div>
            <div className="space-y-2.5">
              {campos.map((k) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <Label className="text-xs font-medium">{labels[k]}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    className="h-8 w-28 text-right tabular-nums"
                    value={draft[t][k]}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, [t]: { ...p[t], [k]: Number(e.target.value) } }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border px-5 py-3">
        <Button
          size="sm"
          className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => {
            setAliquotas(draft);
            toast.success("Alíquotas padrão atualizadas");
          }}
        >
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// ─── NF-e / NFS-e ───────────────────────────────────────────────────────────

function NFTab() {
  const [nf, setNF] = useNFConfig();
  const [draft, setDraft] = useState<NFConfig>(nf);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">Numeração e ambiente de emissão</h3>
        <p className="text-xs text-muted-foreground">
          Define modelo, série e próximo número da nota. A integração real com SEFAZ entra depois.
        </p>
      </div>
      <div className="grid grid-cols-6 gap-3 p-5">
        <Field label="Modelo" cls="col-span-2">
          <Select value={draft.modelo} onValueChange={(v) => setDraft({ ...draft, modelo: v as NFConfig["modelo"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="55">55 — NF-e</SelectItem>
              <SelectItem value="65">65 — NFC-e</SelectItem>
              <SelectItem value="NFS-e">NFS-e (serviço)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ambiente" cls="col-span-2">
          <Select value={draft.ambiente} onValueChange={(v) => setDraft({ ...draft, ambiente: v as NFConfig["ambiente"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="homologacao">Homologação</SelectItem>
              <SelectItem value="producao">Produção</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Série" cls="col-span-1">
          <Input
            type="number"
            min={1}
            value={draft.serie}
            onChange={(e) => setDraft({ ...draft, serie: Math.max(1, Number(e.target.value)) })}
          />
        </Field>
        <Field label="Próximo número" cls="col-span-1">
          <Input
            type="number"
            min={1}
            value={draft.proximoNumero}
            onChange={(e) => setDraft({ ...draft, proximoNumero: Math.max(1, Number(e.target.value)) })}
          />
        </Field>
        <Field label="CSC ID (NFC-e)" cls="col-span-3">
          <Input value={draft.cscId ?? ""} onChange={(e) => setDraft({ ...draft, cscId: e.target.value })} />
        </Field>
        <Field label="CSC Token" cls="col-span-3">
          <Input
            type="password"
            value={draft.csc ?? ""}
            onChange={(e) => setDraft({ ...draft, csc: e.target.value })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="text-xs text-muted-foreground">
          Próxima nota emitida: <span className="font-medium text-foreground">
            {draft.modelo === "NFS-e" ? "NFS-e" : `NF-${draft.modelo}`}-{String(draft.serie).padStart(3, "0")}-{String(draft.proximoNumero).padStart(6, "0")}
          </span>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => {
            setNF(draft);
            toast.success("Configuração de NF salva");
          }}
        >
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// ─── helper ─────────────────────────────────────────────────────────────────

function Field({ label, cls, children }: { label: string; cls?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${cls ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
