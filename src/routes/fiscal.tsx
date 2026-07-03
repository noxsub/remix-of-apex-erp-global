import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
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
import {
  Plus,
  Save,
  Trash2,
  Receipt,
  Building2,
  FileText,
  Layers,
  Calculator,
  Sparkles,
  Upload,
  Download,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import {
  useEmpresaFiscal,
  usePerfisFiscaisCliente,
  useItensFiscais,
  useAliquotasPadrao,
  useNFConfig,
  useApuracaoConfig,
  useCodigosServico,
  sugerirCodigosServicoPorCNAEs,
  entradaDefault,
  saidaDefault,
  type EmpresaFiscal,
  type CnaeRecord,
  type PerfilFiscalCliente,
  type ItemFiscal,
  type AliquotasPadrao,
  type AliquotasPadraoOperacao,
  type NFConfig,
  type RegimeTributario,
  type TipoOperacao,
  type ApuracaoConfig,
  type CodigoServico,
} from "@/lib/fiscal-store";
import { useFaturados } from "@/lib/erp-store";
import { downloadTemplateXlsx, parseItensXlsx } from "@/lib/xlsx-template";

export const Route = createFileRoute("/fiscal")({
  head: () => ({
    meta: [
      { title: "Fiscal — Global ERP" },
      { name: "description", content: "Escopo tributário central: empresa, CNAE, IRPJ/CSLL, itens e NF." },
      { property: "og:title", content: "Fiscal — Global ERP" },
      { property: "og:description", content: "Cadastro tributário central com apuração IRPJ/CSLL." },
    ],
  }),
  component: FiscalPage,
});

function FiscalPage() {
  return (
    <AppShell
      title="Fiscal"
      subtitle="Escopo tributário central — perfis de cliente, CNAEs, IRPJ/CSLL e itens. Dados da empresa agora ficam em Cadastros."
    >
      <Tabs defaultValue="perfis">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="perfis" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> Perfis de Cliente</TabsTrigger>
          <TabsTrigger value="itens" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Itens / Serviços</TabsTrigger>
          <TabsTrigger value="aliquotas" className="gap-1.5"><Calculator className="h-3.5 w-3.5" /> Alíquotas padrão</TabsTrigger>
          <TabsTrigger value="irpj" className="gap-1.5"><Coins className="h-3.5 w-3.5" /> IRPJ / CSLL</TabsTrigger>
          <TabsTrigger value="nf" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> NF-e / NFS-e</TabsTrigger>
        </TabsList>

        <TabsContent value="perfis" className="mt-4"><PerfisTab /></TabsContent>
        <TabsContent value="itens" className="mt-4"><ItensTab /></TabsContent>
        <TabsContent value="aliquotas" className="mt-4"><AliquotasTab /></TabsContent>
        <TabsContent value="irpj" className="mt-4"><IrpjCsllTab /></TabsContent>
        <TabsContent value="nf" className="mt-4"><NFTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}


function PerfisTab() {
  const [perfis, setPerfis] = usePerfisFiscaisCliente();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<PerfilFiscalCliente | null>(null);

  const cols: Column<PerfilFiscalCliente>[] = [
    { key: "nome", header: "Perfil" },
    { key: "contribuinteIcms", header: "Contribuinte ICMS", render: (r) => <span className="capitalize">{r.contribuinteIcms}</span> },
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
      key: "id", header: "", align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditando(r); setOpen(true); }}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-muted-foreground hover:text-destructive"
            onClick={() => setPerfis((p) => p.filter((x) => x.id !== r.id))}>
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
          <Textarea rows={2} value={f.observacoesNF} onChange={(e) => setF({ ...f, observacoesNF: e.target.value })} />
        </Field>
      </div>
      <DialogFooter>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!f.nome.trim()} onClick={() => onSave(f)}>
          Salvar perfil
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Itens / Serviços ───────────────────────────────────────────────────────

function ItensTab() {
  const [itens, setItens] = useItensFiscais();
  const [empresa] = useEmpresaFiscal();
  const [codigos, setCodigos] = useCodigosServico();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<ItemFiscal | null>(null);
  const [iaPreview, setIaPreview] = useState<CodigoServico[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function executarSugestaoIA() {
    const cnaes = empresa.cnaes.length
      ? empresa.cnaes.map((c) => c.codigo)
      : [empresa.cnaePrincipal, ...empresa.cnaesSecundarios].filter(Boolean);
    if (!cnaes.length) {
      toast.error("Cadastre ao menos um CNAE na aba Empresa para a sugestão.");
      return;
    }
    const sugestoes = sugerirCodigosServicoPorCNAEs(cnaes);
    if (!sugestoes.length) {
      toast.warning("Nenhuma sugestão encontrada para os CNAEs informados.");
      return;
    }
    setIaPreview(sugestoes);
  }

  async function importarXlsx(file: File) {
    const { itens: novos, erros } = await parseItensXlsx(file);
    if (erros.length) {
      toast.error(`${erros.length} linha(s) com erro`, {
        description: erros.slice(0, 3).map((e) => `Linha ${e.linha}: ${e.mensagem}`).join("; "),
      });
    }
    if (novos.length) {
      setItens((prev) => {
        const map = new Map(prev.map((i) => [i.sku, i]));
        novos.forEach((n) => map.set(n.sku, { ...map.get(n.sku), ...n, id: map.get(n.sku)?.id ?? n.id }));
        return Array.from(map.values());
      });
      toast.success(`${novos.length} item(ns) importado(s)`);
    }
  }

  const cols: Column<ItemFiscal>[] = [
    { key: "sku", header: "SKU" },
    { key: "nome", header: "Descrição" },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline" className="capitalize">{r.tipo}</Badge> },
    { key: "ncm", header: "NCM / Serviço", render: (r) => r.ncm ?? r.codigoServicoLC116 ?? "—" },
    { key: "cstCsosn", header: "CST/CSOSN" },
    { key: "estoqueAtual", header: "Estoque", align: "right", render: (r) => r.estoqueAtual ?? "—" },
    {
      key: "preco", header: "Preço", align: "right",
      render: (r) => r.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "id", header: "", align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditando(r); setOpen(true); }}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-muted-foreground hover:text-destructive"
            onClick={() => setItens((p) => p.filter((x) => x.id !== r.id))}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar de import / IA */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex-1 text-xs text-muted-foreground">
          Cadastre itens e serviços fiscais — esta é a base única para Estoque, Vendas e Entradas.
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void importarXlsx(f); e.target.value = ""; }}
        />
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => downloadTemplateXlsx()}>
          <Download className="h-3.5 w-3.5" /> Modelo XLSX
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> Importar estoque
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={executarSugestaoIA}>
          <Sparkles className="h-3.5 w-3.5" /> Sugerir códigos de serviço (IA)
        </Button>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditando(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-3.5 w-3.5" /> Novo item / serviço
            </Button>
          </DialogTrigger>
          <ItemDialog
            inicial={editando}
            codigosServico={codigos}
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
      </div>

      {codigos.length > 0 && (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Biblioteca de códigos de serviço (LC 116)
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
              onClick={() => setCodigos([])}>Limpar</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {codigos.map((c) => (
              <Badge key={c.codigo} variant="secondary" className="gap-1">
                {c.codigo} · {c.descricao} <span className="text-muted-foreground">({c.issSugerido}%)</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <DataTable
        title="Itens e serviços fiscais"
        description="Base única consumida por Estoque, Vendas e Entradas."
        columns={cols}
        data={itens}
        filename="itens-fiscais"
      />

      {/* Modal preview da sugestão IA */}
      <Dialog open={iaPreview !== null} onOpenChange={(v) => !v && setIaPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Códigos de serviço sugeridos
            </DialogTitle>
            <DialogDescription>
              Sugestões assimiladas a partir dos CNAEs cadastrados. Aceite os que se aplicam.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Código LC 116</th>
                  <th className="px-3 py-2 text-left">Descrição</th>
                  <th className="px-3 py-2 text-left">CNAE</th>
                  <th className="px-3 py-2 text-right">ISS sugerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {iaPreview?.map((c) => (
                  <tr key={c.codigo}>
                    <td className="px-3 py-2 font-mono text-xs">{c.codigo}</td>
                    <td className="px-3 py-2 text-xs">{c.descricao}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{c.cnaeRelacionado ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums">{c.issSugerido}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIaPreview(null)}>Cancelar</Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => {
                if (!iaPreview) return;
                setCodigos((prev) => {
                  const map = new Map(prev.map((c) => [c.codigo, c]));
                  iaPreview.forEach((c) => map.set(c.codigo, c));
                  return Array.from(map.values());
                });
                toast.success(`${iaPreview.length} código(s) adicionado(s) à biblioteca`);
                setIaPreview(null);
              }}>
              Adicionar à biblioteca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemDialog({
  inicial,
  codigosServico,
  onSave,
}: {
  inicial: ItemFiscal | null;
  codigosServico: CodigoServico[];
  onSave: (i: ItemFiscal) => void;
}) {
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
      entrada: entradaDefault,
      saida: saidaDefault,
    },
  );
  const isServico = f.tipo === "servico";

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{inicial ? "Editar item fiscal" : "Novo item / serviço"}</DialogTitle>
        <DialogDescription>
          Tributação, dados de entrada e saída. Pré-preenchido para futura importação de XML NF-e 55.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados fiscais</TabsTrigger>
          <TabsTrigger value="entrada">Entrada</TabsTrigger>
          <TabsTrigger value="saida">Saída</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-3">
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
              <Input type="number" step="0.01" value={f.preco}
                onChange={(e) => setF({ ...f, preco: Number(e.target.value) })} />
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
                {codigosServico.length > 0 ? (
                  <Select value={f.codigoServicoLC116 ?? ""}
                    onValueChange={(v) => {
                      const c = codigosServico.find((x) => x.codigo === v);
                      setF({
                        ...f,
                        codigoServicoLC116: v,
                        aliquotas: c ? { ...f.aliquotas, iss: c.issSugerido } : f.aliquotas,
                      });
                    }}>
                    <SelectTrigger><SelectValue placeholder="Selecionar da biblioteca" /></SelectTrigger>
                    <SelectContent>
                      {codigosServico.map((c) => (
                        <SelectItem key={c.codigo} value={c.codigo}>
                          {c.codigo} — {c.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={f.codigoServicoLC116 ?? ""}
                    onChange={(e) => setF({ ...f, codigoServicoLC116: e.target.value })} />
                )}
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
              <Input placeholder="Opcional" value={f.beneficioFiscal ?? ""}
                onChange={(e) => setF({ ...f, beneficioFiscal: e.target.value })} />
            </Field>
            <div className="col-span-6 mt-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Alíquotas próprias (%)</Label>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {(Object.keys(f.aliquotas) as (keyof ItemFiscal["aliquotas"])[]).map((k) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-[10px] uppercase">{k}</Label>
                    <Input type="number" step="0.01" className="h-8 text-right tabular-nums"
                      value={f.aliquotas[k]}
                      onChange={(e) => setF({ ...f, aliquotas: { ...f.aliquotas, [k]: Number(e.target.value) } })} />
                  </div>
                ))}
              </div>
            </div>
            {!isServico && (
              <>
                <Field label="Peso (kg)" cls="col-span-2">
                  <Input type="number" step="0.001" value={f.peso ?? 0}
                    onChange={(e) => setF({ ...f, peso: Number(e.target.value) })} />
                </Field>
                <Field label="Volume (m³)" cls="col-span-2">
                  <Input type="number" step="0.001" value={f.volume ?? 0}
                    onChange={(e) => setF({ ...f, volume: Number(e.target.value) })} />
                </Field>
                <Field label="Custo médio (R$)" cls="col-span-2">
                  <Input type="number" step="0.01" value={f.custoMedio ?? 0}
                    onChange={(e) => setF({ ...f, custoMedio: Number(e.target.value) })} />
                </Field>
                <Field label="Estoque atual" cls="col-span-3">
                  <Input type="number" value={f.estoqueAtual ?? 0}
                    onChange={(e) => setF({ ...f, estoqueAtual: Number(e.target.value) })} />
                </Field>
                <Field label="Estoque mínimo" cls="col-span-3">
                  <Input type="number" value={f.estoqueMinimo ?? 0}
                    onChange={(e) => setF({ ...f, estoqueMinimo: Number(e.target.value) })} />
                </Field>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="entrada" className="mt-3">
          <p className="mb-3 text-xs text-muted-foreground">
            Configuração usada na importação de NF-e modelo 55 (módulo de Entradas).
          </p>
          <div className="grid grid-cols-6 gap-3">
            <Field label="CFOP de entrada" cls="col-span-2">
              <Input value={f.entrada?.cfopEntrada ?? ""}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), cfopEntrada: e.target.value } })} />
            </Field>
            <Field label="CST entrada" cls="col-span-2">
              <Input value={f.entrada?.cstEntrada ?? ""}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), cstEntrada: e.target.value } })} />
            </Field>
            <Field label="Origem do custo" cls="col-span-2">
              <Select value={f.entrada?.origemCusto ?? "media"}
                onValueChange={(v) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), origemCusto: v as "media" | "ultima" } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="media">Custo médio</SelectItem>
                  <SelectItem value="ultima">Última entrada</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Crédito ICMS (%)" cls="col-span-2">
              <Input type="number" step="0.01" value={f.entrada?.creditoIcms ?? 0}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), creditoIcms: Number(e.target.value) } })} />
            </Field>
            <Field label="Crédito PIS (%)" cls="col-span-2">
              <Input type="number" step="0.01" value={f.entrada?.creditoPis ?? 0}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), creditoPis: Number(e.target.value) } })} />
            </Field>
            <Field label="Crédito COFINS (%)" cls="col-span-2">
              <Input type="number" step="0.01" value={f.entrada?.creditoCofins ?? 0}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), creditoCofins: Number(e.target.value) } })} />
            </Field>
            <Field label="Crédito IPI (%)" cls="col-span-2">
              <Input type="number" step="0.01" value={f.entrada?.creditoIpi ?? 0}
                onChange={(e) => setF({ ...f, entrada: { ...(f.entrada ?? entradaDefault), creditoIpi: Number(e.target.value) } })} />
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="saida" className="mt-3">
          <p className="mb-3 text-xs text-muted-foreground">
            CFOPs e CST aplicados ao emitir uma nota de saída deste item.
          </p>
          <div className="grid grid-cols-6 gap-3">
            <Field label="CFOP dentro UF" cls="col-span-2">
              <Input value={f.saida?.cfopDentroUF ?? ""}
                onChange={(e) => setF({ ...f, saida: { ...(f.saida ?? saidaDefault), cfopDentroUF: e.target.value } })} />
            </Field>
            <Field label="CFOP fora UF" cls="col-span-2">
              <Input value={f.saida?.cfopForaUF ?? ""}
                onChange={(e) => setF({ ...f, saida: { ...(f.saida ?? saidaDefault), cfopForaUF: e.target.value } })} />
            </Field>
            <Field label="CST de saída" cls="col-span-2">
              <Input value={f.saida?.cstSaida ?? ""}
                onChange={(e) => setF({ ...f, saida: { ...(f.saida ?? saidaDefault), cstSaida: e.target.value } })} />
            </Field>
            <Field label="Margem padrão (%)" cls="col-span-2">
              <Input type="number" step="0.01" value={f.saida?.margemPadrao ?? 0}
                onChange={(e) => setF({ ...f, saida: { ...(f.saida ?? saidaDefault), margemPadrao: Number(e.target.value) } })} />
            </Field>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!f.sku.trim() || !f.nome.trim()}
          onClick={() => onSave(f)}>
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
          Fallback quando o item ou o perfil do cliente não trazem a alíquota explícita.
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
                  <Input type="number" step="0.01" min={0}
                    className="h-8 w-28 text-right tabular-nums"
                    value={draft[t][k]}
                    onChange={(e) => setDraft((p) => ({ ...p, [t]: { ...p[t], [k]: Number(e.target.value) } }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border px-5 py-3">
        <Button size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => { setAliquotas(draft); toast.success("Alíquotas padrão atualizadas"); }}>
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

// ─── IRPJ / CSLL ────────────────────────────────────────────────────────────

function IrpjCsllTab() {
  const [cfg, setCfg] = useApuracaoConfig();
  const [draft, setDraft] = useState<ApuracaoConfig>(cfg);
  const [faturados] = useFaturados();
  const [itens] = useItensFiscais();

  // Calcula apuração agregada do período (todas as faturas em memória).
  const apuracao = useMemo(() => {
    let receitaProduto = 0;
    let receitaServico = 0;
    for (const f of faturados) {
      // Heurística: sem amarração item-NF, considera tudo produto (padrão atual de vendas).
      // Quando vendas guardarem itemFiscalId, dividir por tipo será exato.
      receitaProduto += f.total;
    }
    const baseIRPJ =
      receitaProduto * (draft.presuncaoIRPJ.produto / 100) +
      receitaServico * (draft.presuncaoIRPJ.servico / 100);
    const baseCSLL =
      receitaProduto * (draft.presuncaoCSLL.produto / 100) +
      receitaServico * (draft.presuncaoCSLL.servico / 100);
    const irpjBase = baseIRPJ * (draft.aliquotaIRPJ / 100);
    // Adicional: 10% sobre o que ultrapassar limite x meses (assume 3 meses se trimestral)
    const meses = draft.periodicidade === "trimestral" ? 3 : 12;
    const limite = draft.limiteAdicionalMensal * meses;
    const adicional = Math.max(0, baseIRPJ - limite) * (draft.adicionalIRPJ / 100);
    const irpjTotal = irpjBase + adicional;
    const csll = baseCSLL * (draft.aliquotaCSLL / 100);
    return {
      receitaProduto, receitaServico,
      receitaTotal: receitaProduto + receitaServico,
      baseIRPJ, baseCSLL,
      irpjBase, adicional, irpjTotal, csll,
      total: irpjTotal + csll,
    };
  }, [faturados, draft, itens]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold tracking-tight">Parâmetros de apuração</h3>
          <p className="text-xs text-muted-foreground">
            Presunção por atividade, alíquotas IRPJ/CSLL e adicional sobre o lucro presumido.
          </p>
        </div>
        <div className="grid grid-cols-6 gap-3 p-5">
          <Field label="Regime" cls="col-span-2">
            <Select value={draft.regime} onValueChange={(v) => setDraft({ ...draft, regime: v as RegimeTributario })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Periodicidade" cls="col-span-2">
            <Select value={draft.periodicidade}
              onValueChange={(v) => setDraft({ ...draft, periodicidade: v as ApuracaoConfig["periodicidade"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Limite adicional mensal (R$)" cls="col-span-2">
            <Input type="number" value={draft.limiteAdicionalMensal}
              onChange={(e) => setDraft({ ...draft, limiteAdicionalMensal: Number(e.target.value) })} />
          </Field>

          <Field label="Presunção IRPJ — Produto (%)" cls="col-span-3">
            <Input type="number" step="0.01" value={draft.presuncaoIRPJ.produto}
              onChange={(e) => setDraft({ ...draft, presuncaoIRPJ: { ...draft.presuncaoIRPJ, produto: Number(e.target.value) } })} />
          </Field>
          <Field label="Presunção IRPJ — Serviço (%)" cls="col-span-3">
            <Input type="number" step="0.01" value={draft.presuncaoIRPJ.servico}
              onChange={(e) => setDraft({ ...draft, presuncaoIRPJ: { ...draft.presuncaoIRPJ, servico: Number(e.target.value) } })} />
          </Field>
          <Field label="Presunção CSLL — Produto (%)" cls="col-span-3">
            <Input type="number" step="0.01" value={draft.presuncaoCSLL.produto}
              onChange={(e) => setDraft({ ...draft, presuncaoCSLL: { ...draft.presuncaoCSLL, produto: Number(e.target.value) } })} />
          </Field>
          <Field label="Presunção CSLL — Serviço (%)" cls="col-span-3">
            <Input type="number" step="0.01" value={draft.presuncaoCSLL.servico}
              onChange={(e) => setDraft({ ...draft, presuncaoCSLL: { ...draft.presuncaoCSLL, servico: Number(e.target.value) } })} />
          </Field>
          <Field label="Alíquota IRPJ (%)" cls="col-span-2">
            <Input type="number" step="0.01" value={draft.aliquotaIRPJ}
              onChange={(e) => setDraft({ ...draft, aliquotaIRPJ: Number(e.target.value) })} />
          </Field>
          <Field label="Adicional IRPJ (%)" cls="col-span-2">
            <Input type="number" step="0.01" value={draft.adicionalIRPJ}
              onChange={(e) => setDraft({ ...draft, adicionalIRPJ: Number(e.target.value) })} />
          </Field>
          <Field label="Alíquota CSLL (%)" cls="col-span-2">
            <Input type="number" step="0.01" value={draft.aliquotaCSLL}
              onChange={(e) => setDraft({ ...draft, aliquotaCSLL: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="flex justify-end border-t border-border px-5 py-3">
          <Button size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => { setCfg(draft); toast.success("Parâmetros de IRPJ/CSLL salvos"); }}>
            <Save className="h-3.5 w-3.5" /> Salvar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold tracking-tight">Apuração estimada do período</h3>
          <p className="text-xs text-muted-foreground">
            Receita total faturada × presunção × alíquotas. {draft.periodicidade === "trimestral" ? "Trimestre" : "Ano"}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          <Stat label="Receita Produtos" value={fmt(apuracao.receitaProduto)} />
          <Stat label="Receita Serviços" value={fmt(apuracao.receitaServico)} />
          <Stat label="Base IRPJ presumida" value={fmt(apuracao.baseIRPJ)} />
          <Stat label="Base CSLL presumida" value={fmt(apuracao.baseCSLL)} />
          <Stat label="IRPJ devido" value={fmt(apuracao.irpjBase)} />
          <Stat label="Adicional IRPJ (10%)" value={fmt(apuracao.adicional)} highlight={apuracao.adicional > 0} />
          <Stat label="CSLL devida" value={fmt(apuracao.csll)} />
          <Stat label="Total IRPJ + CSLL" value={fmt(apuracao.total)} highlight />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "border-foreground/30 bg-secondary/40" : "border-border"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
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
          Define modelo, série e próximo número da nota.
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
          <Input type="number" min={1} value={draft.serie}
            onChange={(e) => setDraft({ ...draft, serie: Math.max(1, Number(e.target.value)) })} />
        </Field>
        <Field label="Próximo número" cls="col-span-1">
          <Input type="number" min={1} value={draft.proximoNumero}
            onChange={(e) => setDraft({ ...draft, proximoNumero: Math.max(1, Number(e.target.value)) })} />
        </Field>
        <Field label="CSC ID (NFC-e)" cls="col-span-3">
          <Input value={draft.cscId ?? ""} onChange={(e) => setDraft({ ...draft, cscId: e.target.value })} />
        </Field>
        <Field label="CSC Token" cls="col-span-3">
          <Input type="password" value={draft.csc ?? ""} onChange={(e) => setDraft({ ...draft, csc: e.target.value })} />
        </Field>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="text-xs text-muted-foreground">
          Próxima nota: <span className="font-medium text-foreground">
            {draft.modelo === "NFS-e" ? "NFS-e" : `NF-${draft.modelo}`}-{String(draft.serie).padStart(3, "0")}-{String(draft.proximoNumero).padStart(6, "0")}
          </span>
        </div>
        <Button size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => { setNF(draft); toast.success("Configuração de NF salva"); }}>
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
