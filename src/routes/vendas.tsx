import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FileText } from "lucide-react";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas / Faturamento — Global ERP" },
      { name: "description", content: "Pedidos integrados ao estoque." },
    ],
  }),
  component: VendasPage,
});

const produtosEstoque = [
  { sku: "SKU-10042", nome: "Notebook Pro 14\" M3", preco: 7299, estoque: 184 },
  { sku: "SKU-10043", nome: "Monitor UltraWide 34\"", preco: 3499, estoque: 42 },
  { sku: "SKU-10044", nome: "Teclado Mecânico RGB", preco: 599, estoque: 8 },
  { sku: "SKU-10045", nome: "Mouse Ergonômico Vertical", preco: 289, estoque: 312 },
  { sku: "SKU-10046", nome: "Headset Wireless ANC", preco: 1199, estoque: 64 },
];

type Pedido = {
  numero: string;
  data: string;
  cliente: string;
  itens: number;
  total: string;
  status: string;
};

const pedidos: Pedido[] = [
  { numero: "PED-2026-0184", data: "08/06/2026", cliente: "Acme Global Ltd.", itens: 4, total: "R$ 18.420,00", status: "Faturado" },
  { numero: "PED-2026-0183", data: "08/06/2026", cliente: "Northwind Trading", itens: 2, total: "R$ 9.890,50", status: "Enviado" },
  { numero: "PED-2026-0182", data: "07/06/2026", cliente: "Contoso S.A.", itens: 7, total: "R$ 24.100,00", status: "Rascunho" },
  { numero: "PED-2026-0181", data: "07/06/2026", cliente: "Fabrikam Inc.", itens: 1, total: "R$ 3.250,00", status: "Faturado" },
];

const colPed: Column<Pedido>[] = [
  { key: "numero", header: "Pedido" },
  { key: "data", header: "Data" },
  { key: "cliente", header: "Cliente" },
  { key: "itens", header: "Itens", align: "right" },
  { key: "total", header: "Total", align: "right" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

type Item = { sku: string; qtd: number };

function VendasPage() {
  const [items, setItems] = useState<Item[]>([{ sku: "SKU-10042", qtd: 1 }]);

  const addItem = () => setItems([...items, { sku: produtosEstoque[0].sku, qtd: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const total = items.reduce((acc, it) => {
    const p = produtosEstoque.find((p) => p.sku === it.sku);
    return acc + (p ? p.preco * it.qtd : 0);
  }, 0);

  return (
    <AppShell
      title="Vendas / Faturamento"
      subtitle="Crie pedidos integrados ao estoque em tempo real."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight">Novo pedido</h3>
            <p className="text-xs text-muted-foreground">Os itens consomem o estoque ao faturar.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Cliente</Label>
              <Input placeholder="Selecione o cliente" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condição de pagamento</Label>
              <Select defaultValue="30">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">À vista</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">30/60 dias</SelectItem>
                  <SelectItem value="90">30/60/90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Itens</Label>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={addItem}>
                <Plus className="h-3 w-3" /> Adicionar item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => {
                const p = produtosEstoque.find((p) => p.sku === it.sku)!;
                return (
                  <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-md border border-border bg-secondary/30 p-2">
                    <div className="col-span-6">
                      <Select value={it.sku} onValueChange={(v) => updateItem(i, { sku: v })}>
                        <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {produtosEstoque.map((pr) => (
                            <SelectItem key={pr.sku} value={pr.sku}>
                              {pr.nome} · {pr.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={it.qtd}
                        onChange={(e) => updateItem(i, { qtd: Math.max(1, Number(e.target.value)) })}
                        className="h-9 bg-background tabular-nums"
                      />
                    </div>
                    <div className="col-span-3 text-right text-sm tabular-nums">
                      {(p.preco * it.qtd).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      <div className="text-[10px] text-muted-foreground">Estoque: {p.estoque}</div>
                    </div>
                    <button
                      onClick={() => removeItem(i)}
                      className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total do pedido</div>
              <div className="text-2xl font-semibold tabular-nums">
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9">Salvar rascunho</Button>
              <Button size="sm" className="h-9 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                <FileText className="h-3.5 w-3.5" /> Faturar pedido
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">Resumo do dia</h3>
          <p className="text-xs text-muted-foreground">08/06/2026</p>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Pedidos abertos", "12"],
              ["Faturados hoje", "8"],
              ["Receita do dia", "R$ 64.890,00"],
              ["Ticket médio", "R$ 8.111,25"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          title="Pedidos recentes"
          columns={colPed}
          data={pedidos}
          filename="pedidos"
        />
      </div>
    </AppShell>
  );
}