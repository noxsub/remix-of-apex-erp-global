import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";

export const Route = createFileRoute("/rh/beneficios")({ component: BeneficiosPage });

type Beneficio = { nome: string; tipo: string; valor: number; funcionarios: number; custoTotal: number; operadora: string; status: "ativo" | "suspenso" };

const beneficios: Beneficio[] = [
  { nome: "Vale Transporte", tipo: "Obrigatório", valor: 300, funcionarios: 12, custoTotal: 3600, operadora: "SPTrans", status: "ativo" },
  { nome: "Vale Refeição", tipo: "CCT", valor: 440, funcionarios: 14, custoTotal: 6160, operadora: "Sodexo", status: "ativo" },
  { nome: "Plano de Saúde", tipo: "Opcional", valor: 680, funcionarios: 14, custoTotal: 9520, operadora: "Unimed", status: "ativo" },
  { nome: "Plano Odontológico", tipo: "Opcional", valor: 85, funcionarios: 10, custoTotal: 850, operadora: "OdontoPrev", status: "ativo" },
  { nome: "Seguro de Vida", tipo: "CCT", valor: 45, funcionarios: 14, custoTotal: 630, operadora: "Porto Seguro", status: "ativo" },
  { nome: "Cesta Básica", tipo: "CCT", valor: 220, funcionarios: 14, custoTotal: 3080, operadora: "Cestão SP", status: "ativo" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function BeneficiosPage() {
  const totalCusto = beneficios.reduce((s, b) => s + b.custoTotal, 0);

  const cols: Column<Beneficio>[] = [
    { key: "nome", header: "Benefício" },
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipo}</Badge> },
    { key: "valor", header: "Valor/Func.", align: "right", render: (r) => fmt(r.valor) },
    { key: "funcionarios", header: "Beneficiários", align: "right" },
    { key: "custoTotal", header: "Custo Total", align: "right", render: (r) => fmt(r.custoTotal) },
    { key: "operadora", header: "Operadora" },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "ativo" ? "default" : "destructive"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Benefícios</p><p className="text-lg font-bold">{beneficios.length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Custo Mensal</p><p className="text-lg font-bold">{fmt(totalCusto)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Custo/Funcionário</p><p className="text-lg font-bold">{fmt(totalCusto / 14)}</p></Card>
      </div>
      <DataTable columns={cols} data={beneficios} />
    </div>
  );
}
