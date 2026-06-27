import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { Download, Search, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rh/ponto")({ component: PontoPage });

type RegistroPonto = {
  matricula: string; nome: string; data: string; entrada1: string; saida1: string;
  entrada2: string; saida2: string; totalHoras: string; horasExtras: string;
  status: "regular" | "falta" | "atraso" | "hora_extra" | "feriado";
};

const pontoData: RegistroPonto[] = [
  { matricula: "001", nome: "João Silva", data: "26/06/2026", entrada1: "07:55", saida1: "12:00", entrada2: "13:00", saida2: "17:58", totalHoras: "09:03", horasExtras: "01:03", status: "hora_extra" },
  { matricula: "002", nome: "Maria Santos", data: "26/06/2026", entrada1: "08:00", saida1: "12:00", entrada2: "13:00", saida2: "17:00", totalHoras: "08:00", horasExtras: "00:00", status: "regular" },
  { matricula: "004", nome: "Ana Oliveira", data: "26/06/2026", entrada1: "08:15", saida1: "12:00", entrada2: "13:00", saida2: "17:00", totalHoras: "07:45", horasExtras: "00:00", status: "atraso" },
  { matricula: "005", nome: "Carlos Souza", data: "26/06/2026", entrada1: "06:00", saida1: "12:00", entrada2: "13:00", saida2: "18:00", totalHoras: "11:00", horasExtras: "03:00", status: "hora_extra" },
  { matricula: "006", nome: "Luciana Ferreira", data: "26/06/2026", entrada1: "—", saida1: "—", entrada2: "—", saida2: "—", totalHoras: "00:00", horasExtras: "00:00", status: "falta" },
];

function PontoPage() {
  const [filtro, setFiltro] = useState("");
  const [data, setData] = useState("2026-06-26");

  const filtrados = pontoData.filter(p => !filtro || p.nome.toLowerCase().includes(filtro.toLowerCase()));

  const cols: Column<RegistroPonto>[] = [
    { key: "matricula", header: "Mat." },
    { key: "nome", header: "Nome" },
    { key: "data", header: "Data" },
    { key: "entrada1", header: "Entrada 1" },
    { key: "saida1", header: "Saída 1" },
    { key: "entrada2", header: "Entrada 2" },
    { key: "saida2", header: "Saída 2" },
    { key: "totalHoras", header: "Total", render: (r) => <span className="font-mono">{r.totalHoras}</span> },
    { key: "horasExtras", header: "H.E.", render: (r) => <span className="font-mono">{r.horasExtras}</span> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "regular" ? "default" : r.status === "falta" ? "destructive" : r.status === "atraso" ? "secondary" : "outline"}>{r.status.replace("_", " ")}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar funcionário..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
          </div>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-[180px]" />
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Espelho de ponto exportado!")}><Download className="h-3.5 w-3.5" />Espelho de Ponto</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Presentes</p><p className="text-lg font-bold text-green-600">{pontoData.filter(p => p.status !== "falta").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Faltas</p><p className="text-lg font-bold text-red-600">{pontoData.filter(p => p.status === "falta").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Atrasos</p><p className="text-lg font-bold text-amber-600">{pontoData.filter(p => p.status === "atraso").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">H. Extras</p><p className="text-lg font-bold text-blue-600">{pontoData.filter(p => p.status === "hora_extra").length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">De Férias</p><p className="text-lg font-bold">1</p></Card>
      </div>

      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
