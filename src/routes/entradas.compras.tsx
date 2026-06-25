import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useNotasEntrada, type NotaEntrada } from "@/lib/entradas-store";
import { useItensFiscais } from "@/lib/fiscal-store";
import { DataTable, type Column } from "@/components/data-table";
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
    // dá entrada no estoque (simulado)
    setItens((prev) =>
      prev.map((it) =>
        it.sku === nova.itens[0].sku
          ? { ...it, estoqueAtual: (it.estoqueAtual ?? 0) + nova.itens[0].quantidade }
          : it,
      ),
    );
    toast.success("NF-e importada", {
      description: `Nota ${numero} lançada e itens disponibilizados para cadastro.`,
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

        <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-3.5 w-3.5" /> Lançar manualmente
        </Button>
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
