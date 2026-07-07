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
import { Plus, Search, Eye, FileText, Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/entradas/fornecedores")({ component: FornecedoresEntradaPage });

type FornecedorDoc = {
  id: string; razaoSocial: string; cnpj: string; ie: string; uf: string;
  tipoDoc: "NF-e" | "NFS-e" | "CT-e" | "DACTE" | "Telecom" | "Energia" | "Água";
  ultimaEntrada: string; totalCompras: number; qtdNotas: number;
  retencaoINSS: boolean; retencaoCSRF: boolean; retencaoISS: boolean;
  status: "ativo" | "inativo" | "bloqueado";
};

const fornecedores: FornecedorDoc[] = [
  { id: "F-001", razaoSocial: "BRDrilling Equipamentos Ltda", cnpj: "12.345.678/0001-99", ie: "123.456.789.000", uf: "SP", tipoDoc: "NF-e", ultimaEntrada: "25/06/2026", totalCompras: 450000, qtdNotas: 12, retencaoINSS: false, retencaoCSRF: false, retencaoISS: false, status: "ativo" },
  { id: "F-002", razaoSocial: "Polêmica Serviços Básicos Ltda", cnpj: "98.765.432/0001-11", ie: "ISENTO", uf: "RJ", tipoDoc: "NFS-e", ultimaEntrada: "20/06/2026", totalCompras: 185000, qtdNotas: 8, retencaoINSS: true, retencaoCSRF: true, retencaoISS: true, status: "ativo" },
  { id: "F-003", razaoSocial: "Transportadora Rápida SA", cnpj: "11.222.333/0001-44", ie: "111.222.333.444", uf: "MG", tipoDoc: "CT-e", ultimaEntrada: "22/06/2026", totalCompras: 67000, qtdNotas: 24, retencaoINSS: false, retencaoCSRF: false, retencaoISS: false, status: "ativo" },
  { id: "F-004", razaoSocial: "CPFL Energia SA", cnpj: "33.050.196/0001-88", ie: "244.032.710.114", uf: "SP", tipoDoc: "Energia", ultimaEntrada: "10/06/2026", totalCompras: 42000, qtdNotas: 6, retencaoINSS: false, retencaoCSRF: false, retencaoISS: false, status: "ativo" },
  { id: "F-005", razaoSocial: "Vivo Telecomunicações SA", cnpj: "02.558.157/0001-62", ie: "ISENTO", uf: "SP", tipoDoc: "Telecom", ultimaEntrada: "05/06/2026", totalCompras: 18000, qtdNotas: 6, retencaoINSS: false, retencaoCSRF: false, retencaoISS: false, status: "ativo" },
  { id: "F-006", razaoSocial: "Carioca Engenharia SA", cnpj: "55.666.777/0001-88", ie: "ISENTO", uf: "RJ", tipoDoc: "NFS-e", ultimaEntrada: "18/06/2026", totalCompras: 320000, qtdNotas: 4, retencaoINSS: true, retencaoCSRF: true, retencaoISS: true, status: "ativo" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FornecedoresEntradaPage() {
  const [filtro, setFiltro] = useState("");
  const filtrados = fornecedores.filter(f => !filtro || f.razaoSocial.toLowerCase().includes(filtro.toLowerCase()) || f.cnpj.includes(filtro));

  const cols: Column<FornecedorDoc>[] = [
    { key: "razaoSocial", header: "Razão Social" },
    { key: "cnpj", header: "CNPJ" },
    { key: "uf", header: "UF" },
    { key: "tipoDoc", header: "Tipo Doc", render: (r) => <Badge variant="outline">{r.tipoDoc}</Badge> },
    { key: "qtdNotas", header: "Notas", align: "right" },
    { key: "totalCompras", header: "Total Compras", align: "right", render: (r) => fmt(r.totalCompras) },
    { key: "ultimaEntrada", header: "Última Entrada" },
    { key: "retencaoINSS", header: "Ret. INSS", render: (r) => r.retencaoINSS ? <Badge>Sim</Badge> : <Badge variant="outline">Não</Badge> },
    { key: "retencaoCSRF", header: "Ret. CSRF", render: (r) => r.retencaoCSRF ? <Badge>Sim</Badge> : <Badge variant="outline">Não</Badge> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "ativo" ? "default" : "destructive"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar fornecedor..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-8" />
        </div>
        <Button className="gap-1.5" onClick={() => toast.info("Cadastre o fornecedor em Cadastros → Fornecedores", { description: "Esta tela reflete automaticamente o cadastro central assim que houver documentos lançados." })}><Plus className="h-3.5 w-3.5" />Novo Fornecedor</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Fornecedores</p><p className="text-lg font-bold">{fornecedores.length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Com Retenção</p><p className="text-lg font-bold text-amber-600">{fornecedores.filter(f => f.retencaoINSS || f.retencaoCSRF).length}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Tipos de Doc</p><p className="text-lg font-bold">{new Set(fornecedores.map(f => f.tipoDoc)).size}</p></Card>
        <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Total Compras</p><p className="text-lg font-bold">{fmt(fornecedores.reduce((s, f) => s + f.totalCompras, 0))}</p></Card>
      </div>
      <DataTable columns={cols} data={filtrados} />
    </div>
  );
}
