import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, FileCode2, Pencil, Plus, Sparkles, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Global ERP" },
      { name: "description", content: "Cadastro de produtos com campos fiscais avançados." },
    ],
  }),
  component: EstoquePage,
});

type Produto = {
  sku: string;
  nome: string;
  ncm: string;
  cfop: string;
  cest: string;
  origem: string;
  estoque: number;
  custo: string;
  preco: string;
  status: string;
  cbs?: number;
  ibs?: number;
  seletivo?: number;
};

const produtosIniciais: Produto[] = [
  { sku: "SKU-10042", nome: "Notebook Pro 14\" M3", ncm: "8471.30.12", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 184, custo: "R$ 4.820,00", preco: "R$ 7.299,00", status: "Ativo" },
  { sku: "SKU-10043", nome: "Monitor UltraWide 34\"", ncm: "8528.52.20", cfop: "5102", cest: "21.053.00", origem: "1 - Importado", estoque: 42, custo: "R$ 2.180,00", preco: "R$ 3.499,00", status: "Ativo" },
  { sku: "SKU-10044", nome: "Teclado Mecânico RGB", ncm: "8471.60.52", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 8, custo: "R$ 320,00", preco: "R$ 599,00", status: "Baixo" },
  { sku: "SKU-10045", nome: "Mouse Ergonômico Vertical", ncm: "8471.60.53", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 312, custo: "R$ 140,00", preco: "R$ 289,00", status: "Ativo" },
  { sku: "SKU-10046", nome: "Headset Wireless ANC", ncm: "8518.30.00", cfop: "5102", cest: "21.052.00", origem: "2 - Estrangeira", estoque: 64, custo: "R$ 680,00", preco: "R$ 1.199,00", status: "Ativo" },
];

type Movimentacao = {
  data: string;
  documento: string;
  tipo: string;
  sku: string;
  quantidade: number;
  responsavel: string;
};

const movimentacoes: Movimentacao[] = [
  { data: "08/06/2026", documento: "NF-E 12458", tipo: "Saída", sku: "SKU-10042", quantidade: 4, responsavel: "M. Almeida" },
  { data: "08/06/2026", documento: "NF-E 778-IN", tipo: "Entrada", sku: "SKU-10043", quantidade: 12, responsavel: "L. Costa" },
  { data: "07/06/2026", documento: "NF-E 12455", tipo: "Saída", sku: "SKU-10046", quantidade: 2, responsavel: "M. Almeida" },
  { data: "07/06/2026", documento: "AJ-0094", tipo: "Ajuste", sku: "SKU-10044", quantidade: -1, responsavel: "Sistema" },
];

const colMov: Column<Movimentacao>[] = [
  { key: "data", header: "Data" },
  { key: "documento", header: "Documento" },
  { key: "tipo", header: "Tipo" },
  { key: "sku", header: "SKU" },
  { key: "quantidade", header: "Qtd", align: "right" },
  { key: "responsavel", header: "Responsável" },
];

function EstoquePage() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [updatedSkus, setUpdatedSkus] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".xml")) {
      toast.error("Arquivo inválido", { description: "Envie um arquivo XML de NF-e." });
      return;
    }
    setFile(f);
  }

  function confirmImport() {
    if (!file) return;
    // Simula atualização: incrementa estoque dos 2 primeiros produtos e marca como atualizados
    const alvos = produtos.slice(0, 2).map((p) => p.sku);
    setProdutos((prev) =>
      prev.map((p) =>
        alvos.includes(p.sku)
          ? { ...p, estoque: p.estoque + (p.sku === alvos[0] ? 10 : 5) }
          : p,
      ),
    );
    setUpdatedSkus(new Set(alvos));
    toast.success("XML processado", {
      description: `${alvos.length} produto(s) atualizado(s) — destacados na tabela.`,
    });
    setFile(null);
    setOpen(false);
    // Remove o destaque após 12s
    window.setTimeout(() => setUpdatedSkus(new Set()), 12000);
  }

  function openNovo() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Produto) {
    setEditing(p);
    setFormOpen(true);
  }

  const colunas: Column<Produto>[] = [
    { key: "sku", header: "SKU", render: (r) => (
      <div className="flex items-center gap-2">
        <span>{r.sku}</span>
        {updatedSkus.has(r.sku) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
            <Sparkles className="h-2.5 w-2.5" /> Atualizado via XML
          </span>
        )}
      </div>
    ) },
    { key: "nome", header: "Produto" },
    { key: "ncm", header: "NCM" },
    { key: "cfop", header: "CFOP" },
    { key: "cest", header: "CEST" },
    { key: "origem", header: "Origem" },
    { key: "estoque", header: "Estoque", align: "right" },
    { key: "custo", header: "Custo", align: "right" },
    { key: "preco", header: "Preço", align: "right" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "sku", header: "", render: (r) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => openEdit(r)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  return (
    <AppShell
      title="Estoque"
      subtitle="Produtos, parâmetros fiscais e movimentação."
      actions={
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
                <ArrowDownToLine className="h-3.5 w-3.5" /> Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Entrada por NF-e de compra</DialogTitle>
                <DialogDescription>
                  Arraste o XML da nota de compra para atualizar o saldo de estoque e custos automaticamente.
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
                  dragging
                    ? "border-gold bg-gold/5"
                    : "border-border bg-secondary/30 hover:border-gold/60"
                }`}
              >
                {file ? (
                  <>
                    <FileCode2 className="h-8 w-8 text-gold" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · pronto para processar
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Solte o arquivo XML aqui
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ou clique para selecionar do seu computador
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!file}
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={confirmImport}
                >
                  Processar XML
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
            <ArrowUpFromLine className="h-3.5 w-3.5" /> Saída
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
            onClick={openNovo}
          >
            <Plus className="h-3.5 w-3.5" /> Novo produto
          </Button>
          <ProdutoFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            produto={editing}
            onSave={(p) => {
              setProdutos((prev) => {
                const i = prev.findIndex((x) => x.sku === p.sku);
                if (i === -1) return [...prev, p];
                const next = [...prev];
                next[i] = p;
                return next;
              });
              setFormOpen(false);
              toast.success(editing ? "Produto atualizado" : "Produto cadastrado", {
                description: `${p.sku} — ${p.nome}`,
              });
            }}
          />
        </>
      }
    >
      <div className="space-y-4">
        <DataTable
          title="Catálogo de produtos"
          description="Cadastro fiscal completo: NCM, CFOP, CEST e origem."
          columns={colunas}
          data={produtos}
          filename="produtos"
          rowClassName={(r) =>
            updatedSkus.has(r.sku)
              ? "bg-gold/5 ring-1 ring-inset ring-gold/30 animate-pulse"
              : undefined
          }
        />
        <DataTable
          title="Movimentações recentes"
          description="Entradas, saídas e ajustes de inventário."
          columns={colMov}
          data={movimentacoes}
          filename="movimentacoes"
        />
      </div>
    </AppShell>
  );
}

function ProdutoFormDialog({
  open,
  onOpenChange,
  produto,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto: Produto | null;
  onSave: (p: Produto) => void;
}) {
  const empty: Produto = {
    sku: "",
    nome: "",
    ncm: "",
    cfop: "5102",
    cest: "",
    origem: "0 - Nacional",
    estoque: 0,
    custo: "R$ 0,00",
    preco: "R$ 0,00",
    status: "Ativo",
    cbs: 0,
    ibs: 0,
    seletivo: 0,
  };
  const [form, setForm] = useState<Produto>(produto ?? empty);
  // Sync when produto prop changes
  const key = produto?.sku ?? "__novo__";
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) setForm(produto ?? empty);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Preencha os dados cadastrais, fiscais e de preço.
          </DialogDescription>
        </DialogHeader>
        <Tabs key={key} defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
            <TabsTrigger value="reforma">Impostos (Reforma Tributária)</TabsTrigger>
            <TabsTrigger value="precos">Estoque & Preços</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4 grid grid-cols-2 gap-3">
            <Field label="SKU">
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU-00000"
              />
            </Field>
            <Field label="Status">
              <Input
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
            </Field>
            <Field label="Nome do produto" className="col-span-2">
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Field>
            <Field label="Origem" className="col-span-2">
              <Input
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
              />
            </Field>
          </TabsContent>

          <TabsContent value="fiscal" className="mt-4 grid grid-cols-2 gap-3">
            <Field label="NCM">
              <Input
                value={form.ncm}
                onChange={(e) => setForm({ ...form, ncm: e.target.value })}
                placeholder="0000.00.00"
              />
            </Field>
            <Field label="CFOP">
              <Input
                value={form.cfop}
                onChange={(e) => setForm({ ...form, cfop: e.target.value })}
              />
            </Field>
            <Field label="CEST">
              <Input
                value={form.cest}
                onChange={(e) => setForm({ ...form, cest: e.target.value })}
                placeholder="00.000.00"
              />
            </Field>
          </TabsContent>

          <TabsContent value="reforma" className="mt-4 space-y-3">
            <div className="rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
              Parâmetros da Reforma Tributária (LC 214/2025) aplicáveis a partir do
              período de transição.
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Alíquota CBS (%)">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.cbs ?? 0}
                  onChange={(e) => setForm({ ...form, cbs: Number(e.target.value) })}
                />
              </Field>
              <Field label="Alíquota IBS (%)">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.ibs ?? 0}
                  onChange={(e) => setForm({ ...form, ibs: Number(e.target.value) })}
                />
              </Field>
              <Field label="Imposto Seletivo (R$)">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.seletivo ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, seletivo: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="precos" className="mt-4 grid grid-cols-3 gap-3">
            <Field label="Estoque atual">
              <Input
                type="number"
                value={form.estoque}
                onChange={(e) =>
                  setForm({ ...form, estoque: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Custo">
              <Input
                value={form.custo}
                onChange={(e) => setForm({ ...form, custo: e.target.value })}
              />
            </Field>
            <Field label="Preço de venda">
              <Input
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
              />
            </Field>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onSave(form)}
            disabled={!form.sku || !form.nome}
          >
            Salvar produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}