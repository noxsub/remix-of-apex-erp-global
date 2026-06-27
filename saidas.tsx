import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LayoutGrid, ShoppingCart, FileText, Receipt, RotateCcw, FileBarChart2, Send } from "lucide-react";

export const Route = createFileRoute("/saidas")({
  head: () => ({
    meta: [
      { title: "Saídas — Syntera ERP" },
      { name: "description", content: "Vendas, faturamento, emissão de notas fiscais, pedidos e relatórios." },
    ],
  }),
  component: SaidasLayout,
});

const tabs = [
  { to: "/saidas", label: "Visão geral", icon: LayoutGrid, exact: true },
  { to: "/saidas/pedidos", label: "Pedidos de Venda", icon: ShoppingCart },
  { to: "/saidas/orcamentos", label: "Orçamentos", icon: FileText },
  { to: "/saidas/faturamento", label: "Faturamento", icon: Receipt },
  { to: "/saidas/notas-emitidas", label: "NFs Emitidas", icon: Send },
  { to: "/saidas/devolucoes", label: "Devoluções", icon: RotateCcw },
  { to: "/saidas/relatorios", label: "Relatórios", icon: FileBarChart2 },
];

function SaidasLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell
      title="Saídas"
      subtitle="Vendas, faturamento, emissão de notas fiscais, pedidos e relatórios."
    >
      <nav className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </AppShell>
  );
}
