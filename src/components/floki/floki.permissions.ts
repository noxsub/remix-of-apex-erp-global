import type {
  FlokiActivity,
  FlokiActivityArea,
} from "./floki-activity";

export type FlokiUserProfile =
  | "ADMINISTRADOR"
  | "DIRETOR"
  | "GESTOR_FINANCEIRO"
  | "ANALISTA_FINANCEIRO"
  | "GESTOR_RH"
  | "ANALISTA_RH"
  | "GESTOR_FISCAL"
  | "ANALISTA_FISCAL"
  | "COMPRAS"
  | "ESTOQUE"
  | "COMERCIAL"
  | "USUARIO";

const areasPorPerfil: Record<
  FlokiUserProfile,
  FlokiActivityArea[]
> = {
  ADMINISTRADOR: [
    "FINANCEIRO",
    "RH",
    "COMPRAS",
    "ESTOQUE",
    "FISCAL",
    "COMERCIAL",
    "GESTAO",
  ],

  DIRETOR: [
    "FINANCEIRO",
    "RH",
    "COMPRAS",
    "ESTOQUE",
    "FISCAL",
    "COMERCIAL",
    "GESTAO",
  ],

  GESTOR_FINANCEIRO: [
    "FINANCEIRO",
    "FISCAL",
    "GESTAO",
  ],

  ANALISTA_FINANCEIRO: [
    "FINANCEIRO",
  ],

  GESTOR_RH: [
    "RH",
    "GESTAO",
  ],

  ANALISTA_RH: [
    "RH",
  ],

  GESTOR_FISCAL: [
    "FISCAL",
    "GESTAO",
  ],

  ANALISTA_FISCAL: [
    "FISCAL",
  ],

  COMPRAS: [
    "COMPRAS",
    "ESTOQUE",
  ],

  ESTOQUE: [
    "ESTOQUE",
  ],

  COMERCIAL: [
    "COMERCIAL",
  ],

  /*
   * Perfil ainda não classificado.
   * Não recebe atividades até possuir permissões definidas.
   */
  USUARIO: [],
};

export function obterAreasPermitidasPorPerfil(
  perfil: FlokiUserProfile,
): FlokiActivityArea[] {
  return areasPorPerfil[perfil];
}

export function filtrarAtividadesPorPerfil(
  atividades: FlokiActivity[],
  perfil: FlokiUserProfile,
): FlokiActivity[] {
  const areasPermitidas =
    obterAreasPermitidasPorPerfil(perfil);

  return atividades.filter((atividade) =>
    areasPermitidas.includes(atividade.area),
  );
}