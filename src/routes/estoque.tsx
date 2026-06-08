import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Plus } from "lucide-react";
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
};

const produtos: Produto[] = [
  { sku: "SKU-10042", nome: "Notebook Pro 14\" M3", ncm: "8471.30.12", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 184, custo: "R$ 4.820,00", preco: "R$ 7.299,00", status: "Ativo" },
  { sku: "SKU-10043", nome: "Monitor UltraWide 34\"", ncm: "8528.52.20", cfop: "5102", cest: "21.053.00", origem: "1 - Importado", estoque: 42, custo: "R$ 2.180,00", preco: "R$ 3.499,00", status: "Ativo" },
  { sku: "SKU-10044", nome: "Teclado Mecânico RGB", ncm: "8471.60.52", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 8, custo: "R$ 320,00", preco: "R$ 599,00", status: "Baixo" },
  { sku: "SKU-10045", nome: "Mouse Ergonômico Vertical", ncm: "8471.60.53", cfop: "5102", cest: "21.064.00", origem: "0 - Nacional", estoque: 312, custo: "R$ 140,00", preco: "R$ 289,00", status: "Ativo" },
  { sku: "SKU-10046", nome: "Headset Wireless ANC", ncm: "8518.30.00", cfop: "5102", cest: "21.052.00", origem: "2 - Estrangeira", estoque: 64, custo: "R$ 680,00", preco: "R$ 1.199,00", status: "Ativo" },
];

const colunas: Column<Produto>[] = [
  { key: "sku", header: "SKU" },
  { key: "nome", header: "Produto" },
  { key: "ncm", header: "NCM" },
  { key: "cfop", header: "CFOP" },
  { key: "cest", header: "CEST" },
  { key: "origem", header: "Origem" },
  { key: "estoque", header: "Estoque", align: "right" },
  { key: "custo", header: "Custo", align: "right" },
  { key: "preco", header: "Preço", align: "right" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
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
  return (
    <AppShell
      title="Estoque"
      subtitle="Produtos, parâmetros fiscais e movimentação."
      actions={
        <>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
            <ArrowDownToLine className="h-3.5 w-3.5" /> Entrada
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border">
            <ArrowUpFromLine className="h-3.5 w-3.5" /> Saída
          </Button>
          <Button size="sm" className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-3.5 w-3.5" /> Novo produto
          </Button>
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