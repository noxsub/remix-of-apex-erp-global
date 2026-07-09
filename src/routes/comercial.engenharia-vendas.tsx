import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Trash2, Trophy, XCircle, Eye, Briefcase, LayoutGrid, List, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  useCotacoes,
  proximoNumeroProjeto,
  valorTotalCotacao,
  custoTotalCotacao,
  type Cotacao,
  type ItemCotado,
} from "@/lib/crm-store";
import { useEtapasCrm, corParaNovaEtapa, type EtapaCrm } from "@/lib/etapas-crm-store";
import { useCentrosCusto, proximoCodigoCC } from "@/lib/centro-custo-store";
import { useClientes, useFornecedores, type Cliente, type Fornecedor } from "@/lib/erp-store";
import { useItensFiscais, type ItemFiscal } from "@/lib/fiscal-store";

export const Route = createFileRoute("/comercial/engenharia-vendas")({
  head: () => ({ meta: [{ title: "Engenharia de Vendas — Syntera ERP" }] }),
  component: EngenhariaVendasPage,
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function EngenhariaVendasPage() {
  const [cotacoes, setCotacoes] = useCotacoes();
  const [etapas, setEtapas] = useEtapasCrm();
  const [, setCentrosCusto] = useCentrosCusto();
  const [clientes, setClientes] = useClientes();
  const [fornecedores, setFornecedores] = useFornecedores();
  const [itensFiscais, setItensFiscais] = useItensFiscais();
  const [novoOpen, setNovoOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<Cotacao | null>(null);
  const [visao, setVisao] = useState<"kanban" | "lista">("kanban");

  const nomeEtapa = (id: string) => etapas.find((e) => e.id === id)?.nome ?? id;

  const kpis = useMemo(() => {
    const ativas = cotacoes.filter((c) => c.status !== "ganho" && c.status !== "perdido");
    const emCarteira = ativas.reduce((s, c) => s + valorTotalCotacao(c), 0);
    const ganhas = cotacoes.filter((c) => c.status === "ganho");
    const taxaGanho = cotacoes.length
      ? (ganhas.length / cotacoes.filter((c) => c.status === "ganho" || c.status === "perdido").length || 0) * 100
      : 0;
    return {
      ativas: ativas.length,
      emCarteira,
      ganhas: ganhas.length,
      taxaGanho: isFinite(taxaGanho) ? taxaGanho : 0,
    };
  }, [cotacoes]);

  /* ═══════════════════════════════════════════════════════════════
     CASCATA DE GANHO — o coração da amarração pedida
     ═══════════════════════════════════════════════════════════════ */
  const marcarComoGanho = (cot: Cotacao) => {
    /* 1. Cliente — pré-cadastra se ainda não existir em Cadastros */
    const clienteExiste = clientes.some(
      (c) => c.nome.toLowerCase() === cot.clienteNome.toLowerCase(),
    );
    if (!clienteExiste) {
      const novoCliente: Cliente = {
        nome: cot.clienteNome,
        documento: cot.clienteDocumento ?? "",
        telefone: "",
        email: "",
        tipo: "Revendedor",
        status: "Ativo",
      };
      setClientes((prev) => [...prev, novoCliente]);
    }

    /* 2. Fornecedores cotados — pré-cadastra os que ainda não existirem */
    const nomesFornecedores = [...new Set(cot.itens.map((i) => i.fornecedorNome).filter(Boolean))] as string[];
    const novosFornecedores: Fornecedor[] = nomesFornecedores
      .filter((nome) => !fornecedores.some((f) => f.razao.toLowerCase() === nome.toLowerCase()))
      .map((nome) => ({ razao: nome, cnpj: "", ie: "", cidade: "" }));
    if (novosFornecedores.length) {
      setFornecedores((prev) => [...prev, ...novosFornecedores]);
    }

    /* 3. Itens — pré-cadastra no cadastro fiscal com o preço negociado */
    setItensFiscais((prev) => {
      const atualizados = [...prev];
      for (const it of cot.itens) {
        const idx = atualizados.findIndex((p) => p.sku === it.codigo);
        if (idx === -1) {
          const novoItem: ItemFiscal = {
            id: `if-crm-${it.codigo}-${Date.now()}`,
            tipo: "produto",
            sku: it.codigo,
            nome: it.descricao,
            unidade: it.unidade,
            preco: it.precoVenda,
            ncm: it.ncm,
            origem: "0",
            cstCsosn: "00",
            aliquotas: { icms: 18, ipi: 0, pis: 1.65, cofins: 7.6, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
            custoMedio: it.precoFornecedor,
            estoqueAtual: 0,
            estoqueMinimo: 1,
          };
          atualizados.push(novoItem);
        }
      }
      return atualizados;
    });

    /* 4. Centro de Custo — cria vinculado ao número do projeto */
    setCentrosCusto((prev) => {
      const codigo = proximoCodigoCC(prev);
      const novo = {
        id: `cc-${cot.numeroProjeto}`,
        codigo,
        nome: `${cot.numeroProjeto} — ${cot.titulo}`,
        descricao: cot.observacoes,
        clienteNome: cot.clienteNome,
        responsavelComercial: cot.vendedorResponsavel,
        orcamento: valorTotalCotacao(cot),
        realizado: 0,
        origem: "crm" as const,
        cotacaoOrigemId: cot.id,
        ativo: true,
        criadoEm: new Date().toLocaleDateString("pt-BR"),
      };
      return [novo, ...prev];
    });

    /* 5. Atualiza a cotação */
    setCotacoes((prev) =>
      prev.map((c) => (c.id === cot.id ? { ...c, status: "ganho" as const, centroCustoGeradoId: `cc-${cot.numeroProjeto}` } : c)),
    );

    toast.success(`Projeto ${cot.numeroProjeto} ganho!`, {
      description: "Centro de Custo criado, e cliente/fornecedores/itens pré-cadastrados automaticamente.",
    });
  };

  const marcarComoPerdido = (id: string) => {
    setCotacoes((prev) => prev.map((c) => (c.id === id ? { ...c, status: "perdido" } : c)));
    toast.info("Cotação marcada como perdida.");
  };

  /** Dispatcher usado tanto pelos botões quanto pelo drag-and-drop do Kanban. */
  const moverCotacao = (cot: Cotacao, novaEtapaId: string) => {
    if (novaEtapaId === cot.status) return;
    if (novaEtapaId === "ganho") {
      marcarComoGanho(cot);
    } else if (novaEtapaId === "perdido") {
      marcarComoPerdido(cot.id);
    } else {
      setCotacoes((prev) => prev.map((c) => (c.id === cot.id ? { ...c, status: novaEtapaId } : c)));
    }
  };

  const cols: Column<Cotacao>[] = [
    { key: "numeroProjeto", header: "Projeto" },
    { key: "titulo", header: "Título" },
    { key: "clienteNome", header: "Cliente" },
    { key: "vendedorResponsavel", header: "Vendedor" },
    { key: "itens", header: "Itens", align: "right", render: (r) => String(r.itens.length) },
    { key: "valor", header: "Valor proposto", align: "right", render: (r) => brl(valorTotalCotacao(r)) },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const etapa = etapas.find((e) => e.id === r.status);
        return (
          <Badge
            variant={r.status === "ganho" ? "default" : r.status === "perdido" ? "destructive" : "secondary"}
            style={etapa && r.status !== "ganho" && r.status !== "perdido" ? { borderColor: etapa.cor, color: etapa.cor } : undefined}
          >
            {nomeEtapa(r.status)}
          </Badge>
        );
      },
    },
    {
      key: "acoes",
      header: "",
      render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setDetalhe(r)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {r.status !== "ganho" && r.status !== "perdido" && (
            <>
              <Button size="sm" variant="ghost" className="text-green-600" onClick={() => marcarComoGanho(r)}>
                <Trophy className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => marcarComoPerdido(r.id)}>
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Engenharia de Vendas"
      subtitle="CRM interno — cotações, projetos e a ponte automática para Cadastros e Centro de Custo."
      actions={<NovaCotacaoDialog open={novoOpen} onOpenChange={setNovoOpen} onSalvar={(c) => setCotacoes((prev) => [c, ...prev])} />}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Cotações Ativas</p>
          <p className="text-lg font-bold">{kpis.ativas}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Em Carteira</p>
          <p className="text-lg font-bold text-gold">{brl(kpis.emCarteira)}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Projetos Ganhos</p>
          <p className="text-lg font-bold text-green-600">{kpis.ganhas}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Taxa de Ganho</p>
          <p className="text-lg font-bold">{kpis.taxaGanho.toFixed(0)}%</p>
        </Card>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
          <button
            onClick={() => setVisao("kanban")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              visao === "kanban" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
          <button
            onClick={() => setVisao("lista")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              visao === "lista" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
      </div>

      {visao === "kanban" ? (
        <div className="mt-3">
          <KanbanBoard
            cotacoes={cotacoes}
            etapas={etapas}
            onSetEtapas={setEtapas}
            onMover={moverCotacao}
            onAbrirDetalhe={setDetalhe}
          />
        </div>
      ) : (
      <div className="mt-4">
        <DataTable
          title="Cotações e Projetos"
          description="Ao marcar como Ganho, o sistema cria o Centro de Custo e pré-cadastra cliente, fornecedores e itens automaticamente."
          columns={cols}
          data={cotacoes}
          filename="engenharia-vendas"
        />
      </div>
      )}

      {detalhe && <DetalheCotacaoDialog cot={detalhe} onClose={() => setDetalhe(null)} />}
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOVA COTAÇÃO — itens linha a linha (fornecedor + cliente)
   ═══════════════════════════════════════════════════════════════ */

function NovaCotacaoDialog({
  open,
  onOpenChange,
  onSalvar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSalvar: (c: Cotacao) => void;
}) {
  const [cotacoesAtuais] = useCotacoes();
  const [titulo, setTitulo] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemCotado[]>([
    { codigo: "", descricao: "", unidade: "UN", quantidade: 1, precoFornecedor: 0, precoVenda: 0, fornecedorNome: "" },
  ]);

  const addItem = () =>
    setItens((prev) => [...prev, { codigo: "", descricao: "", unidade: "UN", quantidade: 1, precoFornecedor: 0, precoVenda: 0, fornecedorNome: "" }]);
  const removeItem = (idx: number) => setItens((prev) => prev.filter((_, i) => i !== idx));
  const setItem = (idx: number, patch: Partial<ItemCotado>) =>
    setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const limpar = () => {
    setTitulo("");
    setClienteNome("");
    setClienteDocumento("");
    setVendedor("");
    setObservacoes("");
    setItens([{ codigo: "", descricao: "", unidade: "UN", quantidade: 1, precoFornecedor: 0, precoVenda: 0, fornecedorNome: "" }]);
  };

  const salvar = () => {
    if (!titulo || !clienteNome || !vendedor || itens.some((i) => !i.codigo || !i.descricao)) {
      toast.error("Preencha título, cliente, vendedor e todos os itens (código e descrição).");
      return;
    }
    const nova: Cotacao = {
      id: `cot-${Date.now()}`,
      numeroProjeto: proximoNumeroProjeto(cotacoesAtuais),
      titulo,
      clienteNome,
      clienteDocumento: clienteDocumento || undefined,
      vendedorResponsavel: vendedor,
      itens,
      status: "lead",
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      observacoes: observacoes || undefined,
    };
    onSalvar(nova);
    limpar();
    onOpenChange(false);
    toast.success(`Cotação criada — projeto ${nova.numeroProjeto}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Nova Cotação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Cotação / Projeto</DialogTitle>
          <DialogDescription>
            O número do projeto é gerado automaticamente e, ao ganhar, vira o Centro de Custo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Título do projeto *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Fornecimento de equipamentos — Obra X" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente *</Label>
            <Input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CNPJ/CPF do cliente</Label>
            <Input value={clienteDocumento} onChange={(e) => setClienteDocumento(e.target.value)} placeholder="Opcional" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vendedor responsável *</Label>
            <Input value={vendedor} onChange={(e) => setVendedor(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Itens cotados</Label>
            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={addItem}>
              <Plus className="h-3 w-3" /> Item
            </Button>
          </div>
          {itens.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-1.5 rounded-md border border-border p-2">
              <Input className="col-span-2 h-7 text-xs" placeholder="Código" value={it.codigo} onChange={(e) => setItem(idx, { codigo: e.target.value })} />
              <Input className="col-span-3 h-7 text-xs" placeholder="Descrição" value={it.descricao} onChange={(e) => setItem(idx, { descricao: e.target.value })} />
              <Input className="col-span-2 h-7 text-xs" placeholder="Fornecedor" value={it.fornecedorNome} onChange={(e) => setItem(idx, { fornecedorNome: e.target.value })} />
              <Input className="col-span-1 h-7 text-xs" type="number" placeholder="Qtd" value={it.quantidade} onChange={(e) => setItem(idx, { quantidade: Number(e.target.value) })} />
              <Input className="col-span-1 h-7 text-xs" type="number" placeholder="Custo" value={it.precoFornecedor} onChange={(e) => setItem(idx, { precoFornecedor: Number(e.target.value) })} />
              <Input className="col-span-2 h-7 text-xs" type="number" placeholder="Preço venda" value={it.precoVenda} onChange={(e) => setItem(idx, { precoVenda: Number(e.target.value) })} />
              <Button size="sm" variant="ghost" className="col-span-1 h-7 text-destructive" onClick={() => removeItem(idx)} disabled={itens.length === 1}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Observações</Label>
          <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Criar Cotação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetalheCotacaoDialog({ cot, onClose }: { cot: Cotacao; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gold" /> {cot.numeroProjeto} — {cot.titulo}
          </DialogTitle>
          <DialogDescription>
            Cliente: {cot.clienteNome} · Vendedor: {cot.vendedorResponsavel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {cot.itens.map((it) => (
            <div key={it.codigo} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
              <div>
                <p className="font-medium">{it.codigo} — {it.descricao}</p>
                <p className="text-muted-foreground">Fornecedor: {it.fornecedorNome || "—"} · {it.quantidade} {it.unidade}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Custo: {brl(it.precoFornecedor)}</p>
                <p className="font-semibold text-gold">Venda: {brl(it.precoVenda)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Custo total: {brl(custoTotalCotacao(cot))}</span>
          <span className="font-semibold">Valor proposto: {brl(valorTotalCotacao(cot))}</span>
        </div>
        {cot.observacoes && <p className="text-xs italic text-muted-foreground">{cot.observacoes}</p>}
        {cot.centroCustoGeradoId && (
          <Badge variant="outline" className="w-fit border-gold/40 text-gold">
            Centro de Custo gerado: {cot.centroCustoGeradoId}
          </Badge>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KANBAN — colunas parametrizáveis, drag-and-drop nativo (HTML5)
   ═══════════════════════════════════════════════════════════════ */

function KanbanBoard({
  cotacoes,
  etapas,
  onSetEtapas,
  onMover,
  onAbrirDetalhe,
}: {
  cotacoes: Cotacao[];
  etapas: EtapaCrm[];
  onSetEtapas: ReturnType<typeof useEtapasCrm>[1];
  onMover: (cot: Cotacao, novaEtapaId: string) => void;
  onAbrirDetalhe: (c: Cotacao) => void;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobreColuna, setSobreColuna] = useState<string | null>(null);
  const [novaEtapaOpen, setNovaEtapaOpen] = useState(false);
  const [nomeNovaEtapa, setNomeNovaEtapa] = useState("");

  const etapasOrdenadas = [...etapas].sort((a, b) => a.ordem - b.ordem);

  const criarEtapa = () => {
    if (!nomeNovaEtapa.trim()) return;
    const semReservadas = etapasOrdenadas.filter((e) => !e.reservada);
    const maxOrdem = semReservadas.length ? Math.max(...semReservadas.map((e) => e.ordem)) : -1;
    onSetEtapas((prev) => [
      ...prev,
      {
        id: `etapa-${Date.now()}`,
        nome: nomeNovaEtapa.trim(),
        cor: corParaNovaEtapa(prev),
        ordem: maxOrdem + 1,
      },
    ]);
    setNomeNovaEtapa("");
    setNovaEtapaOpen(false);
    toast.success("Nova etapa criada no funil!");
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {etapasOrdenadas.map((etapa) => {
        const cards = cotacoes.filter((c) => c.status === etapa.id);
        const valorColuna = cards.reduce((s, c) => s + valorTotalCotacao(c), 0);
        const isSobre = sobreColuna === etapa.id;
        return (
          <div
            key={etapa.id}
            onDragOver={(e) => {
              e.preventDefault();
              setSobreColuna(etapa.id);
            }}
            onDragLeave={() => setSobreColuna((s) => (s === etapa.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setSobreColuna(null);
              const cotId = e.dataTransfer.getData("text/cotacao-id");
              const cot = cotacoes.find((c) => c.id === cotId);
              if (cot) onMover(cot, etapa.id);
              setArrastando(null);
            }}
            className={`flex w-64 shrink-0 flex-col rounded-lg border transition-colors ${
              isSobre ? "border-gold bg-gold/5" : "border-border bg-secondary/20"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: etapa.cor }} />
                <span className="text-xs font-semibold">{etapa.nome}</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{cards.length}</Badge>
              </div>
            </div>
            {valorColuna > 0 && (
              <div className="border-b border-border px-3 py-1.5 text-[10px] text-muted-foreground">
                {brl(valorColuna)}
              </div>
            )}
            <div className="flex-1 space-y-2 p-2" style={{ minHeight: 120 }}>
              {cards.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/cotacao-id", c.id);
                    setArrastando(c.id);
                  }}
                  onDragEnd={() => setArrastando(null)}
                  onClick={() => onAbrirDetalhe(c)}
                  className={`cursor-grab rounded-md border border-border bg-card p-2.5 text-xs shadow-sm transition-opacity active:cursor-grabbing hover:border-gold/40 ${
                    arrastando === c.id ? "opacity-40" : ""
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-1">
                    <p className="font-medium leading-tight">{c.titulo}</p>
                    <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.numeroProjeto}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{c.clienteNome}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{c.vendedorResponsavel}</span>
                    <span className="text-xs font-semibold text-gold">{brl(valorTotalCotacao(c))}</span>
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="rounded-md border border-dashed border-border/60 p-4 text-center text-[10px] text-muted-foreground">
                  Arraste um card aqui
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Coluna "+ Nova Etapa" — colunas parametrizáveis */}
      <div className="w-56 shrink-0">
        <Dialog open={novaEtapaOpen} onOpenChange={setNovaEtapaOpen}>
          <DialogTrigger asChild>
            <button className="flex h-full min-h-[120px] w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-gold hover:text-gold">
              <Plus className="h-3.5 w-3.5" /> Nova Etapa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova etapa do funil</DialogTitle>
              <DialogDescription>Cria uma nova coluna no Kanban, antes de "Projeto Ganho".</DialogDescription>
            </DialogHeader>
            <Input
              value={nomeNovaEtapa}
              onChange={(e) => setNomeNovaEtapa(e.target.value)}
              placeholder="Ex: Aprovação Jurídica"
              onKeyDown={(e) => e.key === "Enter" && criarEtapa()}
            />
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setNovaEtapaOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={criarEtapa}>Criar Etapa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
