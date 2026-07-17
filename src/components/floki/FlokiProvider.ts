import { useMemo } from "react";

import { filtrarAtividadesPorPerfil } from "./floki.permissions";
import { converterPerfilSessaoParaFloki } from "./floki-session-profile";
import { obterSaudeFinanceiro } from "./providers/financeiro.provider";

type Props = {
  perfil: string | null | undefined;
};

export function useFlokiProvider({
  perfil,
}: Props) {
  const perfilFloki =
    converterPerfilSessaoParaFloki(perfil);

  const resultado = useMemo(() => {
    const financeiro = obterSaudeFinanceiro();

    const modules = [financeiro];

    const todasAsAtividades = modules.flatMap(
      (module) => module.activities,
    );

    const activities =
      filtrarAtividadesPorPerfil(
        todasAsAtividades,
        perfilFloki,
      );

    const visibleModules = modules.filter(
      (module) =>
        module.activities.some((activity) =>
          activities.some(
            (visibleActivity) =>
              visibleActivity.id === activity.id,
          ),
        ),
    );

    const healthScore =
      visibleModules.length === 0
        ? null
        : Math.round(
            visibleModules.reduce(
              (total, module) =>
                total + module.score,
              0,
            ) / visibleModules.length,
          );

    const criticalCount =
      visibleModules.reduce(
        (total, module) =>
          total + module.critical,
        0,
      );

    const warningCount =
      visibleModules.reduce(
        (total, module) =>
          total + module.warning,
        0,
      );

    const infoCount =
      visibleModules.reduce(
        (total, module) =>
          total + module.info,
        0,
      );

    return {
      activities,
      modules: visibleModules,
      healthScore,
      criticalCount,
      warningCount,
      infoCount,
    };
  }, [perfilFloki]);

  return {
    perfilFloki,
    activities: resultado.activities,
    total: resultado.activities.length,
    modules: resultado.modules,
    healthScore: resultado.healthScore,
    criticalCount: resultado.criticalCount,
    warningCount: resultado.warningCount,
    infoCount: resultado.infoCount,
  };
}