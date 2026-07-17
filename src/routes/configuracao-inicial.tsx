import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import { InstallationCard } from "../components/installation/InstallationCard";
import { InstallationLayout } from "../components/installation/InstallationLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { criarEmpresaFn } from "../functions/empresa.functions";
import {
  formatarCnpj,
  formatarTelefone,
} from "../lib/formatters.ts";

export const Route = createFileRoute("/configuracao-inicial")({
  component: ConfiguracaoInicialPage,
});

function ConfiguracaoInicialPage() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCarregando(true);
    setErro("");

    const formulario = event.currentTarget;
    const dadosFormulario = new FormData(formulario);

    try {
      const empresa = await criarEmpresaFn({
        data: {
          razaoSocial: String(
            dadosFormulario.get("razaoSocial") ?? "",
          ),
          nomeFantasia: String(
            dadosFormulario.get("nomeFantasia") ?? "",
          ),
          cnpj,
          email: String(dadosFormulario.get("email") ?? ""),
          telefone,
        },
      });

      window.sessionStorage.setItem(
        "syntera.installation.empresaId",
        empresa.id,
      );

      await navigate({
        to: "/configuracao-inicial/administrador",
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a empresa.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function handleCnpjChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setCnpj(formatarCnpj(event.target.value));
  }

  function handleTelefoneChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setTelefone(formatarTelefone(event.target.value));
  }

  return (
    <InstallationLayout
      title="Bem-vindo ao Syntera"
      description="Vamos configurar seu ERP. Este processo leva aproximadamente 1 minuto."
    >
      <InstallationCard
        step={1}
        totalSteps={4}
        title="Dados da empresa"
        description="Essas informações identificarão sua empresa em todo o sistema."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Campo
            label="Razão social"
            name="razaoSocial"
            placeholder="Ex.: Syntera Tecnologia Ltda."
            required
          />

          <Campo
            label="Nome fantasia"
            name="nomeFantasia"
            placeholder="Ex.: Syntera"
          />

          <CampoMascarado
            label="CNPJ"
            name="cnpj"
            value={cnpj}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0000-00 ou YC.ZH2.STC/0001-15"
            maxLength={18}
            required
          />

          <Campo
            label="E-mail"
            name="email"
            type="email"
            placeholder="contato@empresa.com.br"
          />

          <CampoMascarado
            label="Telefone"
            name="telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            placeholder="(11) 99999-9999"
            inputMode="numeric"
            maxLength={15}
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

type CampoProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Campo({
  label,
  name,
  type = "text",
  placeholder,
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
        required={required}
        className="h-12"
      />
    </div>
  );
}

type CampoMascaradoProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  required?: boolean;
};

function CampoMascarado({
  label,
  name,
  value,
  onChange,
  placeholder,
  inputMode = "text",
  maxLength,
  required = false,
}: CampoMascaradoProps) {
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        className="h-12"
      />
    </div>
  );
}