import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Search, Truck, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/entradas/frete-cte")({ component: FreteCTePage });

type CTe = {
  id: string; numero: string; serie: string; chaveAcesso: string;
  transportadora: string; cnpjTransp: string;
  remetente: string; destinatario: string;
  ufOrigem: string; ufDestino: string;
  modal: "rodoviário" | "aéreo" | "aquaviário" | "ferroviário" | "dutoviário";
  tipoDoc: "CT-e" | "DACTE" | "MDF-e";
  valorFrete: number; valorCarga: number; pesoBruto: number;
  icmsFrete: number; creditoICMS: number;
  pisCreditavel: number; cofinsCreditavel: number;
  dataEmissao: string; nfVinculada?: string;
  status: "autorizado" | "cancelado" | "anulado";
};

const ctesIniciais: CTe[] = [
  { id: "CT-001", numero: "000512", serie: "001", chaveAcesso: "35260611222333000144570010005120001234567890", transportadora: "Transportadora Rápida SA", cnpjTransp: "11.222.333/0001-44", remetente: "BRDrilling Equipamentos", destinatario: "FS Perfurações", ufOrigem: "MG", ufDestino: "SP", modal: "rodoviário", tipoDoc: "CT-e", valorFrete: 4500, valorCarga: 120000, pesoBruto: 2500, icmsFrete: 810, creditoICMS: 810, pisCreditavel: 74.25, cofinsCreditavel: 342, dataEmissao: "25/06/2026", nfVinculada: "NF-e 000184", status: "autorizado" },
  { id: "CT-002", numero: "000513", serie: "001", chaveAcesso: "35260611222333000144570010005130009876543210", transportadora: "Transportadora Rápida SA", cnpjTransp: "11.222.333/0001-44", remetente: "Fornecedor ABC", destinatario: "FS Perfurações", ufOrigem: "PR", ufDestino: "SP", modal: "rodoviário", tipoDoc: "CT-e", valorFrete: 2800, valorCarga: 45000, pesoBruto: 800, icmsFrete: 336, creditoICMS: 336, pisCreditavel: 46.2, cofinsCreditavel: 212.8, dataEmissao: "22/06/2026", nfVinculada: "NF-e 000180", status: "autorizado" },
  { id: "CT-003", numero: "000510", serie: "001", chaveAcesso: "35260611222333000144570010005100001111222233", transportadora: "Log Express Ltda", cnpjTransp: "55.666.777/0001-88", remetente: "Indústria XYZ", destinatario: "FS Perfurações", ufOrigem: "SC", ufDestino: "SP", modal: "rodoviário", tipoDoc: "CT-e", valorFrete: 6200, valorCarga: 250000, pesoBruto: 5000, icmsFrete: 744, creditoICMS: 744, pisCreditavel: 102.3, cofinsCreditavel: 471.2, dataEmissao: "18/06/2026", status: "autorizado" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FreteCTePage() {
  const [ctes] = useState(ctesIniciais);
  const [filtro, setFiltro] = useState("");
  const filtrados = ctes.filter(c => !filtro || c.transportadora.toLowerCase().includes(filtro.toLowerCase()) || c.numero.includes(filtro));

  const totalCreditoICMS = ctes.filter(c => c.status === "autorizado").reduce((s, c) => s + c.creditoICMS, 0);
  const totalCreditoPIS = ctes.filter(c => c.status === "autorizado").reduce((s, c) => s + c.pisCreditavel, 0);
  const totalCreditoCOFINS = ctes.filter(c => c.status === "autorizado").reduce((s, c) => s + c.cofinsCreditavel, 0);

  const cols: Column<CTe>[] = [
    { key: "tipoDoc", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipoDoc}</Badge> },
    { key: "numero", header: "Número", render: (r) => `${r.serie}-${r.numero}` },
    { key: "transportadora", header: "Transportadora" },
    { key: "ufOrigem", header: "Origem", render: (r) => `${r.ufOrigem} → ${r.ufDestino}` },
    { key: "modal", header: "Modal" },
    { key: "valorFrete", header: "Frete", align: "right", render: (r) => fmt(r.valorFrete) },
    { key: "creditoICMS", header: "Créd. ICMS", align: "right", render: (r) => fmt(r.creditoICMS) },
    { key: "pisCreditavel", header: "Créd. PIS", align: "right", render: (r) => fmt(r.pisCreditavel) },
    { key: "cofinsCreditavel", header: "Créd. COFINS", align: "right", render: (r) => fmt(r.cofinsCreditavel) },
    { key: "dataEmissao", header: "Emissão" },
    { key: "nfVinculada", header: "NF Vinculada", render: (r) => r.nfVinculada || "—" },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "autorizado" ? "default" : "destructive"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar CT-e..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => toast.info("Importação de XML de CT-e em desenvolvimento", { description: "Use Entradas → Documentos Fiscais para importar via SEFAZ enquanto isso." })}><Download className="h-3.5 w-3.5" />Importar XML</Button>
          <Button className="gap-1.5" onClick={() => toast.info("Lançamento manual de CT-e em desenvolvimento")}><Plus className="h-3.5 w-3.5" />Novo CT-e</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">CT-e Autorizados</p><p className="text-lg font-bold">{ctes.filter(c => c.status === "autorizado").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Frete</p><p className="text-lg font-bold">{fmt(ctes.reduce((s, c) => s + c.valorFrete, 0))}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Créd. ICMS</p><p className="text-lg font-bold text-green-600">{fmt(totalCreditoICMS)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Créd. PIS</p><p className="text-lg font-bold text-green-600">{fmt(totalCreditoPIS)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Créd. COFINS</p><p className="text-lg font-bold text-green-600">{fmt(totalCreditoCOFINS)}</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
