import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  AlertCircle,
  Download,
  FileCheck,
  Upload,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data-table";
import { useEmpresaFiscal } from "@/lib/fiscal-store";
import {
  obrigacoesDoRegime,
  AMBITO_LABEL,
  PERIODICIDADE_LABEL,
  type ObrigacaoRegime,
} from "@/lib/obrigacoes-regimes";
import { useObrigacoes, type Obrigacao, type GuiaRecolhimento } from "@/lib/obrigacoes-store";

export const Route = createFileRoute("/obrigacoes")({
  head: () => ({
    meta: [
      { title: "Obrigações Acessórias — Sintera ERP" },
      {
        name: "description",
        content: "Calendário de obrigações fiscais — ECF, ECD, SPED, Guias DARF/GPS.",
      },
    ],
  }),
  component: ObrigacoesPage,
});

function ObrigacoesPage() {
  const {
    config,
    obrigacoes,
    guias,
    criarObrigacao,
    atualizarObrigacao,
    gerarArquivo,
    criarGuia,
    obterRelatorio,
    marcarEnviado,
    exportarPDF,
    listarProximos,
  } = useObrigacoes();

  const [tabAtiva, setTabAtiva] = useState<string>("calendario");
  const [periodSel, setPeriodSel] = useState<string>("202606");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const relatorio = obterRelatorio(periodSel);
  const proximosVencimentos = listarProximos(30);

  const obligacoesFiltradas = obrigacoes
    .filter((o) => o.periodo === periodSel)
    .filter(
      (o) => filtroStatus === "todos" || o.status === (filtroStatus as any)
    );

  return (
    <AppShell
      title="Obrigações Acessórias"
      subtitle="Calendário fiscal e controle de entregas ao fisco"
      actions={
        <Button variant="outline" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Exportar Calendário
        </Button>
      }
    >
      {/* Status Rápido */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total no Período</p>
          <p className="mt-2 text-2xl font-bold">{relatorio.totalObrigacoes}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Cumpridas</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{relatorio.cumpridas}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{relatorio.pendentes}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Atrasadas</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{relatorio.atrasadas}</p>
        </Card>
      </div>

      {/* Seletor de Período e Filtro */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 max-w-xs">
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
        <div className="flex-1 max-w-xs">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_preparacao">Em Preparação</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="aceito">Aceito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva} defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="regime" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            Meu Regime
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="guias" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Guias
          </TabsTrigger>
          <TabsTrigger value="proximos" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Próximos 30 Dias
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Integrações
          </TabsTrigger>
        </TabsList>

        {/* Obrigações do Regime Tributário */}
        <TabsContent value="regime" className="mt-6">
          <RegimeTab />
        </TabsContent>

        {/* Calendário */}
        <TabsContent value="calendario" className="mt-6">
          <CalendarioTab
            obrigacoes={obligacoesFiltradas}
            relatorio={relatorio}
            onGerarArquivo={gerarArquivo}
            onEnviar={marcarEnviado}
            onExportarPDF={exportarPDF}
            onStatusChange={atualizarObrigacao}
          />
        </TabsContent>

        {/* Guias */}
        <TabsContent value="guias" className="mt-6">
          <GuiasTab guias={guias} periodSel={periodSel} onCriarGuia={criarGuia} />
        </TabsContent>

        {/* Próximos Vencimentos */}
        <TabsContent value="proximos" className="mt-6">
          <ProximosTab obrigacoes={proximosVencimentos} />
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integracoes" className="mt-6">
          <IntegracoesTa/>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ─── Calendário ──────────────────────────────────────────────────────────

function CalendarioTab({
  obrigacoes,
  relatorio,
  onGerarArquivo,
  onEnviar,
  onExportarPDF,
  onStatusChange,
}: {
  obrigacoes: Obrigacao[];
  relatorio: any;
  onGerarArquivo: any;
  onEnviar: any;
  onExportarPDF: any;
  onStatusChange: any;
}) {
  const cols: Column<Obrigacao>[] = [
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipo}</Badge> },
    { key: "descricao", header: "Descrição" },
    { key: "vencimento", header: "Vencimento" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant={
            r.status === "aceito"
              ? "default"
              : r.status === "enviado"
                ? "secondary"
                : r.status === "pronto"
                  ? "outline"
                  : "destructive"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (r) => (
        <div className="flex gap-1">
          {r.status === "pendente" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(r.id, { status: "em_preparacao" })}
            >
              Preparar
            </Button>
          )}
          {r.status === "pronto" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEnviar(r.id, `PROT-${Date.now()}`)}
            >
              Enviar
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onExportarPDF(r.id)}>
            PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {relatorio.atrasadas > 0 && (
        <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Atenção!</h3>
            <p className="text-sm text-destructive/80">
              {relatorio.atrasadas} obrigação(ões) vencida(s). Regularize imediatamente!
            </p>
          </div>
        </div>
      )}

      <DataTable columns={cols} data={obrigacoes} />
    </div>
  );
}

// ─── Guias ───────────────────────────────────────────────────────────────

function GuiasTab({
  guias,
  periodSel,
  onCriarGuia,
}: {
  guias: GuiaRecolhimento[];
  periodSel: string;
  onCriarGuia: any;
}) {
  const [open, setOpen] = useState(false);

  const cols: Column<GuiaRecolhimento>[] = [
    { key: "tipo", header: "Tipo", render: (r) => <Badge variant="outline">{r.tipo}</Badge> },
    { key: "descricao", header: "Descrição" },
    { key: "valor", header: "Valor Base", align: "right", render: (r) => `R$ ${r.valor.toFixed(2)}` },
    {
      key: "totalAPagar",
      header: "Total a Pagar",
      align: "right",
      render: (r) => `R$ ${r.totalAPagar.toFixed(2)}`,
    },
    { key: "vencimento", header: "Vencimento" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={r.dataPagamento ? "default" : "secondary"}>
          {r.dataPagamento ? "Pago" : "Pendente"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="font-semibold">Guias de Recolhimento</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Nova Guia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Guia de Recolhimento</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Selecione o tipo de guia e os dados serão preenchidos automaticamente.
            </p>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {guias.length === 0 ? (
        <Card className="border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">Nenhuma guia criada ainda.</p>
        </Card>
      ) : (
        <DataTable columns={cols} data={guias} />
      )}
    </div>
  );
}

// ─── Próximos Vencimentos ────────────────────────────────────────────────

function ProximosTab({ obrigacoes }: { obrigacoes: Obrigacao[] }) {
  return (
    <div className="space-y-3">
      {obrigacoes.length === 0 ? (
        <Card className="border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">Nenhuma obrigação vencendo nos próximos 30 dias.</p>
        </Card>
      ) : (
        obrigacoes.map((o) => (
          <Card key={o.id} className="border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{o.descricao}</h4>
                <p className="text-xs text-muted-foreground mt-1">{o.tipo.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{o.vencimento}</p>
                <Badge variant="outline" className="mt-2">
                  {o.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Integrações ─────────────────────────────────────────────────────────

function IntegracoesTa() {
  return (
    <div className="space-y-4">
      <Card className="border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Integrações com Órgãos Fiscais</h3>
        <div className="space-y-3">
          <IntegracaoItem
            nome="Receita Federal"
            descricao="Sped Fiscal, ECF, ECD"
            status="conectado"
          />
          <IntegracaoItem
            nome="Secretaria da Fazenda (SEFAZ)"
            descricao="ICMS-ST, Diferencial"
            status="conectado"
          />
          <IntegracaoItem
            nome="Secretaria Municipal"
            descricao="ISS-e"
            status="pendente"
          />
          <IntegracaoItem
            nome="Banco Central"
            descricao="Transferências PIX/TED"
            status="em_desenvolvimento"
          />
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Próximas Integrações</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>API Banco Central — Integração com ambiente RFB (2026)</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>Sincronização automática de obrigações com SAP, Protheus, Omegasoft</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>Assinatura digital A1/A3 automatizada</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function IntegracaoItem({
  nome,
  descricao,
  status,
}: {
  nome: string;
  descricao: string;
  status: string;
}) {
  const badgeVariant =
    status === "conectado"
      ? "default"
      : status === "pendente"
        ? "secondary"
        : "outline";

  return (
    <div className="flex items-center justify-between pb-3 border-b border-border last:border-0">
      <div>
        <p className="font-medium text-sm">{nome}</p>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>
      <Badge variant={badgeVariant}>{status}</Badge>
    </div>
  );
}

/* ─── Obrigações por Regime Tributário ─────────────────────────── */

function RegimeTab() {
  const [empresa] = useEmpresaFiscal();
  const lista = obrigacoesDoRegime(empresa.regime);

  const porAmbito = useMemo(() => {
    const grupos: Record<string, ObrigacaoRegime[]> = {};
    for (const o of lista) {
      (grupos[o.ambito] ??= []).push(o);
    }
    return grupos;
  }, [lista]);

  return (
    <div className="space-y-5">
      <Card className="border-gold/30 bg-gold/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Regime tributário da empresa
            </p>
            <p className="mt-1 text-lg font-semibold">{empresa.regime}</p>
            <p className="text-xs text-muted-foreground">
              {empresa.razaoSocial} — apuração: {empresa.regimeApuracao === "caixa" ? "Caixa" : "Competência"}
            </p>
          </div>
          <Badge variant="outline" className="border-gold/40 text-gold">
            {lista.length} obrigações aplicáveis
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          O regime é definido no cadastro da empresa (Cadastros → Empresa). Ao alterá-lo,
          este calendário de conformidade é recalculado automaticamente.
        </p>
      </Card>

      {(["federal", "estadual", "municipal", "trabalhista"] as const).map((ambito) => {
        const grupo = porAmbito[ambito];
        if (!grupo?.length) return null;
        return (
          <div key={ambito}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {AMBITO_LABEL[ambito]}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {grupo.map((o) => (
                <Card key={o.codigo} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{o.nome}</p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {PERIODICIDADE_LABEL[o.periodicidade]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {o.descricao}
                  </p>
                  <p className="mt-2 text-[11px] text-gold">
                    Vencimento: {o.vencimentoRegra}
                  </p>
                  {o.condicao && (
                    <p className="mt-1 text-[10px] italic text-muted-foreground">
                      {o.condicao}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
