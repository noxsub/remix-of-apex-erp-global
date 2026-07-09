import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useNotasEntrada, type NotaEntrada, type ItemEntrada } from "@/lib/entradas-store";
import { useItensFiscais, type ItemFiscal } from "@/lib/fiscal-store";
import { useDocumentosSefaz, type DocumentoSefaz, type ItemDocumentoSefaz } from "@/lib/sefaz-store";
import { useContasPagar, proximoId } from "@/lib/financeiro-store";
import { useCentrosCusto } from "@/lib/centro-custo-store";
import { DataTable, type Column } from "@/components/data-table";
import { AnexarDocumento } from "@/components/anexar-documento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  FileText,
  Package,
  ShoppingCart,
  Receipt,
  RefreshCw,
  DownloadCloud,
  Landmark,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/entradas/")({
  component: EntradasOverview,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ═══════════════════════════════════════════════════════════════
   VISÃO GERAL DE ENTRADAS
   Últimas notas de entrada unifica: notas já lançadas + documentos
   identificados na SEFAZ (pendentes de importação, com botão
   Importar que abre o template completo da NF).
   ═══════════════════════════════════════════════════════════════ */

type LinhaUnificada = {
  origem: "lancada" | "sefaz";
  numero: string;
  fornecedor: string;
  data: string;
  cfopOuModelo: string;
  total: number;
  nota?: NotaEntrada;
  doc?: DocumentoSefaz;
};

function EntradasOverview() {
  const [notas, setNotas] = useNotasEntrada();
  const [itens, setItens] = useItensFiscais();
  const [docsSefaz, setDocsSefaz] = useDocumentosSefaz();
  const [, setTitulosPagar] = useContasPagar();
  const [sincronizando, setSincronizando] = useState(false);
  const [docParaImportar, setDocParaImportar] = useState<DocumentoSefaz | null>(null);

  const pendentesSefaz = docsSefaz.filter((d) => d.situacao === "pendente");

  const k = useMemo(() => {
    const totalCompras = notas.reduce((a, n) => a + n.valorTotal, 0);
    const totalIcms = notas.reduce((a, n) => a + n.valorIcms, 0);
    const saldoValorizado = itens.reduce(
      (a, i) => a + (i.estoqueAtual ?? 0) * (i.custoMedio ?? i.preco * 0.6),
      0,
    );
    return { totalCompras, totalIcms, saldoValorizado, qtdNotas: notas.length };
  }, [notas, itens]);

  const linhas: LinhaUnificada[] = useMemo(() => {
    const daSefaz: LinhaUnificada[] = pendentesSefaz.map((d) => ({
      origem: "sefaz",
      numero: d.numero,
      fornecedor: d.emitenteRazao,
      data: d.dataEmissao,
      cfopOuModelo: d.modelo === "57" ? "CT-e" : "NF-e",
      total: d.valorTotal,
      doc: d,
    }));
    const lancadas: LinhaUnificada[] = notas.slice(0, 10).map((n) => ({
      origem: "lancada",
      numero: n.numero,
      fornecedor: n.fornecedorRazao,
      data: n.dataEntrada,
      cfopOuModelo: n.cfopPrincipal,
      total: n.valorTotal,
      nota: n,
    }));
    return [...daSefaz, ...lancadas];
  }, [pendentesSefaz, notas]);

  const sincronizarSefaz = () => {
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      if (pendentesSefaz.length > 0) {
        toast.success(`Consulta concluída`, {
          description: `${pendentesSefaz.length} documento(s) fiscal(is) identificados contra o CNPJ da empresa.`,
        });
      } else {
        toast.info("Nenhum documento novo identificado na SEFAZ.");
      }
    }, 1400);
  };

  const importarDocumento = (
    doc: DocumentoSefaz,
    dadosEditados: { dataEntrada: string; natureza: string },
  ) => {
    /* 1. Cria a nota de entrada */
    const itensNota: ItemEntrada[] = doc.itens.map((it) => ({
      sku: it.codigo,
      descricao: it.descricao,
      ncm: it.ncm,
      cfop: it.cfopEntrada,
      cst: it.cstEntrada,
      unidade: it.unidade,
      quantidade: it.quantidade,
      valorUnitario: it.valorUnitario,
      valorTotal: it.quantidade * it.valorUnitario,
      icms: (it.quantidade * it.valorUnitario * it.aliqIcmsEntrada) / 100,
      ipi: (it.quantidade * it.valorUnitario * it.aliqIpiEntrada) / 100,
      pis: (it.quantidade * it.valorUnitario * it.aliqPisEntrada) / 100,
      cofins: (it.quantidade * it.valorUnitario * it.aliqCofinsEntrada) / 100,
    }));
    const nova: NotaEntrada = {
      id: `ne-sefaz-${doc.id}`,
      numero: doc.numero,
      serie: doc.serie,
      modelo: doc.modelo === "57" ? "55" : doc.modelo,
      chave: doc.chave,
      fornecedorCnpj: doc.emitenteCnpj,
      fornecedorRazao: doc.emitenteRazao,
      dataEmissao: doc.dataEmissao,
      dataEntrada: dadosEditados.dataEntrada,
      natureza: dadosEditados.natureza,
      cfopPrincipal: doc.itens[0]?.cfopEntrada ?? "1102",
      valorProdutos: doc.valorTotal,
      valorFrete: 0,
      valorDesconto: 0,
      valorIcms: itensNota.reduce((a, i) => a + (i.icms ?? 0), 0),
      valorIpi: itensNota.reduce((a, i) => a + (i.ipi ?? 0), 0),
      valorPis: itensNota.reduce((a, i) => a + (i.pis ?? 0), 0),
      valorCofins: itensNota.reduce((a, i) => a + (i.cofins ?? 0), 0),
      valorTotal: doc.valorTotal,
      status: "Lançada",
      origem: "Importação",
      itens: itensNota,
    };
    setNotas((prev) => [nova, ...prev]);

    /* 2. Atualiza estoque — soma se o SKU existe, cadastra item fiscal completo se não existe */
    setItens((prev) => {
      const atualizados = [...prev];
      for (const it of doc.itens) {
        if (it.unidade === "SV") continue; // serviço de frete não vira estoque
        const idx = atualizados.findIndex((p) => p.sku === it.codigo);
        if (idx >= 0) {
          atualizados[idx] = {
            ...atualizados[idx],
            estoqueAtual: (atualizados[idx].estoqueAtual ?? 0) + it.quantidade,
            custoMedio: it.valorUnitario,
          };
        } else {
          const novoItem: ItemFiscal = {
            id: `if-${it.codigo}-${Date.now()}`,
            tipo: "produto",
            sku: it.codigo,
            nome: it.descricao,
            unidade: it.unidade,
            preco: it.precoVendaSugerido || it.valorUnitario * 1.6,
            ncm: it.ncm,
            origem: "0",
            cstCsosn: it.cstSaida !== "—" ? it.cstSaida : "00",
            aliquotas: {
              icms: it.aliqIcmsSaida,
              ipi: 0,
              pis: it.aliqPisSaida,
              cofins: it.aliqCofinsSaida,
              iss: 0,
              cbs: 0.9,
              ibs: 0.1,
              is: 0,
            },
            custoMedio: it.valorUnitario,
            estoqueAtual: it.quantidade,
            estoqueMinimo: 5,
            entrada: {
              cfopEntrada: it.cfopEntrada,
              cstEntrada: it.cstEntrada,
              creditoIcms: it.aliqIcmsEntrada,
              creditoPis: it.aliqPisEntrada,
              creditoCofins: it.aliqCofinsEntrada,
              creditoIpi: it.aliqIpiEntrada,
              origemCusto: "media",
            },
            saida: {
              cfopDentroUF: it.cfopSaida !== "—" ? it.cfopSaida : "5102",
              cfopForaUF: it.cfopSaida !== "—" ? `6${it.cfopSaida.slice(1)}` : "6102",
              cstSaida: it.cstSaida !== "—" ? it.cstSaida : "00",
              margemPadrao: 40,
            },
          };
          atualizados.push(novoItem);
        }
      }
      return atualizados;
    });

    /* 3. Gera título a pagar */
    setTitulosPagar((prev) => [
      {
        id: proximoId(prev, "CP"),
        documento: `${doc.modelo === "57" ? "CT-e" : "NF"} ${doc.numero}`,
        fornecedor: doc.emitenteRazao,
        categoria: "fornecedores",
        emissao: new Date().toLocaleDateString("pt-BR"),
        vencimento: new Date(Date.now() + 30 * 86400000).toLocaleDateString("pt-BR"),
        valor: doc.valorTotal,
        juros: 0,
        multa: 0,
        totalPagar: doc.valorTotal,
        formaPgto: "boleto",
        centroCusto: "Operações",
        status: "aberto",
        origemAuto: "Importação SEFAZ",
      },
      ...prev,
    ]);

    /* 4. Marca o documento como importado */
    setDocsSefaz((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, situacao: "importada" as const } : d)),
    );

    setDocParaImportar(null);
    toast.success(`Documento ${doc.numero} importado`, {
      description: "Nota lançada, estoque atualizado, itens cadastrados e título a pagar gerado.",
    });
  };

  const cols: Column<LinhaUnificada>[] = [
    {
      key: "numero",
      header: "NF",
      render: (r) => (
        <span className="flex items-center gap-2">
          {r.numero}
          {r.origem === "sefaz" && (
            <Badge variant="outline" className="border-gold/50 text-[9px] text-gold">
              <Landmark className="mr-1 h-2.5 w-2.5" /> SEFAZ
            </Badge>
          )}
        </span>
      ),
    },
    { key: "fornecedor", header: "Fornecedor" },
    { key: "data", header: "Data" },
    { key: "cfopOuModelo", header: "CFOP / Doc" },
    { key: "total", header: "Total", align: "right", render: (r) => brl(r.total) },
    {
      key: "acao",
      header: "",
      render: (r) =>
        r.origem === "sefaz" && r.doc ? (
          <Button
            size="sm"
            className="h-7 gap-1 bg-gradient-to-b from-[oklch(0.82_0.1_85)] to-[oklch(0.72_0.11_85)] text-primary-foreground border border-[oklch(0.62_0.1_85)]"
            onClick={() => setDocParaImportar(r.doc!)}
          >
            <DownloadCloud className="h-3 w-3" /> Importar
          </Button>
        ) : (
          <Badge variant="secondary" className="text-[10px]">Lançada</Badge>
        ),
    },
  ];

  const cards = [
    { label: "Notas de entrada", value: String(k.qtdNotas), icon: FileText },
    { label: "Compras (R$)", value: brl(k.totalCompras), icon: ShoppingCart },
    { label: "ICMS creditável", value: brl(k.totalIcms), icon: Receipt },
    { label: "Estoque valorizado", value: brl(k.saldoValorizado), icon: Package },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        title="Últimas notas de entrada"
        description={
          pendentesSefaz.length > 0
            ? `${pendentesSefaz.length} documento(s) identificados na SEFAZ aguardando importação.`
            : "Compras, devoluções e documentos identificados na SEFAZ."
        }
        columns={cols}
        data={linhas}
        filename="entradas-recentes"
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              disabled={sincronizando}
              onClick={sincronizarSefaz}
            >
              <RefreshCw className={`h-3 w-3 ${sincronizando ? "animate-spin" : ""}`} />
              {sincronizando ? "Consultando SEFAZ..." : "Sincronizar SEFAZ"}
            </Button>
            <Link
              to="/entradas/compras"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium hover:border-gold"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      {docParaImportar && (
        <ImportarNfDialog
          doc={docParaImportar}
          onCancelar={() => setDocParaImportar(null)}
          onImportar={importarDocumento}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE DE IMPORTAÇÃO — cadastro completo da NF + itens com
   configuração fiscal de entrada e de saída.
   ═══════════════════════════════════════════════════════════════ */

function ImportarNfDialog({
  doc,
  onCancelar,
  onImportar,
}: {
  doc: DocumentoSefaz;
  onCancelar: () => void;
  onImportar: (doc: DocumentoSefaz, dados: { dataEntrada: string; natureza: string }) => void;
}) {
  const [docEditado, setDocEditado] = useState<DocumentoSefaz>(doc);
  const [centros] = useCentrosCusto();
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().slice(0, 10));
  const [natureza, setNatureza] = useState(doc.natureza);

  const setItem = (idx: number, patch: Partial<DocumentoSefaz["itens"][number]>) => {
    setDocEditado((prev) => ({
      ...prev,
      itens: prev.itens.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar documento da SEFAZ — NF {doc.numero}</DialogTitle>
          <DialogDescription>
            Revise o cadastro completo da nota e a configuração fiscal de cada item antes de lançar.
          </DialogDescription>
        </DialogHeader>

        {/* ── Cabeçalho da NF ── */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Emitente</p>
            <p className="text-xs font-medium">{doc.emitenteRazao}</p>
            <p className="text-[10px] text-muted-foreground">{doc.emitenteCnpj} · {doc.emitenteUf}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Número / Série</p>
            <p className="text-xs font-medium">{doc.numero} / {doc.serie}</p>
            <p className="text-[10px] text-muted-foreground">Modelo {doc.modelo}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Emissão</p>
            <p className="text-xs font-medium">{doc.dataEmissao.split("-").reverse().join("/")}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Valor total</p>
            <p className="text-xs font-semibold text-gold">{brl(doc.valorTotal)}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-[10px] uppercase text-muted-foreground">Chave de acesso</Label>
            <p className="break-all font-mono text-[10px] text-muted-foreground">{doc.chave}</p>
          </div>
          <div>
            <Label className="text-xs">Data de entrada *</Label>
            <Input type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} className="mt-1 h-8" />
          </div>
          <div>
            <Label className="text-xs">Natureza da operação</Label>
            <Input value={natureza} onChange={(e) => setNatureza(e.target.value)} className="mt-1 h-8" />
          </div>
        </div>

        {/* ── Itens com cadastro fiscal completo ── */}
        <div className="space-y-3">
          {docEditado.itens.map((it, idx) => (
            <div key={it.codigo} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {it.codigo} — {it.descricao}
                </p>
                <Badge variant="secondary" className="text-[10px]">
                  {it.quantidade} {it.unidade} × {brl(it.valorUnitario)}
                </Badge>
              </div>

              <Tabs defaultValue="entrada">
                <TabsList className="h-8">
                  <TabsTrigger value="entrada" className="text-xs">Fiscal — Entrada</TabsTrigger>
                  <TabsTrigger value="saida" className="text-xs">Fiscal — Saída</TabsTrigger>
                  <TabsTrigger value="centro" className="text-xs">Centro de Custo</TabsTrigger>
                  <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
                  <TabsTrigger value="anexo" className="text-xs gap-1">
                    <Paperclip className="h-3 w-3" /> Anexo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="entrada" className="mt-2">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <CampoFiscal label="NCM" value={it.ncm} onChange={(v) => setItem(idx, { ncm: v })} />
                    <CampoFiscal label="CFOP Entrada" value={it.cfopEntrada} onChange={(v) => setItem(idx, { cfopEntrada: v })} />
                    <CampoFiscal label="CST" value={it.cstEntrada} onChange={(v) => setItem(idx, { cstEntrada: v })} />
                    <CampoFiscalNum label="ICMS %" value={it.aliqIcmsEntrada} onChange={(v) => setItem(idx, { aliqIcmsEntrada: v })} />
                    <CampoFiscalNum label="IPI %" value={it.aliqIpiEntrada} onChange={(v) => setItem(idx, { aliqIpiEntrada: v })} />
                    <CampoFiscalNum label="PIS/COFINS %" value={it.aliqPisEntrada + it.aliqCofinsEntrada} onChange={() => {}} readOnly />
                  </div>
                </TabsContent>

                <TabsContent value="saida" className="mt-2">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <CampoFiscal label="CFOP Saída" value={it.cfopSaida} onChange={(v) => setItem(idx, { cfopSaida: v })} />
                    <CampoFiscal label="CST Saída" value={it.cstSaida} onChange={(v) => setItem(idx, { cstSaida: v })} />
                    <CampoFiscalNum label="ICMS %" value={it.aliqIcmsSaida} onChange={(v) => setItem(idx, { aliqIcmsSaida: v })} />
                    <CampoFiscalNum label="PIS %" value={it.aliqPisSaida} onChange={(v) => setItem(idx, { aliqPisSaida: v })} />
                    <CampoFiscalNum label="COFINS %" value={it.aliqCofinsSaida} onChange={(v) => setItem(idx, { aliqCofinsSaida: v })} />
                    <CampoFiscalNum label="Preço venda R$" value={it.precoVendaSugerido} onChange={(v) => setItem(idx, { precoVendaSugerido: v })} />
                  </div>
                </TabsContent>

                <TabsContent value="centro" className="mt-2">
                  <div className="max-w-xs">
                    <Label className="text-[10px] text-muted-foreground">Centro de Custo</Label>
                    <Select value={it.centroCustoId ?? ""} onValueChange={(v) => setItem(idx, { centroCustoId: v })}>
                      <SelectTrigger className="mt-0.5 h-8 text-xs"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                      <SelectContent>
                        {centros.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.codigo} — {c.nome}{c.origem === "crm" ? " ✨" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {centros.find((c) => c.id === it.centroCustoId)?.origem === "crm" && (
                      <p className="mt-1 text-[10px] text-gold">✨ Projeto identificado da Engenharia de Vendas.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="financeiro" className="mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <CampoFiscal label="Conta Contábil" value={it.contaContabil ?? ""} onChange={(v) => setItem(idx, { contaContabil: v })} />
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Forma de Pagamento</Label>
                      <Select value={it.formaPagamento ?? "boleto"} onValueChange={(v) => setItem(idx, { formaPagamento: v as ItemDocumentoSefaz["formaPagamento"] })}>
                        <SelectTrigger className="mt-0.5 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="ted">TED</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CampoFiscal label="Condição de Pagamento" value={it.condicaoPagamento ?? ""} onChange={(v) => setItem(idx, { condicaoPagamento: v })} />
                  </div>
                </TabsContent>

                <TabsContent value="anexo" className="mt-2">
                  <div className="max-w-sm">
                    <AnexarDocumento
                      label="Anexar documento do item (PDF)"
                      onChange={(arquivo) => setItem(idx, { anexoNome: arquivo?.nome })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onCancelar}>Cancelar</Button>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-b from-[oklch(0.82_0.1_85)] to-[oklch(0.72_0.11_85)] text-primary-foreground border border-[oklch(0.62_0.1_85)]"
            onClick={() => onImportar(docEditado, { dataEntrada: dataEntrada.split("-").reverse().join("/"), natureza })}
          >
            <DownloadCloud className="h-3.5 w-3.5" /> Importar e Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampoFiscal({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 h-7 text-xs" />
    </div>
  );
}

function CampoFiscalNum({ label, value, onChange, readOnly }: { label: string; value: number; onChange: (v: number) => void; readOnly?: boolean }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="0.01"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 h-7 text-xs"
      />
    </div>
  );
}
