import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Users,
  Receipt,
  Network,
  Sparkles,
  Plus,
  ChevronRight,
  LayoutGrid,
  ShoppingCart,
  Boxes,
  FileBarChart2,
  TrendingUp,
  FileCheck,
  UserCog,
  FileText,
  Send,
  RotateCcw,
  Calendar,
  Heart,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useCanais, usePedidosMarketplace } from "@/lib/omnilink-store";
import { gerarAlertas } from "@/lib/floki/insights";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  children?: { title: string; url: string; icon: typeof LayoutDashboard }[];
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Visão Geral",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Operacional",
    items: [
      {
        title: "Entradas",
        url: "/entradas",
        icon: ArrowDownToLine,
        children: [
          { title: "Visão geral", url: "/entradas", icon: LayoutGrid },
          { title: "Compras", url: "/entradas/compras", icon: ShoppingCart },
          { title: "Estoque", url: "/entradas/estoque", icon: Boxes },
          { title: "Relatórios fiscais", url: "/entradas/relatorios", icon: FileBarChart2 },
        ],
      },
      {
        title: "Saídas",
        url: "/saidas",
        icon: ArrowUpFromLine,
        children: [
          { title: "Visão geral", url: "/saidas", icon: LayoutGrid },
          { title: "Pedidos de Venda", url: "/saidas/pedidos", icon: ShoppingCart },
          { title: "Orçamentos", url: "/saidas/orcamentos", icon: FileText },
          { title: "Faturamento", url: "/saidas/faturamento", icon: Receipt },
          { title: "NFs Emitidas", url: "/saidas/notas-emitidas", icon: Send },
          { title: "Devoluções", url: "/saidas/devolucoes", icon: RotateCcw },
          { title: "Relatórios", url: "/saidas/relatorios", icon: FileBarChart2 },
        ],
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
      { title: "Cadastros", url: "/cadastros", icon: Users },
      {
        title: "RH",
        url: "/rh",
        icon: UserCog,
        children: [
          { title: "Visão geral", url: "/rh", icon: LayoutGrid },
          { title: "Funcionários", url: "/rh/funcionarios", icon: Users },
          { title: "Folha de Pagamento", url: "/rh/folha", icon: Wallet },
          { title: "Férias / 13º", url: "/rh/ferias", icon: Calendar },
          { title: "Benefícios", url: "/rh/beneficios", icon: Heart },
          { title: "Controle de Ponto", url: "/rh/ponto", icon: Clock },
        ],
      },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { title: "Fiscal", url: "/fiscal", icon: Receipt },
      { title: "Reforma Tributária", url: "/reforma-tributaria", icon: TrendingUp },
      { title: "Óbrigações", url: "/obrigacoes", icon: FileCheck },
      { title: "Omnilink", url: "/omnilink", icon: Network },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /* dados reais do Floki — o sidebar reflete o pulso do sistema */
  const [canais] = useCanais();
  const [pedidos] = usePedidosMarketplace();
  const alertas = useMemo(() => gerarAlertas(pedidos, canais), [pedidos, canais]);
  const canaisAtivos = useMemo(
    () => canais.filter((c) => c.ativo).length,
    [canais],
  );

  return (
    <Sidebar collapsible="icon">
      {/* ─── Logo ─── */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-primary-foreground font-semibold tracking-tight">
            S
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">
              Syntera ERP
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              powered by Floki
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ─── Floki Intelligence Card (expanded mode) ─── */}
      <Link
        to="/"
        className="mx-3 mt-3 block rounded-lg border border-gold/20 bg-gold/5 p-3 transition-colors hover:bg-gold/10 group-data-[collapsible=icon]:hidden"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
            <Sparkles className="h-3 w-3" />
            Floki
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Ativa
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {alertas.length > 0
            ? `${alertas.length} alerta${alertas.length !== 1 ? "s" : ""} · ${canaisAtivos} ${canaisAtivos === 1 ? "canal conectado" : "canais conectados"}`
            : `Monitorando · ${canaisAtivos} ${canaisAtivos === 1 ? "canal ativo" : "canais ativos"}`}
        </p>
      </Link>

      {/* ─── Navigation ─── */}
      <SidebarContent className="px-2 py-3">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url);
                  const hasChildren = !!item.children?.length;
                  const expanded = hasChildren && active;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:border-l-2 data-[active=true]:border-gold"
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-2.5"
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm flex-1">{item.title}</span>
                          {hasChildren && (
                            <ChevronRight
                              className={`h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden ${
                                expanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>

                      {/* Badge: alertas Floki no Dashboard */}
                      {item.url === "/" && alertas.length > 0 && (
                        <SidebarMenuBadge>
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold/15 px-1.5 text-[10px] font-semibold text-gold">
                            {alertas.length}
                          </span>
                        </SidebarMenuBadge>
                      )}

                      {/* Badge: canais ativos no Omnilink */}
                      {item.url === "/omnilink" && canaisAtivos > 0 && (
                        <SidebarMenuBadge>
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {canaisAtivos}
                          </span>
                        </SidebarMenuBadge>
                      )}

                      {/* Sub-itens (renderizados quando o pai está ativo) */}
                      {hasChildren && expanded && (
                        <SidebarMenuSub>
                          {item.children!.map((sub) => {
                            const subActive =
                              sub.url === item.url
                                ? pathname === sub.url
                                : pathname === sub.url || pathname.startsWith(sub.url + "/");
                            return (
                              <SidebarMenuSubItem key={sub.url}>
                                <SidebarMenuSubButton asChild isActive={subActive}>
                                  <Link to={sub.url} className="flex items-center gap-2">
                                    <sub.icon className="h-3.5 w-3.5" />
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ─── Quick Action CTA ─── */}
      <div className="px-3 pb-3 group-data-[collapsible=icon]:px-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[oklch(0.82_0.1_85)] to-[oklch(0.72_0.11_85)] px-3 py-2.5 text-xs font-medium text-primary-foreground border border-[oklch(0.62_0.1_85)] shadow-sm transition-all hover:brightness-110 active:scale-[0.98]">
          <Plus className="h-3.5 w-3.5" />
          <span className="group-data-[collapsible=icon]:hidden">
            Nova Operação
          </span>
        </button>
      </div>

      {/* ─── Footer ─── */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>v1.0.0</span>
          <span className="tracking-wider">PT · EN · ES</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
