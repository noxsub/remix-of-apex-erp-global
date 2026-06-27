import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Calculator,
  CreditCard,
  FileText,
  AlertCircle,
  Download,
  Plus,
  Zap,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data-table";
import {
  useReformaTributaria,
  type CreditoIBS,
  type ApuracaoIBS,
} from "@/lib/reforma-tributaria-store";

export const Route = createFileRoute("/reforma-tributaria")({
  head: () => ({
    meta: [
      { title: "Reforma Tributária — Sintera ERP" },
      {
        name: "description",
        content: "Controle de IBS/CBS — apuração de créditos e débitos com sincronização RFB.",
      },
    ],
  }),
  component: ReformaTributariaPage,
});

function ReformaTributariaPage() {
  const {
    config,
    apuracoes,
    creditos,
    setConfig,
    adicionarCredito,
    calcularApuracao,
    sincronizarRFB,
    obterProgresso,
    obterSaldoAtual,
  } = useReformaTributaria();

  const [periodSel, setPeriodSel] = useState<string>("202606");
  const [tabAtiva, setTabAtiva] = useState<string>("dashboard");

  const saldo = obterSaldoAtual();
  const progresso = obterProgresso();
  const apuracaoPeriodo = apuracoes.find((a) => a.periodo === periodSel);

  const creditosPeriodo = creditos.filter((c) => c.periodo === periodSel);

  return (
    <AppShell
      title="Reforma Tributária"
      subtitle="IBS / CBS — Controle de crédito e apuração para 2026+"
      actions={
        <Button
          className="gap-1.5"
          variant="outline"
          onClick={() => calcularApuracao(periodSel)}
        >
          <Calculator className="h-3.5 w-3.5" />
          Calcular Apuração
        </Button>
      }
    >
      {/* Seletor de Período */}
      <div className="mb-6 flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-xs">Período</Label>
          <Select value={periodSel} onValueChange={setPeriodSel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="202606">Junho / 2026</SelectItem>
              <SelectItem value="202605">Maio / 2026</SelectItem>
              <SelectItem value="202604">Abril / 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="secondary" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Exportar
        </Button>
      </div>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva} defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="creditos" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Créditos
          </TabsTrigger>
          <TabsTrigger value="apuracao" className="gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            Apuração
          </TabsTrigger>
          <TabsTrigger value="progresso" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Progressão
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Configuração
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <DashboardReforma
            saldo={saldo}
            apuracao={apuracaoPeriodo}
            creditos={creditosPeriodo}
            periodSel={periodSel}
          />
        </TabsContent>

        {/* Créditos */}
        <TabsContent value="creditos" className="mt-6 space-y-4">
          <CreditosTab
            creditos={creditosPeriodo}
            periodSel={periodSel}
            onAdicionarCredito={adicionarCredito}
          />
        </TabsContent>

        {/* Apuração */}
        <TabsContent value="apuracao" className="mt-6 space-y-4">
          <ApuracaoTab
            apuracao={apuracaoPeriodo}
            saldo={saldo}
            onSincronizar={() => sincronizarRFB(periodSel)}
          />
        </TabsContent>

        {/* Progressão */}
        <TabsContent value="progresso" className="mt-6 space-y-4">
          <ProgressaoTab progresso={progresso} config={config} />
        </TabsContent>

        {/* Configuração */}
        <TabsContent value="config" className="mt-6 space-y-4">
          <ConfigTab config={config} onUpdate={setConfig} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────

function DashboardReforma({
  saldo,
  apuracao,
  creditos,
  periodSel,
}: {
  saldo: any;
  apuracao?: ApuracaoIBS;
  creditos: CreditoIBS[];
  periodSel: string;
}) {
  const chartData = [
    { mes: "Abr", credito: 45000, debito: 52000, saldo: -7000 },
    { mes: "Mai", credito: 51000, debito: 48000, saldo: 3000 },
    { mes: "Jun", credito: 58000, debito: 61000, saldo: -3000 },
  ];

  const creditosPorTipo = [
    { name: "Entradas", value: creditos.filter((c) => c.tipo === "entrada").length },
    { name: "Ativos", value: creditos.filter((c) => c.tipo === "ativo").length },
    { name: "Serviços", value: creditos.filter((c) => c.tipo === "servico").length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Cards de Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Devedor</p>
              <p className="mt-2 text-xl font-bold text-foreground">
                R$ {Math.abs(saldo.devedor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Credor</p>
              <p className="mt-2 text-xl font-bold text-foreground">
                R$ {saldo.credor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {apuracao ? (apuracao.aliquotaEfetiva * 100).toFixed(2) : "0.90"}%
              </p>
            </div>
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Evolução Crédito/Débito */}
        <Card className="border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Evolução — Últimos 3 Meses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="credito"
                stroke="#10b981"
                strokeWidth={2}
                name="Crédito"
              />
              <Line
                type="monotone"
                dataKey="debito"
                stroke="#ef4444"
                strokeWidth={2}
                name="Débito"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Créditos por Tipo */}
        <Card className="border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Créditos por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={creditosPorTipo}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {creditosPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── Créditos ────────────────────────────────────────────────────────────

function CreditosTab({
  creditos,
  periodSel,
  onAdicionarCredito,
}: {
  creditos: CreditoIBS[];
  periodSel: string;
  onAdicionarCredito: (c: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: "entrada" as const,
    descricao: "",
    baseCalculo: 0,
    aliquota: 0.009,
  });

  const cols: Column<CreditoIBS>[] = [
    { key: "tipo", header: "Tipo" },
    { key: "descricao", header: "Descrição" },
    { key: "baseCalculo", header: "Base", align: "right", render: (r) => `R$ ${r.baseCalculo.toFixed(2)}` },
    {
      key: "credito",
      header: "Crédito",
      align: "right",
      render: (r) => `R$ ${r.credito.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={r.status === "validado" ? "default" : "secondary"}>{r.status}</Badge>,
    },
  ];

  const handleAdicionar = () => {
    const credito = form.baseCalculo * form.aliquota;
    onAdicionarCredito({
      periodo: periodSel,
      ...form,
      credito,
      dataRegistro: new Date().toISOString(),
      status: "pendente",
    });
    toast.success("Crédito adicionado");
    setForm({ tipo: "entrada", descricao: "", baseCalculo: 0, aliquota: 0.009 });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Créditos do Período</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar Crédito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Crédito de IBS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v: any) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div>
                <Label>Base de Cálculo (R$)</Label>
                <Input
                  type="number"
                  value={form.baseCalculo}
                  onChange={(e) => setForm({ ...form, baseCalculo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Alíquota (%)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={form.aliquota * 100}
                  onChange={(e) => setForm({ ...form, aliquota: parseFloat(e.target.value) / 100 || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdicionar}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={cols} data={creditos} />
    </div>
  );
}

// ─── Apuração ────────────────────────────────────────────────────────────

function ApuracaoTab({
  apuracao,
  saldo,
  onSincronizar,
}: {
  apuracao?: ApuracaoIBS;
  saldo: any;
  onSincronizar: () => Promise<boolean>;
}) {
  const [sincronizando, setSincronizando] = useState(false);

  const handleSincronizar = async () => {
    setSincronizando(true);
    try {
      await onSincronizar();
      toast.success("Sincronização realizada com sucesso");
    } catch (e) {
      toast.error("Erro na sincronização");
    }
    setSincronizando(false);
  };

  if (!apuracao) {
    return (
      <Card className="border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">Nenhuma apuração calculada para este período.</p>
        <p className="text-xs text-muted-foreground mt-2">Clique em "Calcular Apuração" para gerar os dados.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Resultado da Apuração</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total Débitos" value={`R$ ${apuracao.totalDebitos.toFixed(2)}`} />
          <Stat label="Total Créditos" value={`R$ ${apuracao.totalCreditos.toFixed(2)}`} />
          <Stat label="Saldo Credor" value={`R$ ${apuracao.saldoCredor.toFixed(2)}`} highlight={apuracao.saldoCredor > 0} />
          <Stat label="Saldo Devedor" value={`R$ ${apuracao.saldoDevedor.toFixed(2)}`} highlight={apuracao.saldoDevedor > 0} />
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Sincronizar com RFB</h3>
            <p className="text-xs text-muted-foreground mt-1">Enviar apuração para ambiente da Receita Federal</p>
          </div>
          <Button onClick={handleSincronizar} disabled={sincronizando} className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            {sincronizando ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </div>
        {apuracao.syncronizadoRFB && (
          <p className="text-xs text-green-600 mt-4">✓ Sincronizado com sucesso</p>
        )}
      </Card>
    </div>
  );
}

// ─── Progressão ──────────────────────────────────────────────────────────

function ProgressaoTab({
  progresso,
  config,
}: {
  progresso: any[];
  config: any;
}) {
  return (
    <Card className="border-border bg-card p-6">
      <h3 className="font-semibold mb-4">Progressão de Alíquota — 2026 até 2035</h3>
      <div className="space-y-3">
        {progresso.map((p) => (
          <div key={p.ano} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
            <div>
              <p className="font-medium">{p.ano}</p>
              <p className="text-xs text-muted-foreground">{p.descricao}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{(p.aliquota * 100).toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">{(p.coeficiente * 100).toFixed(0)}% da alíquota</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Configuração ────────────────────────────────────────────────────────

function ConfigTab({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (cfg: any) => void;
}) {
  return (
    <Card className="border-border bg-card p-6">
      <h3 className="font-semibold mb-4">Configurações de IBS/CBS</h3>
      <div className="space-y-4">
        <div>
          <Label>Regime</Label>
          <Select value={config.regimeAdotado} onValueChange={(v) => onUpdate({ regimeAdotado: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="beneficiado">Beneficiado</SelectItem>
              <SelectItem value="isento">Isento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ambiente RFB</Label>
          <Select value={config.ambienteRFB} onValueChange={(v) => onUpdate({ ambienteRFB: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homologacao">Homologação</SelectItem>
              <SelectItem value="producao">Produção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "border-foreground/20 bg-primary/5" : "border-border"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-2 font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
