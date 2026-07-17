import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Fingerprint,
  HeadphonesIcon,
  KeyRound,
  LogOut,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { logoutFn } from "@/functions/auth.functions";
import { useUsuarioAtual } from "@/lib/usuario-store";

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function useTemaEscuro() {
  const [escuro, setEscuro] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const salvo = window.localStorage.getItem("erp:tema");

    if (salvo === "dark") {
      document.documentElement.classList.add("dark");
      setEscuro(true);
      return;
    }

    if (salvo === "light") {
      document.documentElement.classList.remove("dark");
      setEscuro(false);
    }
  }, []);

  const alternar = () => {
    setEscuro((estadoAtual) => {
      const proximoEstado = !estadoAtual;

      document.documentElement.classList.toggle(
        "dark",
        proximoEstado,
      );

      window.localStorage.setItem(
        "erp:tema",
        proximoEstado ? "dark" : "light",
      );

      return proximoEstado;
    });
  };

  return [escuro, alternar] as const;
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: AppShellProps) {
  const navigate = useNavigate();

  const [usuario] = useUsuarioAtual();
  const [escuro, alternarTema] = useTemaEscuro();
  const [chamadoAberto, setChamadoAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

async function handleLogout() {
  if (saindo) {
    return;
  }

  setSaindo(true);

  try {
    await logoutFn();

    window.sessionStorage.removeItem(
    "syntera.installation.empresaId",
  );

  window.sessionStorage.removeItem(
    "syntera.installation.usuarioId",
  );

  window.location.replace(window.location.origin);
} catch (error) {
  console.error("Não foi possível encerrar a sessão.", error);
  setSaindo(false);
 }
}

return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            <div className="h-5 w-px bg-border" />

            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Buscar pedidos, produtos, contas..."
                className="h-8 w-80 border-border bg-secondary/60 pl-8 text-sm"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir notificações"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu do usuário"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary to-info text-xs font-semibold text-primary-foreground shadow-sm transition hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {usuario.avatarIniciais || (
                      <User className="h-4 w-4" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">
                      {usuario.nome}
                    </p>

                    <p className="text-[11px] font-normal text-muted-foreground">
                      {usuario.email}
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>

                  <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                    {escuro ? (
                      <Moon className="h-3.5 w-3.5" />
                    ) : (
                      <Sun className="h-3.5 w-3.5" />
                    )}

                    <span className="flex-1">
                      Versão {escuro ? "Escura" : "Clara"}
                    </span>

                    <button
                      type="button"
                      aria-label="Alternar tema"
                      onClick={alternarTema}
                      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
                        escuro
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${
                          escuro ? "left-[19px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Alterar Senha
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2"
                    >
                      <Fingerprint className="h-3.5 w-3.5" />
                      Meu PIN de Ponto
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setChamadoAberto(true)}
                    className="flex items-center gap-2"
                  >
                    <HeadphonesIcon className="h-3.5 w-3.5" />
                    Abrir Chamado
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      to="/academy"
                      className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <Sparkles className="h-3.5 w-3.5" />

                      <div className="flex-1">
                        <p className="text-xs font-semibold">
                          SynteraAcademy
                        </p>

                        <p className="text-[10px] font-normal text-muted-foreground">
                          Portal de conhecimento
                        </p>
                      </div>

                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={saindo}
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleLogout();
                    }}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />

                    {saindo ? "Saindo..." : "Sair"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>

                {subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              {actions ? (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              ) : null}
            </div>

            {children}
          </main>
        </div>
      </div>

      <Dialog
        open={chamadoAberto}
        onOpenChange={setChamadoAberto}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <HeadphonesIcon className="h-5 w-5 text-primary" />
              Central de Ajuda
            </DialogTitle>

            <DialogDescription>
              Abra um chamado, acesse a documentação ou fale com
              nosso suporte técnico pelo chat integrado.
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={() => setChamadoAberto(false)}
            className="mt-2"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}