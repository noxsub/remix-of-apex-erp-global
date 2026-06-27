import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rh/ferias")({ component: FeriasPage });

type Ferias = {
  matricula: string; nome: string; periodoAquisitivo: string; diasDireito: number;
  diasGozados: number; diasRestantes: number; dataInicio?: string; dataFim?: string;
  abono: boolean; decimoTerceiro: "1a parcela" | "2a parcela" | "integral" | "pago";
  status: "pendente" | "programada" | "em_gozo" | "concluida" | "vencida";
};

const feriasData: Ferias[] = [
  { matricula: "001", nome: "João Silva", periodoAquisitivo: "15/03/2025 - 14/03/2026", diasDireito: 30, diasGozados: 0, diasRestantes: 30, abono: false, decimoTerceiro: "1a parcela", status: "vencida" },
  { matricula: "002", nome: "Maria Santos", periodoAquisitivo: "02/08/2025 - 01/08/2026", diasDireito: 30, diasGozados: 0, diasRestantes: 30, abono: false, decimoTerceiro: "1a parcela", status: "vencida" },
  { matricula: "003", nome: "Pedro Costa", periodoAquisitivo: "10/01/2025 - 09/01/2026", diasDireito: 30, diasGozados: 15, diasRestantes: 15, dataInicio: "20/06/2026", dataFim: "04/07/2026", abono: false, decimoTerceiro: "1a parcela", status: "em_gozo" },
  { matricula: "004", nome: "Ana Oliveira", periodoAquisitivo: "05/06/2025 - 04/06/2026", diasDireito: 30, diasGozados: 30, diasRestantes: 0, dataInicio: "01/05/2026", dataFim: "30/05/2026", abono: true, decimoTerceiro: "pago", status: "concluida" },
  { matricula: "005", nome: "Carlos Souza", periodoAquisitivo: "20/11/2024 - 19/11/2025", diasDireito: 30, diasGozados: 0, diasRestantes: 30, dataInicio: "01/08/2026", dataFim: "30/08/2026", abono: false, decimoTerceiro: "1a parcela", status: "programada" },
];

function FeriasPage() {
  const [ferias] = useState(feriasData);

  const cols: Column<Ferias>[] = [
    { key: "matricula", header: "Mat." },
    { key: "nome", header: "Nome" },
    { key: "periodoAquisitivo", header: "Período Aquisitivo" },
    { key: "diasDireito", header: "Direito", align: "right" },
    { key: "diasGozados", header: "Gozados", align: "right" },
    { key: "diasRestantes", header: "Restantes", align: "right" },
    { key: "dataInicio", header: "Início", render: (r) => r.dataInicio || "—" },
    { key: "dataFim", header: "Fim", render: (r) => r.dataFim || "—" },
    { key: "abono", header: "Abono", render: (r) => r.abono ? <Badge variant="default">Sim</Badge> : <Badge variant="outline">Não</Badge> },
    { key: "decimoTerceiro", header: "13º", render: (r) => <Badge variant="secondary">{r.decimoTerceiro}</Badge> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "concluida" ? "default" : r.status === "vencida" ? "destructive" : r.status === "em_gozo" ? "secondary" : "outline"}>{r.status.replace("_", " ")}</Badge> },
  ];

  return (
    <div className="space-y-4">
      {ferias.filter(f => f.status === "vencida").length > 0 && (
        <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-destructive">{ferias.filter(f => f.status === "vencida").length} funcionário(s) com férias vencidas!</p>
            <p className="text-xs text-destructive/80 mt-1">Conforme CLT Art. 134, as férias devem ser concedidas no período de 12 meses subsequentes à data de aquisição.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Vencidas</p><p className="text-lg font-bold text-red-600">{ferias.filter(f => f.status === "vencida").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Programadas</p><p className="text-lg font-bold text-blue-600">{ferias.filter(f => f.status === "programada").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Em Gozo</p><p className="text-lg font-bold text-amber-600">{ferias.filter(f => f.status === "em_gozo").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Concluídas</p><p className="text-lg font-bold text-green-600">{ferias.filter(f => f.status === "concluida").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Pendentes</p><p className="text-lg font-bold">{ferias.filter(f => f.status === "pendente").length}</p></Card>
      </div>

      <DataTable columns={cols} data={ferias} />
    </div>
  );
}
