import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Network,
  Plug,
  Plus,
  Package,
  ShoppingBag,
  Truck,
  RefreshCw,
  Sparkles,
  Trash2,
  Link2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlokiBadge } from "@/components/floki-badge";
import { FlokiAlerts } from "@/components/floki-alerts";
import { useItensFiscais } from "@/lib/fiscal-store";
import { useFaturados, type PedidoFaturado } from "@/lib/erp-store";
import {
  type CanalTipo,
  type CanalVenda,
  type PedidoItem,
  type PedidoMarketplace,
  calcularLancamentosCompostos,
  enfileirar,
  useAnuncios,
  useCanais,
  useFilaSync,
  usePedidosMarketplace,
} from "@/lib/omnilink-store";
import { getAdapter } from "@/lib/omnilink/adapters";
import { consumirProximoNumeroNF } from "@/lib/fiscal-store";
import { rentabilidadePorCanal } from "@/lib/floki/insights";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/omnilink")({
  head: () => ({
    meta: [
      { title: "Omnilink — Syntera ERP" },
      { name: "description", content: "Hub de e-commerce e marketplaces do Syntera." },
    ],
  }),
  component: OmnilinkPage,
});

const tipos: { value: CanalTipo; label: string }[] = [
  { value: "mercadolivre", label: "Mercado Livre" },
  { value: "shopee", label: "Shopee" },
  { value: "amazon", label: "Amazon" },
  { value: "shopify", label: "Shopify" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "outro", label: "Outro" },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function OmnilinkPage() {
  return (
    <AppShell
      title="Omnilink"
      subtitle="Hub agnóstico de e-commerce e marketplaces — alimentado pela Floki."
      actions={<FlokiBadge label="Floki ativo" />}
    >
      <Tabs defaultValue="canais" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="canais"><Plug className="mr-1.5 h-3.5 w-3.5" />Canais</TabsTrigger>
          <TabsTrigger value="anuncios"><Package className="mr-1.5 h-3.5 w-3.5" />Anúncios</TabsTrigger>
          <TabsTrigger value="pedidos"><ShoppingBag className="mr-1.5 h-3.5 w-3.5" />Pedidos</TabsTrigger>
          <TabsTrigger value="logistica"><Truck className="mr-1.5 h-3.5 w-3.5" />Logística</TabsTrigger>
          <TabsTrigger value="fila"><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Fila de sync</TabsTrigger>
          <TabsTrigger value="floki"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Floki Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="canais"><CanaisTab /></TabsContent>
        <TabsContent value="anuncios"><AnunciosTab /></TabsContent>
        <TabsContent value="pedidos"><PedidosTab /></TabsContent>
        <TabsContent value="logistica"><LogisticaTab /></TabsContent>
        <TabsContent value="fila"><FilaTab /></TabsContent>
        <TabsContent value="floki"><FlokiTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ─── Canais ─────────────────────────────────────────────────────────────────

function CanaisTab() {
  const [canais, setCanais] = useCanais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CanalVenda | null>(null);

  function novoCanal() {
    setEditing({
      id: `canal-${Date.now()}`,
      nome: "",
      tipo: "mercadolivre",
      ativo: true,
      configuracoesJson: {},
      estoqueSegurancaPct: 5,
      prazoRecebimentoDias: 14,
      taxaComissaoPadrao: 14,
      taxaGatewayPadrao: 0,
      taxaFretePadrao: 4,
    });
    setOpen(true);
  }

  function salvar() {
    if (!editing) return;
    setCanais((prev) => {
      const exists = prev.find((c) => c.id === editing.id);
      return exists ? prev.map((c) => (c.id === editing.id ? editing : c)) : [...prev, editing];
    });
    toast.success("Canal salvo");
    setOpen(false);
    setEditing(null);
  }

  function remover(id: string) {
    setCanais((prev) => prev.filter((c) => c.id !== id));
    toast.success("Canal removido");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {canais.length} canal(is) configurado(s). Webhook: <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">/api/public/webhooks/{`{canalId}`}</code>
        </div>
        <Button size="sm" onClick={novoCanal}><Plus className="mr-1 h-4 w-4" />Novo canal</Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canal</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead className="text-right">Frete</TableHead>
              <TableHead className="text-right">Recebimento</TableHead>
              <TableHead className="text-right">Estoque seg.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {canais.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{tipos.find((t) => t.value === c.tipo)?.label}</TableCell>
                <TableCell className="text-right tabular-nums">{c.taxaComissaoPadrao}%</TableCell>
                <TableCell className="text-right tabular-nums">{c.taxaFretePadrao}%</TableCell>
                <TableCell className="text-right tabular-nums">{c.prazoRecebimentoDias}d</TableCell>
                <TableCell className="text-right tabular-nums">{c.estoqueSegurancaPct}%</TableCell>
                <TableCell>
                  <Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Pausado"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => remover(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {canais.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum canal cadastrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.nome || "Novo canal"}</DialogTitle>
            <DialogDescription>Configure as credenciais e parâmetros operacionais.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nome</Label><Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={editing.tipo} onValueChange={(v) => setEditing({ ...editing, tipo: v as CanalTipo })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Switch checked={editing.ativo} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                <Label>Ativo</Label>
              </div>
              <div><Label>Comissão padrão (%)</Label><Input type="number" value={editing.taxaComissaoPadrao} onChange={(e) => setEditing({ ...editing, taxaComissaoPadrao: Number(e.target.value) })} /></div>
              <div><Label>Frete médio (%)</Label><Input type="number" value={editing.taxaFretePadrao} onChange={(e) => setEditing({ ...editing, taxaFretePadrao: Number(e.target.value) })} /></div>
              <div><Label>Gateway (%)</Label><Input type="number" value={editing.taxaGatewayPadrao} onChange={(e) => setEditing({ ...editing, taxaGatewayPadrao: Number(e.target.value) })} /></div>
              <div><Label>Estoque de segurança (%)</Label><Input type="number" value={editing.estoqueSegurancaPct} onChange={(e) => setEditing({ ...editing, estoqueSegurancaPct: Number(e.target.value) })} /></div>
              <div><Label>Prazo de recebimento (dias)</Label><Input type="number" value={editing.prazoRecebimentoDias} onChange={(e) => setEditing({ ...editing, prazoRecebimentoDias: Number(e.target.value) })} /></div>
              <div className="col-span-2">
                <Label>API Key / Token</Label>
                <Input
                  value={editing.configuracoesJson.apiKey ?? ""}
                  onChange={(e) => setEditing({ ...editing, configuracoesJson: { ...editing.configuracoesJson, apiKey: e.target.value } })}
                  placeholder="Cole aqui o token do marketplace"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Anúncios ───────────────────────────────────────────────────────────────

function AnunciosTab() {
  const [canais] = useCanais();
  const [anuncios, setAnuncios] = useAnuncios();
  const [itens] = useItensFiscais();
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");

  const visiveis = useMemo(
    () => (filtroCanal === "todos" ? anuncios : anuncios.filter((a) => a.canalId === filtroCanal)),
    [anuncios, filtroCanal],
  );

  async function importar(canalId: string) {
    const canal = canais.find((c) => c.id === canalId);
    if (!canal) return;
    const adapter = getAdapter(canal.tipo);
    const novos = await adapter.importarAnuncios(canal, itens);
    setAnuncios((prev) => [...prev, ...novos.filter((n) => !prev.some((p) => p.id === n.id))]);
    toast.success(`${novos.length} anúncios importados de ${canal.nome}`);
  }

  function vincular(anuncioId: string, itemFiscalId: string) {
    setAnuncios((prev) => prev.map((a) => (a.id === anuncioId ? { ...a, itemFiscalId } : a)));
    enfileirar({ tipo: "anuncio", canalId: anuncios.find((a) => a.id === anuncioId)?.canalId ?? "", payload: { anuncioId, itemFiscalId } });
    toast.success("SKU vinculado e enfileirado para sincronização");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={filtroCanal} onValueChange={setFiltroCanal}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            {canais.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {canais.filter((c) => c.ativo).map((c) => (
            <Button key={c.id} size="sm" variant="outline" onClick={() => importar(c.id)}>
              <Link2 className="mr-1 h-3.5 w-3.5" />Importar de {c.nome}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anúncio</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>SKU externo</TableHead>
              <TableHead>Vinculado a</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Estoque exposto</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiveis.map((a) => {
              const canal = canais.find((c) => c.id === a.canalId);
              return (
                <TableRow key={a.id}>
                  <TableCell className="max-w-xs truncate">{a.tituloExterno}</TableCell>
                  <TableCell>{canal?.nome}</TableCell>
                  <TableCell className="font-mono text-xs">{a.skuExterno}</TableCell>
                  <TableCell>
                    <Select value={a.itemFiscalId ?? ""} onValueChange={(v) => vincular(a.id, v)}>
                      <SelectTrigger className="h-8 w-48"><SelectValue placeholder="Vincular SKU…" /></SelectTrigger>
                      <SelectContent>
                        {itens.map((it) => <SelectItem key={it.id} value={it.id}>{it.sku} — {it.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(a.precoExterno)}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.estoqueExposto}</TableCell>
                  <TableCell><Badge variant={a.status === "ativo" ? "default" : a.status === "erro" ? "destructive" : "secondary"}>{a.status}</Badge></TableCell>
                </TableRow>
              );
            })}
            {visiveis.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum anúncio. Use "Importar de…" para começar.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Pedidos ────────────────────────────────────────────────────────────────

function gerarPedidoSimulado(canal: CanalVenda, itens: ReturnType<typeof useItensFiscais>[0]): PedidoMarketplace {
  const produtos = itens.filter((i) => i.tipo === "produto").slice(0, 3);
  const escolhidos = produtos.slice(0, 1 + Math.floor(Math.random() * 2));
  const itensPedido: PedidoItem[] = escolhidos.map((p) => ({
    itemFiscalId: p.id,
    sku: p.sku,
    nome: p.nome,
    qtd: 1 + Math.floor(Math.random() * 2),
    precoUnit: p.preco,
  }));
  const valorBruto = itensPedido.reduce((s, i) => s + i.qtd * i.precoUnit, 0);
  const taxaComissao = +(valorBruto * (canal.taxaComissaoPadrao / 100)).toFixed(2);
  const taxaFrete = +(valorBruto * (canal.taxaFretePadrao / 100)).toFixed(2);
  const taxaPagamento = +(valorBruto * (canal.taxaGatewayPadrao / 100)).toFixed(2);
  const imposto = +(valorBruto * 0.09).toFixed(2);
  const cmv = +itensPedido.reduce((s, i) => {
    const item = itens.find((x) => x.id === i.itemFiscalId);
    const custo = item?.custoMedio ?? (item ? item.preco * 0.6 : 0);
    return s + i.qtd * custo;
  }, 0).toFixed(2);
  const valorLiquido = +(valorBruto - taxaComissao - taxaFrete - taxaPagamento).toFixed(2);
  const prevista = new Date();
  prevista.setDate(prevista.getDate() + canal.prazoRecebimentoDias);
  const numeroExterno = `${canal.tipo.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const base: Omit<PedidoMarketplace, "lancamentos" | "metadata" | "id"> = {
    canalId: canal.id,
    numeroExterno,
    data: new Date().toISOString(),
    clienteNome: ["Maria Silva", "João Santos", "Ana Costa", "Pedro Lima"][Math.floor(Math.random() * 4)],
    itens: itensPedido,
    valorBruto,
    taxaComissao,
    taxaFrete,
    taxaPagamento,
    valorLiquido,
    cmv,
    imposto,
    status: "novo",
    dataPrevistaRecebimento: prevista.toISOString(),
  };
  return {
    ...base,
    id: `ped-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    lancamentos: calcularLancamentosCompostos(base),
    metadata: {
      origemCanalId: canal.id,
      meioPagamentoId: canal.tipo === "shopee" ? "shopeepay" : "checkout-transparente",
      pedidoOrigemId: numeroExterno,
    },
  };
}

function PedidosTab() {
  const [canais] = useCanais();
  const [itens, setItens] = useItensFiscais();
  const [pedidos, setPedidos] = usePedidosMarketplace();
  const [, setFaturados] = useFaturados();
  const [busyCanal, setBusyCanal] = useState<string | null>(null);
  const [busyFaturar, setBusyFaturar] = useState<string | null>(null);

  function simularWebhook(canalId: string) {
    if (busyCanal) return;
    setBusyCanal(canalId);
    const canal = canais.find((c) => c.id === canalId);
    if (!canal) {
      setBusyCanal(null);
      return;
    }
    const novo = gerarPedidoSimulado(canal, itens);
    setPedidos((prev) =>
      prev.some((p) => p.id === novo.id || p.numeroExterno === novo.numeroExterno)
        ? prev
        : [novo, ...prev],
    );
    toast.success(`Pedido ${novo.numeroExterno} recebido de ${canal.nome}`);
    setTimeout(() => setBusyCanal(null), 400);
  }

  function faturar(pedidoId: string) {
    if (busyFaturar) return;
    setBusyFaturar(pedidoId);
    const ped = pedidos.find((p) => p.id === pedidoId);
    if (!ped || ped.status !== "novo") {
      setBusyFaturar(null);
      return;
    }
    const nf = consumirProximoNumeroNF();
    // Baixa de estoque
    setItens((prev) =>
      prev.map((it) => {
        const linha = ped.itens.find((i) => i.itemFiscalId === it.id);
        if (!linha || it.tipo !== "produto") return it;
        return { ...it, estoqueAtual: Math.max(0, (it.estoqueAtual ?? 0) - linha.qtd) };
      }),
    );
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, status: "faturado", nfNumero: nf.formatado } : p)),
    );
    // Espelha no consolidado de faturados da empresa
    const canal = canais.find((c) => c.id === ped.canalId);
    const reg: PedidoFaturado = {
      nf: nf.formatado,
      data: new Date().toLocaleDateString("pt-BR"),
      clienteNome: `${canal?.nome ?? "Marketplace"} · ${ped.clienteNome}`,
      itens: ped.itens.length,
      total: ped.valorBruto,
      status: "Faturado",
    };
    setFaturados((prev) => (prev.some((p) => p.nf === reg.nf) ? prev : [reg, ...prev]));
    toast.success(`NF ${nf.formatado} emitida`);
    setTimeout(() => setBusyFaturar(null), 300);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">{pedidos.length} pedido(s) recebido(s)</div>
        <div className="flex flex-wrap gap-2">
          {canais.filter((c) => c.ativo).map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant="outline"
              disabled={busyCanal === c.id}
              onClick={() => simularWebhook(c.id)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />Simular pedido {c.nome}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Líquido</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead>NF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => {
              const canal = canais.find((c) => c.id === p.canalId);
              const margem = p.valorBruto - p.taxaComissao - p.taxaFrete - p.taxaPagamento - p.imposto - p.cmv;
              const pct = p.valorBruto > 0 ? (margem / p.valorBruto) * 100 : 0;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.numeroExterno}</TableCell>
                  <TableCell>{canal?.nome}</TableCell>
                  <TableCell>{p.clienteNome}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(p.valorBruto)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(p.valorLiquido)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${pct < 0 ? "text-destructive" : pct < 5 ? "text-amber-600" : "text-emerald-600"}`}>
                    {pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.nfNumero ?? "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "faturado" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell>
                    {p.status === "novo" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyFaturar === p.id}
                        onClick={() => faturar(p.id)}
                      >
                        <FileText className="mr-1 h-3.5 w-3.5" />Faturar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {pedidos.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum pedido. Use "Simular pedido…" para testar o fluxo.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pedidos.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Lançamento composto do último pedido</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos[0].lancamentos.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs uppercase">{l.tipo}</TableCell>
                  <TableCell>{l.descricao}</TableCell>
                  <TableCell className={`text-right tabular-nums ${l.valor < 0 ? "text-destructive" : "text-emerald-600"}`}>{formatBRL(l.valor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Logística ──────────────────────────────────────────────────────────────

function LogisticaTab() {
  const [canais] = useCanais();
  const [pedidos, setPedidos] = usePedidosMarketplace();
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const pendentes = pedidos.filter((p) => p.status === "faturado" && !p.codigoRastreio);

  async function gerarLote() {
    const ids = Array.from(selecionados);
    for (const id of ids) {
      const ped = pedidos.find((p) => p.id === id);
      const canal = canais.find((c) => c.id === ped?.canalId);
      if (!ped || !canal) continue;
      const adapter = getAdapter(canal.tipo);
      const { codigoRastreio, etiquetaUrl } = await adapter.gerarEtiqueta(canal, ped);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, codigoRastreio, etiquetaUrl, status: "expedido" } : p)));
      enfileirar({ tipo: "rastreio", canalId: canal.id, payload: { pedidoId: id, codigoRastreio } });
    }
    toast.success(`${ids.length} etiqueta(s) geradas e enfileiradas para sync`);
    setSelecionados(new Set());
  }

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{pendentes.length} pedido(s) faturado(s) aguardando expedição</div>
        <Button size="sm" disabled={selecionados.size === 0} onClick={gerarLote}>
          <Truck className="mr-1 h-3.5 w-3.5" />Gerar {selecionados.size} etiqueta(s)
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Pedido</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>NF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendentes.map((p) => {
              const canal = canais.find((c) => c.id === p.canalId);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selecionados.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Selecionar pedido ${p.numeroExterno}`}
                    />

                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.numeroExterno}</TableCell>
                  <TableCell>{canal?.nome}</TableCell>
                  <TableCell>{p.clienteNome}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.itens.map((i) => `${i.qtd}× ${i.sku}`).join(", ")}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.nfNumero}</TableCell>
                </TableRow>
              );
            })}
            {pendentes.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nada para expedir.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Fila ───────────────────────────────────────────────────────────────────

function FilaTab() {
  const [fila, setFila] = useFilaSync();

  function processar(id: string) {
    setFila((prev) => prev.map((f) => (f.id === id ? { ...f, status: "ok", tentativas: f.tentativas + 1 } : f)));
    toast.success("Evento processado");
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Tentativas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {fila.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono text-xs uppercase">{f.tipo}</TableCell>
              <TableCell>{f.canalId}</TableCell>
              <TableCell className="text-xs">{new Date(f.criadoEm).toLocaleString("pt-BR")}</TableCell>
              <TableCell>{f.tentativas}</TableCell>
              <TableCell>
                <Badge variant={f.status === "ok" ? "default" : f.status === "erro" ? "destructive" : "secondary"}>{f.status}</Badge>
              </TableCell>
              <TableCell>
                {f.status !== "ok" && <Button size="sm" variant="ghost" onClick={() => processar(f.id)}>Processar</Button>}
              </TableCell>
            </TableRow>
          ))}
          {fila.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Fila vazia.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Floki Insights ─────────────────────────────────────────────────────────

function FlokiTab() {
  const [canais] = useCanais();
  const [pedidos] = usePedidosMarketplace();
  const rent = useMemo(() => rentabilidadePorCanal(pedidos, canais), [pedidos, canais]);

  return (
    <div className="space-y-4">
      <FlokiAlerts limit={8} />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <FlokiBadge />
          <h3 className="text-sm font-semibold">Rentabilidade por canal</h3>
        </div>
        {rent.some((r) => r.pedidos > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rent.filter((r) => r.pedidos > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="canalNome" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="bruto" name="Bruto" fill="oklch(0.78 0.09 85)" />
              <Bar yAxisId="left" dataKey="liquido" name="Margem líquida" fill="var(--muted-foreground)" />
              <Bar yAxisId="right" dataKey="margemPct" name="Margem %" fill="hsl(var(--destructive))" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Sem pedidos para análise. Simule um pedido na aba "Pedidos".
          </div>
        )}
      </div>
    </div>
  );
}
