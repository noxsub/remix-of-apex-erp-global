import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { InstallationCard } from "../components/installation/InstallationCard";
import { InstallationLayout } from "../components/installation/InstallationLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { criarAdministradorFn } from "../functions/usuario.functions";

export const Route = createFileRoute(
  "/configuracao-inicial_/administrador",
)({
  component: ConfiguracaoAdministradorPage,
});

function ConfiguracaoAdministradorPage() {
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
      const usuario = await criarAdministradorFn({
        data: {
          empresaId,
          nome: String(dadosFormulario.get("nome") ?? ""),
          email: String(dadosFormulario.get("email") ?? ""),
          senha: String(dadosFormulario.get("senha") ?? ""),
          confirmarSenha: String(
            dadosFormulario.get("confirmarSenha") ?? "",
          ),
        },
      });

      window.sessionStorage.setItem(
        "syntera.installation.usuarioId",
        usuario.id,
      );

      await navigate({
        to: "/configuracao-inicial/configuracoes",
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o administrador.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <InstallationLayout
      title="Crie o administrador"
      description="Este será o primeiro usuário com acesso completo ao Syntera."
    >
      <InstallationCard
        step={2}
        totalSteps={4}
        title="Usuário administrador"
        description="Use um e-mail válido. Ele será utilizado para acessar o sistema."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Campo
            label="Nome completo"
            name="nome"
            placeholder="Ex.: Bruno Pagliuso"
            autoComplete="name"
            required
          />

          <Campo
            label="E-mail"
            name="email"
            type="email"
            placeholder="administrador@empresa.com.br"
            autoComplete="email"
            required
          />

          <Campo
            label="Senha"
            name="senha"
            type="password"
            placeholder="Digite uma senha segura"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <Campo
            label="Confirmar senha"
            name="confirmarSenha"
            type="password"
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <p className="text-sm text-muted-foreground">
            A senha deve possuir pelo menos 8 caracteres.
          </p>

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
            {carregando ? "Criando administrador..." : "Continuar"}
          </Button>
        </form>
      </InstallationCard>
    </InstallationLayout>
  );
}

type CampoProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

function Campo({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  minLength,
  required = false,
}: CampoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="ml-1 text-destructive">*</span>
        )}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="h-12"
      />
    </div>
  );
}