import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useContasPagar, useContasReceber } from "@/lib/financeiro-store";
import { useCentrosCusto } from "@/lib/centro-custo-store";
import { exportToExcel } from "@/lib/export-excel";

export const Route = createFileRoute("/financeiro/fluxo")({ component: FluxoCaixaPage });

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* Converte "dd/mm/aaaa" -> Date, para ordenar e filtrar por período. */
function parseDataBR(s: string): Date {
  const [d, m, a] = s.split("/").map(Number);
  return new Date(a, (m || 1) - 1, d || 1);
}

type LinhaExtrato = {
  id: string;
  data: string;
  dataObj: Date;
  historico: string;
  documento: string;
  clienteFornecedor: string;
  centroCusto: string;
  categoria: string;
  formaPgto: string;
  entrada: number;
  saida: number;
  status: string;
};

function FluxoCaixaPage() {
  const [titulosPagar] = useContasPagar();
  const [titulosReceber] = useContasReceber();
  const [centros] = useCentrosCusto();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("todos");
  const [filtroForma, setFiltroForma] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "entrada" | "saida">("todos");

  const nomeCentro = (id?: string) => centros.find((c) => c.id === id)?.nome ?? "—";

  const linhasBrutas: LinhaExtrato[] = useMemo(() => {
    const dePagar: LinhaExtrato[] = titulosPagar.map((t) => ({
      id: `CP-${t.id}`,
      data: t.vencimento,
      dataObj: parseDataBR(t.vencimento),
      historico: t.documento,
      documento: t.documento,
      clienteFornecedor: t.fornecedor,
      centroCusto: t.centroCusto ?? nomeCentro(undefined),
      categoria: t.categoria,
      formaPgto: t.formaPgto,
      entrada: 0,
      saida: t.totalPagar,
      status: t.status,
    }));
    const deReceber: LinhaExtrato[] = titulosReceber.map((t) => ({
      id: `CR-${t.id}`,
      data: t.vencimento,
      dataObj: parseDataBR(t.vencimento),
      historico: t.documento,
      documento: t.documento,
      clienteFornecedor: t.cliente,
      centroCusto: t.centroCusto ?? nomeCentro(undefined),
      categoria: "receita",
      formaPgto: t.formaPgto,
      entrada: t.totalReceber,
      saida: 0,
      status: t.status,
    }));
    return [...dePagar, ...deReceber].sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulosPagar, titulosReceber]);

  const linhasFiltradas = useMemo(() => {
    return linhasBrutas.filter((l) => {
      if (dataInicio && l.dataObj < new Date(dataInicio)) return false;
      if (dataFim && l.dataObj > new Date(dataFim)) return false;
      if (filtroCentro !== "todos" && l.centroCusto !== filtroCentro) return false;
      if (filtroForma !== "todos" && l.formaPgto !== filtroForma) return false;
      if (filtroTipo === "entrada" && l.entrada === 0) return false;
      if (filtroTipo === "saida" && l.saida === 0) return false;
      return true;
    });
  }, [linhasBrutas, dataInicio, dataFim, filtroCentro, filtroForma, filtroTipo]);

  /* Saldo acumulado — calculado sobre a ordem cronológica filtrada */
  const linhasComSaldo = useMemo(() => {
    let saldo = 0;
    return linhasFiltradas.map((l) => {
      saldo += l.entrada - l.saida;
      return { ...l, saldoAcumulado: saldo };
    });
  }, [linhasFiltradas]);

  const totalEntradas = linhasFiltradas.reduce((s, l) => s + l.entrada, 0);
  const totalSaidas = linhasFiltradas.reduce((s, l) => s + l.saida, 0);
  const saldoFinal = totalEntradas - totalSaidas;

  const formasPagamento = [...new Set(linhasBrutas.map((l) => l.formaPgto))];
  const centrosDisponiveis = [...new Set(linhasBrutas.map((l) => l.centroCusto).filter((c) => c !== "—"))];

  const cols: Column<typeof linhasComSaldo[number]>[] = [
    { key: "data", header: "Data" },
    { key: "historico", header: "Histórico" },
    { key: "documento", header: "Documento" },
    { key: "clienteFornecedor", header: "Cliente/Fornecedor" },
    { key: "centroCusto", header: "Centro de Custo" },
    { key: "categoria", header: "Categoria" },
    { key: "formaPgto", header: "Forma Pgto." },
    { key: "entrada", header: "Entrada", align: "right", render: (r) => (r.entrada > 0 ? <span className="text-green-600">{brl(r.entrada)}</span> : "—") },
    { key: "saida", header: "Saída", align: "right", render: (r) => (r.saida > 0 ? <span className="text-red-600">{brl(r.saida)}</span> : "—") },
    { key: "saldoAcumulado", header: "Saldo Acumulado", align: "right", render: (r) => (
      <span className={r.saldoAcumulado >= 0 ? "font-semibold text-foreground" : "font-semibold text-red-600"}>{brl(r.saldoAcumulado)}</span>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Total Entradas</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-1 text-lg font-bold text-green-600">{brl(totalEntradas)}</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Total Saídas</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-1 text-lg font-bold text-red-600">{brl(totalSaidas)}</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Saldo do Período</p>
            <Wallet className="h-4 w-4 text-gold" />
          </div>
          <p className={`mt-1 text-lg font-bold ${saldoFinal >= 0 ? "" : "text-red-600"}`}>{brl(saldoFinal)}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Lançamentos</p>
          <p className="mt-1 text-lg font-bold">{linhasFiltradas.length}</p>
        </Card>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">De</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Até</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Centro de Custo</Label>
            <Select value={filtroCentro} onValueChange={setFiltroCentro}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {centrosDisponiveis.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Forma de Pagamento</Label>
            <Select value={filtroForma} onValueChange={setFiltroForma}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {formasPagamento.map((f) => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Tipo</Label>
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as typeof filtroTipo)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Entradas e Saídas</SelectItem>
                <SelectItem value="entrada">Só Entradas</SelectItem>
                <SelectItem value="saida">Só Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <DataTable
        title="Extrato Financeiro"
        description="Contas a Pagar e Contas a Receber unificadas, linha a linha, ordenadas por data — clique nas colunas para reordenar."
        columns={cols}
        data={linhasComSaldo}
        filename="fluxo-de-caixa"
      />
    </div>
  );
}
