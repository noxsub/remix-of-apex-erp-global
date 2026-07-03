import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LayoutGrid, Users, Wallet, Calendar, Heart, Clock } from "lucide-react";

export const Route = createFileRoute("/rh")({
  head: () => ({
    meta: [
      { title: "RH — Syntera ERP" },
      { name: "description", content: "Gestão de pessoas, folha de pagamento, férias, benefícios e ponto." },
    ],
  }),
  component: RhLayout,
});

const tabs = [
  { to: "/rh", label: "Visão geral", icon: LayoutGrid, exact: true },
  { to: "/rh/colaboradores", label: "Colaboradores", icon: Users },
  { to: "/rh/folha", label: "Folha de Pagamento", icon: Wallet },
  { to: "/rh/ferias", label: "Férias / 13º", icon: Calendar },
  { to: "/rh/beneficios", label: "Benefícios", icon: Heart },
  { to: "/rh/ponto", label: "Controle de Ponto", icon: Clock },
];

function RhLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell title="Recursos Humanos" subtitle="Gestão de pessoas, folha de pagamento, férias, benefícios e ponto.">
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
