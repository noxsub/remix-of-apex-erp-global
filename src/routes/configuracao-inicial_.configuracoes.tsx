import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { InstallationCard } from "../components/installation/InstallationCard";
import { InstallationLayout } from "../components/installation/InstallationLayout";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { salvarConfiguracaoEmpresaFn } from "../functions/configuracao.functions";

export const Route = createFileRoute(
  "/configuracao-inicial_/configuracoes",
)({
  component: ConfiguracoesIniciaisPage,
});

function ConfiguracoesIniciaisPage() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCarregando(true);
    setErro("");

    const empresaId = window.sessionStorage.getItem(
      "syntera.installation.empresaId",
    );

    if (!empresaId) {
      setErro(
        "A empresa da instalação não foi encontrada. Volte à primeira etapa.",
      );
      setCarregando(false);
      return;
    }

    const dadosFormulario = new FormData(event.currentTarget);

    try {
      await salvarConfiguracaoEmpresaFn({
        data: {
          empresaId,
          moeda: String(dadosFormulario.get("moeda") ?? ""),
          idioma: String(dadosFormulario.get("idioma") ?? ""),
          fusoHorario: String(
            dadosFormulario.get("fusoHorario") ?? "",
          ),
          regimeTributario: String(
            dadosFormulario.get("regimeTributario") ?? "",
          ),
        },
      });

      await navigate({
        to: "/configuracao-inicial/conclusao",
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as configurações iniciais.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <InstallationLayout
      title="Configurações iniciais"
      description="Defina as preferências básicas que serão utilizadas no ambiente da empresa."
    >
      <InstallationCard
        step={3}
        totalSteps={4}
        title="Preferências do ambiente"
        description="Essas configurações poderão ser alteradas posteriormente no painel administrativo."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <CampoSelecao
            label="Moeda"
            name="moeda"
            defaultValue="BRL"
            options={[
              {
                value: "BRL",
                label: "Real brasileiro (BRL)",
              },
            ]}
            required
          />

          <CampoSelecao
            label="Idioma"
            name="idioma"
            defaultValue="pt-BR"
            options={[
              {
                value: "pt-BR",
                label: "Português do Brasil",
              },
            ]}
            required
          />

          <CampoSelecao
            label="Fuso horário"
            name="fusoHorario"
            defaultValue="America/Sao_Paulo"
            options={[
              {
                value: "America/Sao_Paulo",
                label: "Brasília — UTC−03:00",
              },
              {
                value: "America/Manaus",
                label: "Manaus — UTC−04:00",
              },
              {
                value: "America/Rio_Branco",
                label: "Rio Branco — UTC−05:00",
              },
              {
                value: "America/Noronha",
                label: "Fernando de Noronha — UTC−02:00",
              },
            ]}
            required
          />

          <CampoSelecao
            label="Regime tributário"
            name="regimeTributario"
            defaultValue=""
            options={[
              {
                value: "",
                label: "Selecione o regime tributário",
              },
              {
                value: "SIMPLES_NACIONAL",
                label: "Simples Nacional",
              },
              {
                value: "LUCRO_PRESUMIDO",
                label: "Lucro Presumido",
              },
              {
                value: "LUCRO_REAL",
                label: "Lucro Real",
              },
              {
                value: "MEI",
                label: "Microempreendedor Individual — MEI",
              },
            ]}
            required
          />

          {erro && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          <Button
            type="submit"
            disabled={carregando}
            className="h-12 w-full"
          >
            {carregando ? "Salvando..." : "Continuar"}
          </Button>
        </form>
      </InstallationCard>
    </InstallationLayout>
  );
}

type Opcao = {
  value: string;
  label: string;
};

type CampoSelecaoProps = {
  label: string;
  name: string;
  options: Opcao[];
  defaultValue?: string;
  required?: boolean;
};

function CampoSelecao({
  label,
  name,
  options,
  defaultValue,
  required = false,
}: CampoSelecaoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="ml-1 text-destructive">*</span>
        )}
      </Label>

      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}