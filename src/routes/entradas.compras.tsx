import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useNotasEntrada, type NotaEntrada } from "@/lib/entradas-store";
import { useItensFiscais } from "@/lib/fiscal-store";
import { useContasPagar, proximoId } from "@/lib/financeiro-store";
import { useCentrosCusto } from "@/lib/centro-custo-store";
import { DataTable, type Column } from "@/components/data-table";
import { AnexarDocumento } from "@/components/anexar-documento";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { ArrowDownToLine, FileCode2, Plus, UploadCloud, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/entradas/compras")({
  component: ComprasPage,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ComprasPage() {
  const [notas, setNotas] = useNotasEntrada();
  const [, setItens] = useItensFiscais();
  const [, setTitulosPagar] = useContasPagar();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [detail, setDetail] = useState<NotaEntrada | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".xml")) {
      toast.error("Arquivo inválido", { description: "Envie um XML de NF-e modelo 55." });
      return;
    }
    setFile(f);
  }

  function importar() {
    if (!file) return;
    const id = `ne-${Date.now()}`;
    const numero = String(Math.floor(100000 + Math.random() * 900000));
    const nova: NotaEntrada = {
      id,
      numero,
      serie: "1",
      modelo: "55",
      fornecedorCnpj: "00.000.000/0001-00",
      fornecedorRazao: `Fornecedor importado (${file.name})`,
      dataEmissao: new Date().toISOString().slice(0, 10),
      dataEntrada: new Date().toISOString().slice(0, 10),
      natureza: "Compra para revenda",
      cfopPrincipal: "1102",
      valorProdutos: 2500,
      valorFrete: 0,
      valorDesconto: 0,
      valorIcms: 450,
      valorIpi: 0,
      valorPis: 41,
      valorCofins: 190,
      valorTotal: 2500,
      status: "Lançada",
      origem: "XML",
      itens: [
        {
          sku: `SKU-IMP-${numero}`,
          descricao: "Item importado via NF-e",
          ncm: "00000000",
          cfop: "1102",
          cst: "00",
          unidade: "un",
          quantidade: 1,
          valorUnitario: 2500,
          valorTotal: 2500,
        },
      ],
    };
    setNotas((prev) => [nova, ...prev]);
    // dá entrada no estoque
    setItens((prev) =>
      prev.map((it) =>
        it.sku === nova.itens[0].sku
          ? { ...it, estoqueAtual: (it.estoqueAtual ?? 0) + nova.itens[0].quantidade }
          : it,
      ),
    );
    // gera título a pagar automaticamente (fecha o ciclo Compra → Financeiro)
    setTitulosPagar((prev) => [
      {
        id: proximoId(prev, "CP"),
        documento: `NF ${numero}`,
        fornecedor: nova.fornecedorRazao,
        categoria: "fornecedores",
        emissao: new Date().toLocaleDateString("pt-BR"),
        vencimento: new Date(Date.now() + 30 * 86400000).toLocaleDateString("pt-BR"),
        valor: nova.valorTotal,
        juros: 0,
        multa: 0,
        totalPagar: nova.valorTotal,
        formaPgto: "boleto",
        centroCusto: "Operações",
        status: "aberto",
        origemAuto: "Entrada NF",
      },
      ...prev,
    ]);
    toast.success("NF-e importada", {
      description: `Nota ${numero} lançada, estoque atualizado e título a pagar gerado.`,
    });
    setFile(null);
    setOpen(false);
  }

  const cols: Column<NotaEntrada>[] = [
    { key: "numero", header: "Nº NF" },
    { key: "serie", header: "Série", align: "center" },
    { key: "fornecedorRazao", header: "Fornecedor" },
    { key: "fornecedorCnpj", header: "CNPJ" },
    { key: "dataEmissao", header: "Emissão" },
    { key: "dataEntrada", header: "Entrada" },
    { key: "cfopPrincipal", header: "CFOP" },
    { key: "valorTotal", header: "Total", align: "right", render: (r) => brl(r.valorTotal) },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    {
      key: "id",
      header: "",
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => setDetail(r)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Importar XML NF-e
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Entrada por NF-e modelo 55</DialogTitle>
              <DialogDescription>
                Ao importar, o sistema dá entrada no estoque, calcula custos e abre tela para
                completar o cadastro fiscal do item.
              </DialogDescription>
            </DialogHeader>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0] ?? null);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-gold bg-gold/5" : "border-border bg-secondary/30 hover:border-gold/60"
              }`}
            >
              {file ? (
                <>
                  <FileCode2 className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Solte o XML aqui</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".xml,text/xml,application/xml"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={!file}
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={importar}
              >
                Processar XML
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <LancamentoManualDialog
          onSave={(n) => {
            setNotas((prev) => [n, ...prev]);
            setTitulosPagar((prev) => [
              {
                id: proximoId(prev, "CP"),
                documento: `${n.modelo === "55" ? "NF" : n.modelo} ${n.numero}`,
                fornecedor: n.fornecedorRazao,
                categoria: "fornecedores",
                emissao: new Date().toLocaleDateString("pt-BR"),
                vencimento: new Date(Date.now() + 30 * 86400000).toLocaleDateString("pt-BR"),
                valor: n.valorTotal,
                juros: 0,
                multa: 0,
                totalPagar: n.valorTotal,
                formaPgto: "boleto",
                centroCusto: "Operações",
                status: "aberto",
                origemAuto: "Lançamento manual",
              },
              ...prev,
            ]);
            toast.success("Título a pagar gerado automaticamente em Financeiro.");
          }}
        />
      </div>

      <DataTable
        title="Notas fiscais de entrada"
        description="Compras, devoluções e transferências recebidas — modelo 55."
        columns={cols}
        data={notas}
        filename="notas-entrada"
      />

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-3xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>
                  NF-e {detail.numero} · série {detail.serie}
                </DialogTitle>
                <DialogDescription>
                  {detail.fornecedorRazao} · {detail.fornecedorCnpj}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Info label="Natureza" value={detail.natureza} />
                <Info label="CFOP" value={detail.cfopPrincipal} />
                <Info label="Emissão" value={detail.dataEmissao} />
                <Info label="Entrada" value={detail.dataEntrada} />
                <Info label="ICMS" value={brl(detail.valorIcms)} />
                <Info label="PIS/COFINS" value={brl(detail.valorPis + detail.valorCofins)} />
                <Info label="Frete" value={brl(detail.valorFrete)} />
                <Info label="Total" value={brl(detail.valorTotal)} />
              </div>
              <div className="mt-3 overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1.5 text-left">SKU</th>
                      <th className="px-2 py-1.5 text-left">Descrição</th>
                      <th className="px-2 py-1.5 text-left">NCM</th>
                      <th className="px-2 py-1.5 text-right">Qtd</th>
                      <th className="px-2 py-1.5 text-right">Vl. Unit.</th>
                      <th className="px-2 py-1.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.itens.map((it, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1.5">{it.sku}</td>
                        <td className="px-2 py-1.5">{it.descricao}</td>
                        <td className="px-2 py-1.5">{it.ncm}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{it.quantidade}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{brl(it.valorUnitario)}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{brl(it.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <p className="mt-0.5 text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

const TIPOS_DOC = [
  { value: "55", label: "NF-e modelo 55 (mercadorias)" },
  { value: "65", label: "NFC-e modelo 65 (consumidor)" },
  { value: "nfse", label: "NFS-e (serviços tomados)" },
  { value: "cte", label: "CT-e (frete / transporte)" },
  { value: "cupom", label: "Cupom fiscal / ECF" },
  { value: "recibo", label: "Recibo / RPA" },
  { value: "fatura", label: "Fatura / Aluguel" },
  { value: "boleto", label: "Boleto / Despesa avulsa" },
  { value: "outros", label: "Outros documentos" },
] as const;

function LancamentoManualDialog({ onSave }: { onSave: (n: NotaEntrada) => void }) {
  const [open, setOpen] = useState(false);
  const [centros] = useCentrosCusto();
  const [form, setForm] = useState({
    tipo: "55",
    numero: "",
    serie: "1",
    chave: "",
    fornecedorRazao: "",
    fornecedorCnpj: "",
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataEntrada: new Date().toISOString().slice(0, 10),
    natureza: "Compra para revenda",
    cfop: "1102",
    valorProdutos: "",
    valorFrete: "0",
    valorDesconto: "0",
    valorIcms: "0",
    valorIpi: "0",
    valorPis: "0",
    valorCofins: "0",
    observacao: "",
    centroCustoId: "",
  });
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function num(v: string) {
    return Number(String(v).replace(",", ".")) || 0;
  }
  const centroSelecionado = centros.find((c) => c.id === form.centroCustoId);
  function salvar() {
    if (!form.numero || !form.fornecedorRazao || !form.valorProdutos) {
      toast.error("Campos obrigatórios", { description: "Número, fornecedor e valor são obrigatórios." });
      return;
    }
    const produtos = num(form.valorProdutos);
    const total = produtos + num(form.valorFrete) - num(form.valorDesconto);
    const nova: NotaEntrada = {
      id: `ne-${Date.now()}`,
      numero: form.numero,
      serie: form.serie,
      modelo: form.tipo === "65" ? "65" : "55",
      chave: form.chave || undefined,
      fornecedorCnpj: form.fornecedorCnpj || "—",
      fornecedorRazao: form.fornecedorRazao,
      dataEmissao: form.dataEmissao,
      dataEntrada: form.dataEntrada,
      natureza: form.natureza,
      cfopPrincipal: form.cfop,
      valorProdutos: produtos,
      valorFrete: num(form.valorFrete),
      valorDesconto: num(form.valorDesconto),
      valorIcms: num(form.valorIcms),
      valorIpi: num(form.valorIpi),
      valorPis: num(form.valorPis),
      valorCofins: num(form.valorCofins),
      valorTotal: total,
      status: "Lançada",
      origem: "Manual",
      itens: [],
    };
    onSave(nova);
    toast.success("Documento lançado", {
      description: `${TIPOS_DOC.find((t) => t.value === form.tipo)?.label.split(" ")[0]} ${form.numero} registrado.`,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-3.5 w-3.5" /> Lançamento manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lançamento manual de documento fiscal</DialogTitle>
          <DialogDescription>
            Para qualquer documento de entrada: NF-e, NFS-e tomada, CT-e, recibo, fatura, aluguel, despesas avulsas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Field label="Tipo de documento" full>
            <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_DOC.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Número *"><Input value={form.numero} onChange={(e) => set("numero", e.target.value)} /></Field>
          <Field label="Série"><Input value={form.serie} onChange={(e) => set("serie", e.target.value)} /></Field>
          <Field label="Chave de acesso" full><Input value={form.chave} onChange={(e) => set("chave", e.target.value)} placeholder="44 dígitos (opcional)" /></Field>
          <Field label="Fornecedor / Razão Social *" full><Input value={form.fornecedorRazao} onChange={(e) => set("fornecedorRazao", e.target.value)} /></Field>
          <Field label="CNPJ / CPF"><Input value={form.fornecedorCnpj} onChange={(e) => set("fornecedorCnpj", e.target.value)} /></Field>
          <Field label="Natureza da operação"><Input value={form.natureza} onChange={(e) => set("natureza", e.target.value)} /></Field>
          <Field label="Data emissão"><Input type="date" value={form.dataEmissao} onChange={(e) => set("dataEmissao", e.target.value)} /></Field>
          <Field label="Data entrada"><Input type="date" value={form.dataEntrada} onChange={(e) => set("dataEntrada", e.target.value)} /></Field>
          <Field label="CFOP"><Input value={form.cfop} onChange={(e) => set("cfop", e.target.value)} /></Field>
          <Field label="Valor produtos / serviço *"><Input value={form.valorProdutos} onChange={(e) => set("valorProdutos", e.target.value)} /></Field>
          <Field label="Frete"><Input value={form.valorFrete} onChange={(e) => set("valorFrete", e.target.value)} /></Field>
          <Field label="Desconto"><Input value={form.valorDesconto} onChange={(e) => set("valorDesconto", e.target.value)} /></Field>
          <Field label="ICMS"><Input value={form.valorIcms} onChange={(e) => set("valorIcms", e.target.value)} /></Field>
          <Field label="IPI"><Input value={form.valorIpi} onChange={(e) => set("valorIpi", e.target.value)} /></Field>
          <Field label="PIS"><Input value={form.valorPis} onChange={(e) => set("valorPis", e.target.value)} /></Field>
          <Field label="COFINS"><Input value={form.valorCofins} onChange={(e) => set("valorCofins", e.target.value)} /></Field>
          <Field label="Observações" full>
            <Textarea rows={2} value={form.observacao} onChange={(e) => set("observacao", e.target.value)} />
          </Field>
          <Field label="Centro de Custo" full>
            <Select value={form.centroCustoId} onValueChange={(v) => set("centroCustoId", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
              <SelectContent>
                {centros.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codigo} — {c.nome}
                    {c.origem === "crm" ? " ✨" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {centroSelecionado?.origem === "crm" && (
              <p className="mt-1 text-[11px] text-gold">
                ✨ Projeto identificado da Engenharia de Vendas — cliente {centroSelecionado.clienteNome}, responsável {centroSelecionado.responsavelComercial}.
              </p>
            )}
          </Field>
          <div className="col-span-2">
            <AnexarDocumento label="Anexar documento fiscal (PDF)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" onClick={salvar}>
            Lançar documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
