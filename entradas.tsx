import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LayoutGrid, ShoppingCart, Boxes, FileBarChart2, Truck, RotateCcw, CreditCard, Building2 } from "lucide-react";

export const Route = createFileRoute("/entradas")({
  head: () => ({
    meta: [
      { title: "Entradas — Syntera ERP" },
      { name: "description", content: "Documentos fiscais de entrada, compras, frete, créditos e obrigações." },
    ],
  }),
  component: EntradasLayout,
});

const tabs = [
  { to: "/entradas", label: "Visão geral", icon: LayoutGrid, exact: true },
  { to: "/entradas/compras", label: "Compras (NF-e)", icon: ShoppingCart },
  { to: "/entradas/fornecedores", label: "Fornecedores", icon: Building2 },
  { to: "/entradas/frete-cte", label: "Frete / CT-e", icon: Truck },
  { to: "/entradas/devolucoes", label: "Devoluções", icon: RotateCcw },
  { to: "/entradas/creditos", label: "Apropriação de Crédito", icon: CreditCard },
  { to: "/entradas/estoque", label: "Estoque", icon: Boxes },
  { to: "/entradas/relatorios", label: "Relatórios", icon: FileBarChart2 },
];

function EntradasLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell
      title="Entradas"
      subtitle="Documentos fiscais de entrada, compras, frete, apropriação de crédito e relatórios."
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
