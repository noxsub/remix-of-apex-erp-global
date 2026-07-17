import { CheckCircle2 } from "lucide-react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { InstallationCard } from "../components/installation/InstallationCard";
import { InstallationLayout } from "../components/installation/InstallationLayout";
import { Button } from "../components/ui/button";

export const Route = createFileRoute(
  "/configuracao-inicial_/conclusao",
)({
  component: ConfiguracaoConclusaoPage,
});

function ConfiguracaoConclusaoPage() {
  const navigate = useNavigate();

  async function finalizarInstalacao() {
    window.sessionStorage.removeItem(
      "syntera.installation.empresaId",
    );

    window.sessionStorage.removeItem(
      "syntera.installation.usuarioId",
    );

    await navigate({
      to: "/",
    });
  }

  return (
    <InstallationLayout
      title="Configuração concluída"
      description="Seu ambiente inicial foi preparado com sucesso."
    >
      <InstallationCard
        step={4}
        totalSteps={4}
        title="Syntera pronto para uso"
        description="A empresa, o administrador e as preferências iniciais foram configurados."
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center rounded-xl border bg-muted/30 px-6 py-10 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-9" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Tudo pronto!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              A configuração inicial do Syntera foi concluída.
              Agora você já pode acessar o sistema e começar a
              preparar os cadastros da empresa.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">
              Próximas etapas
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Após entrar no sistema, você poderá cadastrar
              clientes, fornecedores, produtos e demais informações
              operacionais.
            </p>
          </div>

          <Button
            type="button"
            className="h-12 w-full"
            onClick={finalizarInstalacao}
          >
            Acessar o Syntera
          </Button>
        </div>
      </InstallationCard>
    </InstallationLayout>
  );
}