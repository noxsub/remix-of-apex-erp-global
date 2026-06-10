import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Upload, Plus, FileText, UploadCloud, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./index";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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

const receberInicial: Conta[] = [
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
  const [importOpen, setImportOpen] = useState(false);
  const [retFile, setRetFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [receber, setReceber] = useState<Conta[]>(receberInicial);
  const [updatedDocs, setUpdatedDocs] = useState<Set<string>>(new Set());
  const pendingUpdates = useRef<Array<{ documento: string; status: string }>>([]);

  const resumo = useMemo(() => {
    const parse = (v: string) =>
      Number(v.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    const fmt = (n: number) =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const aberto = receber.filter((r) => r.status === "Em aberto");
    const pago = receber.filter((r) => r.status === "Pago");
    const venc = receber.filter((r) => r.status === "Vencido");
    const diverg = receber.filter((r) => r.status === "Divergente");
    return {
      aReceber: [fmt(aberto.reduce((s, r) => s + parse(r.valor), 0)), `${aberto.length} títulos`],
      recebidos: [fmt(pago.reduce((s, r) => s + parse(r.valor), 0)), `${pago.length} títulos`],
      vencidos: [fmt(venc.reduce((s, r) => s + parse(r.valor), 0)), `${venc.length} títulos`],
      divergentes: diverg.length,
    };
  }, [receber]);

  function handleRetFile(f: File | null) {
    if (!f) return;
    const ok = /\.(ret|txt|cnab|rem|json)$/i.test(f.name);
    if (!ok) {
      toast.error("Formato inválido", { description: "Envie .RET / CNAB 240 ou .JSON." });
      return;
    }
    setRetFile(f);
    setDone(false);
    setProgress(null);
    pendingUpdates.current = [];

    if (/\.json$/i.test(f.name)) {
      f.text()
        .then((txt) => {
          const parsed = JSON.parse(txt);
          const items: Array<{ documento: string; status: string }> = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.titulos)
              ? parsed.titulos
              : Array.isArray(parsed?.updates)
                ? parsed.updates
                : [];
          if (!items.length) {
            toast.error("JSON sem títulos reconhecíveis", {
              description: 'Esperado: [{ "documento": "NF-...", "status": "Pago" | "Divergente" }]',
            });
            return;
          }
          pendingUpdates.current = items;
          toast.success("JSON carregado", {
            description: `${items.length} título(s) prontos para conciliação.`,
          });
        })
        .catch(() => toast.error("JSON inválido"));
    }
  }

  function simular() {
    if (!retFile) return;
    setProgress(0);
    setDone(false);
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + Math.random() * 12 + 4;
        if (next >= 100) {
          window.clearInterval(id);
          setDone(true);
          aplicarAtualizacoes();
          return 100;
        }
        return next;
      });
    }, 220);
  }

  function aplicarAtualizacoes() {
    const updates = pendingUpdates.current;
    if (updates.length === 0) {
      toast.success("Conciliação simulada", {
        description: `${retFile?.name} — 47 títulos processados, 42 conciliados.`,
      });
      return;
    }
    const map = new Map(updates.map((u) => [u.documento, u.status]));
    const touched = new Set<string>();
    setReceber((prev) =>
      prev.map((r) => {
        const novo = map.get(r.documento);
        if (novo && novo !== r.status) {
          touched.add(r.documento);
          return { ...r, status: novo };
        }
        return r;
      }),
    );
    setUpdatedDocs(touched);
    window.setTimeout(() => setUpdatedDocs(new Set()), 12000);
    const pagos = updates.filter((u) => u.status === "Pago").length;
    const diverg = updates.filter((u) => u.status === "Divergente").length;
    toast.success("Conciliação aplicada", {
      description: `${touched.size} título(s) atualizados · ${pagos} pagos · ${diverg} divergentes.`,
    });
    setTab("receber");
  }

  function resetImport() {
    setRetFile(null);
    setProgress(null);
    setDone(false);
  }

  return (
    <AppShell
      title="Financeiro"
      subtitle="Contas a pagar, contas a receber e conciliação bancária."
      actions={
        <>
          <Button
            size="sm"
            onClick={() => {
              resetImport();
              setImportOpen(true);
            }}
            className="h-9 gap-2 bg-gradient-to-b from-[oklch(0.82_0.1_85)] to-[oklch(0.72_0.11_85)] text-primary-foreground shadow-sm hover:opacity-95 border border-[oklch(0.62_0.1_85)]"
          >
            <Upload className="h-4 w-4" />
            Importar Arquivo de Retorno / VAN Bancária
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Lançamento
          </Button>
          <Dialog
            open={importOpen}
            onOpenChange={(v) => {
              setImportOpen(v);
              if (!v) resetImport();
            }}
          >
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Processamento de retorno bancário</DialogTitle>
                <DialogDescription>
                  Importe arquivos <strong>.RET</strong> ou <strong>CNAB 240</strong> da sua VAN bancária para conciliar títulos automaticamente.
                </DialogDescription>
              </DialogHeader>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleRetFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                  dragging
                    ? "border-gold bg-gold/5"
                    : "border-border bg-secondary/30 hover:border-gold/60"
                }`}
              >
                {retFile ? (
                  <>
                    <FileText className="h-8 w-8 text-gold" />
                    <div>
                      <p className="text-sm font-medium">{retFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(retFile.size / 1024).toFixed(1)} KB ·{" "}
                        {/\.json$/i.test(retFile.name) ? "JSON de conciliação" : "CNAB 240 / .RET"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Arraste o arquivo .RET, CNAB 240 ou .JSON</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        VAN bancária (.RET / CNAB) ou retorno estruturado em .JSON
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".ret,.txt,.cnab,.rem,.json,application/json"
                  className="hidden"
                  onChange={(e) => handleRetFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {progress !== null && (
                <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {done ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Conciliação concluída
                        </span>
                      ) : (
                        "Processando registros..."
                      )}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  {done && (
                    <p className="text-[11px] text-muted-foreground">
                      47 títulos lidos · 42 conciliados · 5 divergências
                    </p>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(false)}>
                  Fechar
                </Button>
                <Button
                  size="sm"
                  disabled={!retFile || (progress !== null && !done)}
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={simular}
                >
                  Simular Conciliação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["A Receber (mês)", resumo.aReceber[0], resumo.aReceber[1]],
          ["Recebidos", resumo.recebidos[0], resumo.recebidos[1]],
          ["A Pagar (mês)", "R$ 92.180", "9 títulos"],
          [
            "Vencidos / Divergentes",
            resumo.vencidos[0],
            `${resumo.vencidos[1]} · ${resumo.divergentes} divergentes`,
          ],
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
            rowClassName={(r) =>
              updatedDocs.has(r.documento)
                ? "bg-gold/5 ring-1 ring-inset ring-gold/30 animate-pulse"
                : ""
            }
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