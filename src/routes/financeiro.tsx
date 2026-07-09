import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LayoutGrid, ArrowDownCircle, ArrowUpCircle, BarChart3, TrendingUp, Building, Layers } from "lucide-react";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Syntera ERP" },
      { name: "description", content: "Contas a pagar, receber, fluxo de caixa, DRE, conciliação e centros de custo." },
    ],
  }),
  component: FinanceiroLayout,
});

const tabs = [
  { to: "/financeiro", label: "Visão geral", icon: LayoutGrid, exact: true },
  { to: "/financeiro/pagar", label: "Contas a Pagar", icon: ArrowDownCircle },
  { to: "/financeiro/receber", label: "Contas a Receber", icon: ArrowUpCircle },
  { to: "/financeiro/fluxo", label: "Fluxo de Caixa", icon: TrendingUp },
  { to: "/financeiro/conciliacao", label: "Conciliação", icon: Building },
  { to: "/financeiro/centros-custo", label: "Centros de Custo", icon: Layers },
];

function FinanceiroLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell title="Financeiro" subtitle="Contas a pagar, receber, fluxo de caixa, DRE, conciliação bancária e centros de custo.">
      <nav className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </AppShell>
  );
}
