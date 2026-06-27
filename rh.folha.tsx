import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { Download, Printer, Calculator, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rh/folha")({ component: FolhaPage });

type FolhaItem = {
  matricula: string; nome: string; cargo: string; salarioBase: number;
  horasExtras: number; adicionalNoturno: number; insalubridade: number;
  valeTransporte: number; valeRefeicao: number; inss: number; irrf: number; fgts: number;
  totalProventos: number; totalDescontos: number; liquido: number;
};

const folhaData: FolhaItem[] = [
  { matricula: "001", nome: "João Silva", cargo: "Operador", salarioBase: 4500, horasExtras: 675, adicionalNoturno: 0, insalubridade: 900, valeTransporte: 270, valeRefeicao: 440, inss: 547.5, irrf: 412.88, fgts: 486, totalProventos: 6075, totalDescontos: 1670.38, liquido: 4404.62 },
  { matricula: "002", nome: "Maria Santos", cargo: "Analista Fiscal", salarioBase: 5200, horasExtras: 0, adicionalNoturno: 0, insalubridade: 0, valeTransporte: 312, valeRefeicao: 440, inss: 633.36, irrf: 552.12, fgts: 416, totalProventos: 5200, totalDescontos: 1937.48, liquido: 3262.52 },
  { matricula: "003", nome: "Pedro Costa", cargo: "Técnico Seg.", salarioBase: 3800, horasExtras: 285, adicionalNoturno: 190, insalubridade: 760, valeTransporte: 228, valeRefeicao: 440, inss: 452.7, irrf: 287.33, fgts: 402.8, totalProventos: 5035, totalDescontos: 1408.83, liquido: 3626.17 },
  { matricula: "004", nome: "Ana Oliveira", cargo: "Gerente Proj.", salarioBase: 8500, horasExtras: 0, adicionalNoturno: 0, insalubridade: 0, valeTransporte: 510, valeRefeicao: 440, inss: 828.38, irrf: 1142.5, fgts: 680, totalProventos: 8500, totalDescontos: 3600.88, liquido: 4899.12 },
  { matricula: "005", nome: "Carlos Souza", cargo: "Motorista", salarioBase: 3200, horasExtras: 480, adicionalNoturno: 320, insalubridade: 0, valeTransporte: 192, valeRefeicao: 440, inss: 360, irrf: 0, fgts: 320, totalProventos: 4000, totalDescontos: 992, liquido: 3008 },
  { matricula: "006", nome: "Luciana Ferreira", cargo: "Aux. Admin.", salarioBase: 2800, horasExtras: 0, adicionalNoturno: 0, insalubridade: 0, valeTransporte: 168, valeRefeicao: 440, inss: 252, irrf: 0, fgts: 224, totalProventos: 2800, totalDescontos: 860, liquido: 1940 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FolhaPage() {
  const [competencia, setCompetencia] = useState("202606");

  const totalProventos = folhaData.reduce((s, f) => s + f.totalProventos, 0);
  const totalDescontos = folhaData.reduce((s, f) => s + f.totalDescontos, 0);
  const totalLiquido = folhaData.reduce((s, f) => s + f.liquido, 0);
  const totalFgts = folhaData.reduce((s, f) => s + f.fgts, 0);
  const totalInss = folhaData.reduce((s, f) => s + f.inss, 0);

  const cols: Column<FolhaItem>[] = [
    { key: "matricula", header: "Mat." },
    { key: "nome", header: "Nome" },
    { key: "cargo", header: "Cargo" },
    { key: "salarioBase", header: "Salário", align: "right", render: (r) => fmt(r.salarioBase) },
    { key: "horasExtras", header: "H.E.", align: "right", render: (r) => fmt(r.horasExtras) },
    { key: "insalubridade", header: "Insal.", align: "right", render: (r) => fmt(r.insalubridade) },
    { key: "totalProventos", header: "Proventos", align: "right", render: (r) => fmt(r.totalProventos) },
    { key: "inss", header: "INSS", align: "right", render: (r) => fmt(r.inss) },
    { key: "irrf", header: "IRRF", align: "right", render: (r) => fmt(r.irrf) },
    { key: "fgts", header: "FGTS", align: "right", render: (r) => fmt(r.fgts) },
    { key: "totalDescontos", header: "Descontos", align: "right", render: (r) => fmt(r.totalDescontos) },
    { key: "liquido", header: "Líquido", align: "right", render: (r) => <span className="font-semibold">{fmt(r.liquido)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <Select value={competencia} onValueChange={setCompetencia}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="202606">Junho / 2026</SelectItem>
            <SelectItem value="202605">Maio / 2026</SelectItem>
            <SelectItem value="202604">Abril / 2026</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Folha calculada!")}><Calculator className="h-3.5 w-3.5" />Calcular</Button>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Holerites gerados!")}><Printer className="h-3.5 w-3.5" />Holerites</Button>
          <Button variant="outline" className="gap-1.5"><Download className="h-3.5 w-3.5" />Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Proventos</p><p className="text-lg font-bold">{fmt(totalProventos)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Descontos</p><p className="text-lg font-bold text-red-600">{fmt(totalDescontos)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Líquido Total</p><p className="text-lg font-bold text-green-600">{fmt(totalLiquido)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">FGTS Total</p><p className="text-lg font-bold">{fmt(totalFgts)}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">INSS Total</p><p className="text-lg font-bold">{fmt(totalInss)}</p></Card>
      </div>

      <DataTable columns={cols} data={folhaData} />
    </div>
  );
}
