import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Download } from "lucide-react";

export const Route = createFileRoute("/financeiro/dre")({ component: DREPage });

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type LinhaDRE = { descricao: string; valor: number; nivel: number; tipo: "receita" | "deducao" | "custo" | "despesa" | "subtotal" | "resultado" };

const dre: LinhaDRE[] = [
  { descricao: "RECEITA OPERACIONAL BRUTA", valor: 845000, nivel: 0, tipo: "receita" },
  { descricao: "Venda de Mercadorias", valor: 549250, nivel: 1, tipo: "receita" },
  { descricao: "Prestação de Serviços", valor: 211250, nivel: 1, tipo: "receita" },
  { descricao: "Revenda", valor: 84500, nivel: 1, tipo: "receita" },
  { descricao: "(-) DEDUÇÕES DA RECEITA", valor: -186735, nivel: 0, tipo: "deducao" },
  { descricao: "ICMS sobre vendas", valor: -152100, nivel: 1, tipo: "deducao" },
  { descricao: "PIS sobre faturamento", valor: -13942.5, nivel: 1, tipo: "deducao" },
  { descricao: "COFINS sobre faturamento", valor: -64220, nivel: 1, tipo: "deducao" },
  { descricao: "ISS sobre serviços", valor: -10562.5, nivel: 1, tipo: "deducao" },
  { descricao: "Devoluções e abatimentos", valor: -5910, nivel: 1, tipo: "deducao" },
  { descricao: "RECEITA OPERACIONAL LÍQUIDA", valor: 658265, nivel: 0, tipo: "subtotal" },
  { descricao: "(-) CUSTO DAS MERCADORIAS/SERVIÇOS", valor: -362046, nivel: 0, tipo: "custo" },
  { descricao: "Matéria-prima", valor: -217227, nivel: 1, tipo: "custo" },
  { descricao: "Mão de obra direta", valor: -108614, nivel: 1, tipo: "custo" },
  { descricao: "Custos indiretos", valor: -36205, nivel: 1, tipo: "custo" },
  { descricao: "LUCRO BRUTO", valor: 296219, nivel: 0, tipo: "subtotal" },
  { descricao: "(-) DESPESAS OPERACIONAIS", valor: -178000, nivel: 0, tipo: "despesa" },
  { descricao: "Despesas administrativas", valor: -68000, nivel: 1, tipo: "despesa" },
  { descricao: "Despesas com pessoal (RH)", valor: -75000, nivel: 1, tipo: "despesa" },
  { descricao: "Despesas comerciais", valor: -18000, nivel: 1, tipo: "despesa" },
  { descricao: "Depreciação e amortização", valor: -12000, nivel: 1, tipo: "despesa" },
  { descricao: "Despesas financeiras", valor: -5000, nivel: 1, tipo: "despesa" },
  { descricao: "LUCRO OPERACIONAL (EBITDA)", valor: 118219, nivel: 0, tipo: "subtotal" },
  { descricao: "(-) IRPJ (15% + adicional 10%)", valor: -26729, nivel: 0, tipo: "deducao" },
  { descricao: "(-) CSLL (9%)", valor: -10640, nivel: 0, tipo: "deducao" },
  { descricao: "LUCRO LÍQUIDO DO EXERCÍCIO", valor: 80850, nivel: 0, tipo: "resultado" },
];

function DREPage() {
  const [periodo, setPeriodo] = useState("semestre");

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Mensal (Jun/2026)</SelectItem>
            <SelectItem value="trimestre">Trimestral (Q2/2026)</SelectItem>
            <SelectItem value="semestre">Semestral (1S/2026)</SelectItem>
            <SelectItem value="anual">Anual (2026)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-1.5"><Download className="h-3.5 w-3.5" />Exportar PDF</Button>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Demonstração do Resultado do Exercício — 1º Semestre 2026</h3>
        </div>
        <div className="divide-y divide-border">
          {dre.map((linha, i) => {
            const isTotal = linha.nivel === 0;
            const isResultado = linha.tipo === "resultado";
            const isSubtotal = linha.tipo === "subtotal";
            return (
              <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${isTotal ? "font-semibold" : ""} ${isResultado ? "bg-green-500/10 font-bold" : ""} ${isSubtotal ? "bg-secondary/50" : ""}`}>
                <span className={`text-sm ${!isTotal ? "pl-6 text-muted-foreground" : ""}`}>{linha.descricao}</span>
                <span className={`text-sm font-mono ${linha.valor < 0 ? "text-red-600" : ""} ${isResultado ? "text-green-600 text-base" : ""}`}>{fmt(linha.valor)}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Margem Líquida</span>
            <span className="text-sm font-bold text-green-600">{((80850 / 845000) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
