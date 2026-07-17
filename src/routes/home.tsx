import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { useFlokiProvider } from "@/components/floki/FlokiProvider";
import { FlokiScene } from "@/components/floki/FlokiScene";
import { requireAuthenticatedRoute } from "@/lib/require-auth";
import { useSessionUser } from "@/lib/use-session-user";

export const Route = createFileRoute("/home")({
  beforeLoad: async () => {
    return requireAuthenticatedRoute();
  },

  head: () => ({
    meta: [
      {
        title: "Home — Syntera ERP",
      },
    ],
  }),

  component: HomePage,
});

function HomePage() {
  const sessao = useSessionUser();

  const primeiroNome =
    sessao.usuario?.nome?.trim().split(/\s+/)[0] ??
    "Usuário";

  const floki = useFlokiProvider({
    perfil: sessao.usuario?.perfil,
  });

  return (
    <AppShell
      title={
        sessao.carregando
          ? "Bom dia."
          : `Bom dia, ${primeiroNome}.`
      }
      subtitle="O Floki já verificou o ambiente e está pronto para conduzir suas prioridades."
    >
      <FlokiScene
        userName={primeiroNome}
        activities={floki.activities}
      />
    </AppShell>
  );
}