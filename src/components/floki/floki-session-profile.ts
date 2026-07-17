import type { FlokiUserProfile } from "./floki.permissions";

export function converterPerfilSessaoParaFloki(
  perfil: string | null | undefined,
): FlokiUserProfile {
  const perfilNormalizado =
    perfil
      ?.trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s-]+/g, "_") ?? "";

  switch (perfilNormalizado) {
    case "ADMINISTRADOR":
    case "ADMIN":
    case "SUPER_ADMIN":
      return "ADMINISTRADOR";

    case "DIRETOR":
    case "DIRETORIA":
    case "PRESIDENTE":
    case "PROPRIETARIO":
    case "SOCIO":
      return "DIRETOR";

    case "GESTOR_FINANCEIRO":
    case "GERENTE_FINANCEIRO":
    case "COORDENADOR_FINANCEIRO":
    case "SUPERVISOR_FINANCEIRO":
      return "GESTOR_FINANCEIRO";

    case "FINANCEIRO":
    case "ANALISTA_FINANCEIRO":
    case "ASSISTENTE_FINANCEIRO":
    case "AUXILIAR_FINANCEIRO":
      return "ANALISTA_FINANCEIRO";

    case "GESTOR_RH":
    case "GERENTE_RH":
    case "COORDENADOR_RH":
    case "SUPERVISOR_RH":
      return "GESTOR_RH";

    case "RH":
    case "ANALISTA_RH":
    case "ASSISTENTE_RH":
    case "AUXILIAR_RH":
      return "ANALISTA_RH";

    case "GESTOR_FISCAL":
    case "GERENTE_FISCAL":
    case "COORDENADOR_FISCAL":
    case "SUPERVISOR_FISCAL":
      return "GESTOR_FISCAL";

    case "FISCAL":
    case "ANALISTA_FISCAL":
    case "ASSISTENTE_FISCAL":
    case "AUXILIAR_FISCAL":
      return "ANALISTA_FISCAL";

    case "COMPRAS":
    case "ANALISTA_COMPRAS":
    case "COMPRADOR":
      return "COMPRAS";

    case "ESTOQUE":
    case "ALMOXARIFADO":
    case "ALMOXARIFE":
    case "OPERACIONAL":
      return "ESTOQUE";

    case "COMERCIAL":
    case "VENDAS":
    case "VENDEDOR":
    case "ANALISTA_COMERCIAL":
      return "COMERCIAL";

    default:
      return "USUARIO";
  }
}