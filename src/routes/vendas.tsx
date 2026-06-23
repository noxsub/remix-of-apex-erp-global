import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FileText, ChevronsUpDown, Check, ArrowLeft, RotateCcw, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useClientes,
  useFornecedores,
  useOrcamentos,
  useFaturados,
  type Orcamento,
  type OrcamentoItem,
  type PedidoFaturado,
  type Cliente,
} from "@/lib/erp-store";
import { useTaxConfig, taxDescriptions, type TipoOperacao, type TaxRates } from "@/lib/tax-config";
import { usePerfisFiscaisCliente, consumirProximoNumeroNF } from "@/lib/fiscal-store";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/status-badge";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas / Faturamento — Global ERP" },
      { name: "description", content: "Pedidos integrados ao estoque." },
    ],
  }),
  component: VendasPage,
});

const produtosEstoque = [
  { sku: "SKU-10042", nome: "Notebook Pro 14\" M3", preco: 7299, estoque: 184 },
  { sku: "SKU-10043", nome: "Monitor UltraWide 34\"", preco: 3499, estoque: 42 },
  { sku: "SKU-10044", nome: "Teclado Mecânico RGB", preco: 599, estoque: 8 },
  { sku: "SKU-10045", nome: "Mouse Ergonômico Vertical", preco: 289, estoque: 312 },
  { sku: "SKU-10046", nome: "Headset Wireless ANC", preco: 1199, estoque: 64 },
];

type PedidoRow = {
  nf: string;
  data: string;
  cliente: string;
  itens: number;
  total: string;
  status: string;
};

const pedidosHistorico: PedidoRow[] = [
  { nf: "NF-2026-000184", data: "08/06/2026", cliente: "Acme Global Ltd.", itens: 4, total: "R$ 18.420,00", status: "Faturado" },
  { nf: "NF-2026-000183", data: "08/06/2026", cliente: "Northwind Trading", itens: 2, total: "R$ 9.890,50", status: "Enviado" },
  { nf: "NF-2026-000181", data: "07/06/2026", cliente: "Fabrikam Inc.", itens: 1, total: "R$ 3.250,00", status: "Faturado" },
];

const colPed: Column<PedidoRow>[] = [
  { key: "nf", header: "NF" },
  { key: "data", header: "Data" },
  { key: "cliente", header: "Cliente" },
  { key: "itens", header: "Itens", align: "right" },
  { key: "total", header: "Total", align: "right" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

type Item = OrcamentoItem;

type ConferenciaState = {
  clienteNome: string;
  cliente?: Cliente;
  condicao: string;
  items: Item[];
  total: number;
};

function VendasPage() {
  const [clientes] = useClientes();
  const [fornecedores] = useFornecedores();
  const [orcamentos, setOrcamentos] = useOrcamentos();
  const [faturados, setFaturados] = useFaturados();

  const [clienteNome, setClienteNome] = useState<string>("");
  const [condicao, setCondicao] = useState<string>("30");
  const [items, setItems] = useState<Item[]>([{ sku: "SKU-10042", qtd: 1 }]);
  const [orcamentoEditandoId, setOrcamentoEditandoId] = useState<string | null>(null);
  const [conferencia, setConferencia] = useState<ConferenciaState | null>(null);

  const addItem = () => setItems([...items, { sku: produtosEstoque[0].sku, qtd: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const total = items.reduce((acc, it) => {
    const p = produtosEstoque.find((p) => p.sku === it.sku);
    return acc + (p ? p.preco * it.qtd : 0);
  }, 0);

  const opcoesCliente = useMemo(() => {
    const fromClientes = clientes.map((c) => ({
      key: `cli:${c.documento}`,
      nome: c.nome,
      detalhe: c.documento,
      origem: "Cliente" as const,
      busca: `${c.nome} ${c.documento}`.toLowerCase(),
    }));
    const fromFornecedores = fornecedores.map((f) => ({
      key: `forn:${f.cnpj}`,
      nome: f.razao,
      detalhe: [f.fantasia, f.cnpj].filter(Boolean).join(" · "),
      origem: "Fornecedor" as const,
      busca: `${f.razao} ${f.fantasia ?? ""} ${f.cnpj}`.toLowerCase(),
    }));
    return [...fromClientes, ...fromFornecedores];
  }, [clientes, fornecedores]);

  function resetForm() {
    setClienteNome("");
    setCondicao("30");
    setItems([{ sku: "SKU-10042", qtd: 1 }]);
    setOrcamentoEditandoId(null);
  }

  function salvarOrcamento() {
    if (!clienteNome) {
      toast.error("Selecione um cliente antes de salvar o orçamento.");
      return;
    }
    const id = orcamentoEditandoId ?? `ORC-${Date.now()}`;
    const novo: Orcamento = {
      id,
      criadoEm: new Date().toLocaleString("pt-BR"),
      clienteNome,
      condicao,
      items,
      total,
    };
    setOrcamentos((prev) => {
      const semAtual = prev.filter((o) => o.id !== id);
      return [novo, ...semAtual];
    });
    toast.success("Orçamento salvo", {
      description: `${id} · ${clienteNome} · sem integração fiscal`,
    });
    resetForm();
  }

  function retomarOrcamento(o: Orcamento) {
    setClienteNome(o.clienteNome);
    setCondicao(o.condicao);
    setItems(o.items);
    setOrcamentoEditandoId(o.id);
    toast.info("Orçamento retomado", { description: `${o.id} carregado para edição.` });
  }

  function descartarOrcamento(id: string) {
    setOrcamentos((prev) => prev.filter((o) => o.id !== id));
    if (orcamentoEditandoId === id) resetForm();
  }

  function abrirConferencia() {
    if (!clienteNome) {
      toast.error("Selecione um cliente antes de faturar.");
      return;
    }
    const cliente = clientes.find((c) => c.nome === clienteNome);
    setConferencia({ clienteNome, cliente, condicao, items, total });
  }

  if (conferencia) {
    return (
      <ConferenciaView
        data={conferencia}
        onVoltar={() => setConferencia(null)}
        onConfirmar={() => {
          if (orcamentoEditandoId) {
            setOrcamentos((prev) => prev.filter((o) => o.id !== orcamentoEditandoId));
          }
          const { formatado: nf } = consumirProximoNumeroNF();
          const novo: PedidoFaturado = {
            nf,
            data: new Date().toLocaleDateString("pt-BR"),
            clienteNome: conferencia.clienteNome,
            itens: conferencia.items.length,
            total: conferencia.total,
            status: "Faturado",
          };
          setFaturados((prev) => [novo, ...prev]);
          toast.success("Pedido faturado", {
            description: `${nf} gerada e enviada ao módulo fiscal.`,
          });
          setConferencia(null);
          resetForm();
        }}
      />
    );
  }

  return (
    <AppShell
      title="Vendas / Faturamento"
      subtitle="Crie pedidos integrados ao estoque em tempo real."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight">
              {orcamentoEditandoId ? `Editando orçamento ${orcamentoEditandoId}` : "Novo pedido"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Os itens consomem o estoque ao faturar. Orçamentos não geram retenção fiscal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Cliente</Label>
              <ClienteCombobox
                value={clienteNome}
                onChange={setClienteNome}
                options={opcoesCliente}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condição de pagamento</Label>
              <Select value={condicao} onValueChange={setCondicao}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">À vista</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">30/60 dias</SelectItem>
                  <SelectItem value="90">30/60/90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Itens</Label>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={addItem}>
                <Plus className="h-3 w-3" /> Adicionar item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => {
                const p = produtosEstoque.find((p) => p.sku === it.sku)!;
                return (
                  <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-md border border-border bg-secondary/30 p-2">
                    <div className="col-span-6">
                      <Select value={it.sku} onValueChange={(v) => updateItem(i, { sku: v })}>
                        <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {produtosEstoque.map((pr) => (
                            <SelectItem key={pr.sku} value={pr.sku}>
                              {pr.nome} · {pr.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={it.qtd}
                        onChange={(e) => updateItem(i, { qtd: Math.max(1, Number(e.target.value)) })}
                        className="h-9 bg-background tabular-nums"
                      />
                    </div>
                    <div className="col-span-3 text-right text-sm tabular-nums">
                      {(p.preco * it.qtd).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      <div className="text-[10px] text-muted-foreground">Estoque: {p.estoque}</div>
                    </div>
                    <button
                      onClick={() => removeItem(i)}
                      className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total do pedido</div>
              <div className="text-2xl font-semibold tabular-nums">
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={salvarOrcamento}>
                {orcamentoEditandoId ? "Atualizar orçamento" : "Orçamento"}
              </Button>
              <Button
                size="sm"
                className="h-9 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                onClick={abrirConferencia}
              >
                <FileText className="h-3.5 w-3.5" /> Faturar pedido
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">Resumo do dia</h3>
          <p className="text-xs text-muted-foreground">08/06/2026</p>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Pedidos abertos", "12"],
              ["Faturados hoje", "8"],
              ["Receita do dia", "R$ 64.890,00"],
              ["Ticket médio", "R$ 8.111,25"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {orcamentos.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight">Orçamentos salvos</h3>
            <p className="text-xs text-muted-foreground">
              Sem integração fiscal. Retome para converter em venda.
            </p>
          </div>
          <div className="divide-y divide-border">
            {orcamentos.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{o.id} · {o.clienteNome}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.criadoEm} · {o.items.length} item(ns)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums font-medium">
                    {o.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => retomarOrcamento(o)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retomar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => descartarOrcamento(o.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <DataTable
          title="Pedidos recentes"
          columns={colPed}
          data={[
            ...faturados.map((f) => ({
              nf: f.nf,
              data: f.data,
              cliente: f.clienteNome,
              itens: f.itens,
              total: f.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              status: f.status,
            })),
            ...pedidosHistorico,
          ]}
          filename="pedidos"
        />
      </div>
    </AppShell>
  );
}

type ClienteOption = {
  key: string;
  nome: string;
  detalhe: string;
  origem: "Cliente" | "Fornecedor";
  busca: string;
};

function ClienteCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ClienteOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Selecione ou digite o cliente"}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const opt = options.find((o) => o.key === itemValue);
            if (!opt) return 0;
            return opt.busca.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar por razão social, fantasia ou CNPJ..." />
          <CommandList>
            <CommandEmpty>Nenhum cadastro encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.key}
                  value={opt.key}
                  onSelect={() => {
                    onChange(opt.nome);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === opt.nome ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{opt.nome}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {opt.origem} · {opt.detalhe}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ConferenciaView({
  data,
  onVoltar,
  onConfirmar,
}: {
  data: ConferenciaState;
  onVoltar: () => void;
  onConfirmar: () => void;
}) {
  const [taxConfig, setTaxConfig] = useTaxConfig();
  const [perfis] = usePerfisFiscaisCliente();
  const perfilDoCliente = data.cliente?.fiscal?.perfilFiscalId
    ? perfis.find((p) => p.id === data.cliente!.fiscal!.perfilFiscalId)
    : undefined;
  const tipoInicial: TipoOperacao =
    perfilDoCliente && perfilDoCliente.retencoes.iss ? "servico" : "produto";
  const [tipo, setTipo] = useState<TipoOperacao>(tipoInicial);
  const [editOpen, setEditOpen] = useState(false);
  const base = data.total;
  const rates = taxConfig[tipo];
  const retencoes = (Object.keys(taxDescriptions) as (keyof TaxRates)[]).map((k) => ({
    sigla: taxDescriptions[k].label,
    descricao: taxDescriptions[k].descricao,
    aliquota: rates[k],
    valor: (base * rates[k]) / 100,
  }));
  const totalRetencoes = retencoes.reduce((a, r) => a + r.valor, 0);
  const liquido = base - totalRetencoes;

  const condicaoLabel: Record<string, string> = {
    "0": "À vista",
    "30": "30 dias",
    "60": "30/60 dias",
    "90": "30/60/90 dias",
  };

  return (
    <AppShell
      title="Conferência de Faturamento"
      subtitle="Revise o pedido e as retenções estimadas antes de enviar ao fiscal."
    >
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onVoltar}>
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao pedido
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          onClick={onConfirmar}
        >
          <FileText className="h-3.5 w-3.5" /> Confirmar e enviar ao fiscal
        </Button>
      </div>

      {!data.cliente?.fiscal?.perfilFiscalId && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <div className="font-medium text-amber-700 dark:text-amber-300">
              Cadastro fiscal incompleto
            </div>
            <div className="text-xs text-amber-700/90 dark:text-amber-300/90">
              O cliente <span className="font-medium">{data.clienteNome}</span> não tem perfil fiscal definido — as retenções estão usando as alíquotas padrão.{" "}
              <Link to="/fiscal" className="font-medium underline-offset-4 hover:underline">
                Configurar no módulo Fiscal →
              </Link>
            </div>
          </div>
        </div>
      )}

      {perfilDoCliente && (
        <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-300">
          Perfil fiscal aplicado: <span className="font-medium">{perfilDoCliente.nome}</span> · CFOP{" "}
          {perfilDoCliente.cfopDentroUF} (intra) / {perfilDoCliente.cfopForaUF} (inter)
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight">Pedido</h3>
            <p className="text-xs text-muted-foreground">
              Cliente: <span className="text-foreground">{data.clienteNome}</span> · Condição:{" "}
              {condicaoLabel[data.condicao] ?? data.condicao}
            </p>
          </div>
          <div className="divide-y divide-border">
            {data.items.map((it, i) => {
              const p = produtosEstoque.find((p) => p.sku === it.sku)!;
              return (
                <div key={i} className="grid grid-cols-12 items-center gap-2 px-5 py-3 text-sm">
                  <div className="col-span-7">
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{p.sku}</div>
                  </div>
                  <div className="col-span-2 text-right tabular-nums">{it.qtd} un.</div>
                  <div className="col-span-3 text-right tabular-nums">
                    {(p.preco * it.qtd).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Total bruto do pedido
            </span>
            <span className="text-xl font-semibold tabular-nums">
              {base.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Retenções de Impostos</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setEditOpen(true)}
              >
                <Settings2 className="h-3 w-3" /> Configurar
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-1 rounded-md border border-border bg-secondary/40 p-0.5 text-xs">
              {(["produto", "servico"] as TipoOperacao[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    "flex-1 rounded-sm px-2 py-1 capitalize",
                    tipo === t ? "bg-card shadow-sm font-medium" : "text-muted-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Valores estimados — a integração fiscal validará as alíquotas finais.
            </p>
          </div>
          <div className="divide-y divide-border">
            {retencoes.map((r) => (
              <div
                key={r.sigla}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {r.sigla} <span className="text-muted-foreground">({r.aliquota}%)</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{r.descricao}</div>
                </div>
                <div className="tabular-nums">
                  -{" "}
                  {r.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total de retenções</span>
              <span className="tabular-nums">
                -{" "}
                {totalRetencoes.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
              <span>Valor líquido a receber</span>
              <span className="text-lg tabular-nums">
                {liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <TaxConfigDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        config={taxConfig}
        onSave={(c) => {
          setTaxConfig(c);
          setEditOpen(false);
          toast.success("Alíquotas atualizadas");
        }}
      />
    </AppShell>
  );
}

function TaxConfigDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: import("@/lib/tax-config").TaxConfig;
  onSave: (c: import("@/lib/tax-config").TaxConfig) => void;
}) {
  const [draft, setDraft] = useState(config);
  // sync when reopened
  function setRate(t: TipoOperacao, k: keyof TaxRates, v: number) {
    setDraft((p) => ({ ...p, [t]: { ...p[t], [k]: v } }));
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) setDraft(config);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar alíquotas (Reforma Tributária)</DialogTitle>
          <DialogDescription>
            Defina CBS, IBS, IS, IRRF e CSLL por tipo de operação. Valores em %.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {(["produto", "servico"] as TipoOperacao[]).map((t) => (
            <div key={t} className="rounded-md border border-border p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t === "produto" ? "Produto (revenda)" : "Serviço"}
              </div>
              <div className="space-y-2.5">
                {(Object.keys(taxDescriptions) as (keyof TaxRates)[]).map((k) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <Label className="text-xs font-medium">{taxDescriptions[k].label}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="h-8 w-28 text-right tabular-nums"
                      value={draft[t][k]}
                      onChange={(e) => setRate(t, k, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onSave(draft)}
          >
            Salvar alíquotas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}