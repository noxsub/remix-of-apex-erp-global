import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCentrosCusto, proximoCodigoCC, type CentroCusto } from "@/lib/centro-custo-store";
import { useClientes } from "@/lib/erp-store";

export const Route = createFileRoute("/financeiro/centros-custo")({ component: CentrosCustoPage });

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308"];

function statusDe(c: CentroCusto): "ok" | "alerta" | "estourado" {
  const pct = c.orcamento > 0 ? (c.realizado / c.orcamento) * 100 : 0;
  if (pct > 100) return "estourado";
  if (pct >= 90) return "alerta";
  return "ok";
}

function CentrosCustoPage() {
  const [centros, setCentros] = useCentrosCusto();
  const [novoOpen, setNovoOpen] = useState(false);
  const [clientes] = useClientes();

  const cols: Column<CentroCusto>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (r) => (
        <span className="flex items-center gap-1.5">
          {r.codigo}
          {r.origem === "crm" && (
            <Badge variant="outline" className="border-gold/40 text-[9px] text-gold">
              <Sparkles className="mr-1 h-2.5 w-2.5" /> CRM
            </Badge>
          )}
        </span>
      ),
    },
    { key: "nome", header: "Centro de Custo" },
    { key: "clienteNome", header: "Cliente", render: (r) => r.clienteNome ?? "—" },
    { key: "responsavelComercial", header: "Responsável" },
    { key: "orcamento", header: "Orçamento", align: "right", render: (r) => fmt(r.orcamento) },
    { key: "realizado", header: "Realizado", align: "right", render: (r) => fmt(r.realizado) },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      render: (r) => {
        const saldo = r.orcamento - r.realizado;
        return <span className={saldo >= 0 ? "text-green-600" : "text-red-600"}>{fmt(saldo)}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const s = statusDe(r);
        return <Badge variant={s === "ok" ? "default" : s === "estourado" ? "destructive" : "secondary"}>{s}</Badge>;
      },
    },
  ];

  const pieData = useMemo(() => centros.filter((c) => c.ativo).map((c) => ({ name: c.nome, value: c.realizado || 1 })), [centros]);

  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ok" | "alerta" | "estourado">("todos");
  const [filtroOrigem, setFiltroOrigem] = useState<"todos" | "manual" | "crm">("todos");

  const centrosFiltrados = useMemo(
    () =>
      centros.filter((c) => {
        if (filtro && !c.nome.toLowerCase().includes(filtro.toLowerCase()) && !c.codigo.toLowerCase().includes(filtro.toLowerCase())) return false;
        if (filtroStatus !== "todos" && statusDe(c) !== filtroStatus) return false;
        if (filtroOrigem !== "todos" && c.origem !== filtroOrigem) return false;
        return true;
      }),
    [centros, filtro, filtroStatus, filtroOrigem],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar por nome ou código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="h-8 w-56 text-xs"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="todos">Todos os status</option>
            <option value="ok">OK</option>
            <option value="alerta">Alerta</option>
            <option value="estourado">Estourado</option>
          </select>
          <select
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value as typeof filtroOrigem)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="todos">Todas as origens</option>
            <option value="manual">Manual</option>
            <option value="crm">CRM ✨</option>
          </select>
        </div>
        <NovoCentroCustoDialog
          open={novoOpen}
          onOpenChange={setNovoOpen}
          clientes={clientes.map((c) => c.nome)}
          onSalvar={(novo) => {
            setCentros((prev) => [novo, ...prev]);
            toast.success("Centro de Custo criado!");
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Distribuição por Centro de Custo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <div className="grid grid-cols-2 gap-3 content-start">
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Orçamento Total</p><p className="text-lg font-bold">{fmt(centros.reduce((s, c) => s + c.orcamento, 0))}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Realizado Total</p><p className="text-lg font-bold">{fmt(centros.reduce((s, c) => s + c.realizado, 0))}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Centros OK</p><p className="text-lg font-bold text-green-600">{centros.filter((c) => statusDe(c) === "ok").length}</p></Card>
          <Card className="p-3 border-border"><p className="text-[10px] uppercase text-muted-foreground">Vindos do CRM</p><p className="text-lg font-bold text-gold">{centros.filter((c) => c.origem === "crm").length}</p></Card>
        </div>
      </div>
      <DataTable columns={cols} data={centrosFiltrados} filename="centros-de-custo" />
    </div>
  );
}

function NovoCentroCustoDialog({
  open,
  onOpenChange,
  clientes,
  onSalvar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientes: string[];
  onSalvar: (c: CentroCusto) => void;
}) {
  const [centrosAtuais] = useCentrosCusto();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [orcamento, setOrcamento] = useState("");

  const salvar = () => {
    if (!nome.trim()) {
      toast.error("Informe o nome do Centro de Custo.");
      return;
    }
    onSalvar({
      id: `cc-manual-${Date.now()}`,
      codigo: proximoCodigoCC(centrosAtuais),
      nome,
      descricao: descricao || undefined,
      clienteNome: clienteNome || undefined,
      responsavelComercial: responsavel || undefined,
      orcamento: Number(orcamento.replace(",", ".")) || 0,
      realizado: 0,
      origem: "manual",
      ativo: true,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
    });
    setNome(""); setDescricao(""); setClienteNome(""); setResponsavel(""); setOrcamento("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><Plus className="h-3.5 w-3.5" />Novo Centro de Custo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Centro de Custo</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do Centro de Custo *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente</Label>
            <Input list="clientes-cc" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Opcional" />
            <datalist id="clientes-cc">
              {clientes.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Responsável Comercial</Label>
            <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Orçamento (R$)</Label>
            <Input value={orcamento} onChange={(e) => setOrcamento(e.target.value)} placeholder="0,00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={salvar}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
