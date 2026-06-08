import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { StatusBadge } from "./index";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Global ERP" },
      { name: "description", content: "Contas a pagar e receber." },
    ],
  }),
  component: FinanceiroPage,
});

type Conta = {
  documento: string;
  parceiro: string;
  emissao: string;
  vencimento: string;
  valor: string;
  status: string;
};

const receber: Conta[] = [
  { documento: "NF-12458", parceiro: "Acme Global Ltd.", emissao: "08/06/2026", vencimento: "08/07/2026", valor: "R$ 18.420,00", status: "Em aberto" },
  { documento: "NF-12457", parceiro: "Northwind Trading", emissao: "08/06/2026", vencimento: "07/07/2026", valor: "R$ 9.890,50", status: "Em aberto" },
  { documento: "NF-12450", parceiro: "Initech LLC", emissao: "01/06/2026", vencimento: "01/06/2026", valor: "R$ 12.780,00", status: "Pago" },
  { documento: "NF-12440", parceiro: "Globex Corp.", emissao: "20/05/2026", vencimento: "20/05/2026", valor: "R$ 4.320,00", status: "Vencido" },
];

const pagar: Conta[] = [
  { documento: "BOL-9912", parceiro: "Fornecedor Alpha", emissao: "05/06/2026", vencimento: "20/06/2026", valor: "R$ 14.200,00", status: "Em aberto" },
  { documento: "BOL-9908", parceiro: "Energia & Cia", emissao: "01/06/2026", vencimento: "10/06/2026", valor: "R$ 3.480,00", status: "Em aberto" },
  { documento: "BOL-9899", parceiro: "Logística Express", emissao: "28/05/2026", vencimento: "05/06/2026", valor: "R$ 7.920,00", status: "Pago" },
  { documento: "BOL-9870", parceiro: "Software Vendor", emissao: "10/05/2026", vencimento: "25/05/2026", valor: "R$ 1.190,00", status: "Vencido" },
];

const cols: Column<Conta>[] = [
  { key: "documento", header: "Documento" },
  { key: "parceiro", header: "Parceiro" },
  { key: "emissao", header: "Emissão" },
  { key: "vencimento", header: "Vencimento" },
  { key: "valor", header: "Valor", align: "right" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

function FinanceiroPage() {
  const [tab, setTab] = useState<"receber" | "pagar">("receber");

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ret,.txt,.cnab,.rem";
    input.onchange = () => {
      if (input.files?.[0]) {
        toast.success(`Arquivo "${input.files[0].name}" recebido`, {
          description: "Processando retorno bancário...",
        });
      }
    };
    input.click();
  };

  return (
    <AppShell
      title="Financeiro"
      subtitle="Contas a pagar, contas a receber e conciliação bancária."
      actions={
        <>
          <Button
            size="sm"
            onClick={handleImport}
            className="h-9 gap-2 bg-gradient-to-b from-[oklch(0.82_0.1_85)] to-[oklch(0.72_0.11_85)] text-primary-foreground shadow-sm hover:opacity-95 border border-[oklch(0.62_0.1_85)]"
          >
            <Upload className="h-4 w-4" />
            Importar Arquivo de Retorno / VAN Bancária
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Lançamento
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["A Receber (mês)", "R$ 184.920", "12 títulos"],
          ["Recebidos", "R$ 96.450", "8 títulos"],
          ["A Pagar (mês)", "R$ 92.180", "9 títulos"],
          ["Vencidos", "R$ 5.510", "2 títulos"],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 inline-flex rounded-md border border-border bg-card p-1">
        {[
          { key: "receber", label: "Contas a Receber" },
          { key: "pagar", label: "Contas a Pagar" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "receber" | "pagar")}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              tab === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "receber" ? (
          <DataTable
            title="Contas a Receber"
            description="Títulos emitidos aguardando recebimento."
            columns={cols}
            data={receber}
            filename="contas-a-receber"
          />
        ) : (
          <DataTable
            title="Contas a Pagar"
            description="Compromissos financeiros do período."
            columns={cols}
            data={pagar}
            filename="contas-a-pagar"
          />
        )}
      </div>
    </AppShell>
  );
}