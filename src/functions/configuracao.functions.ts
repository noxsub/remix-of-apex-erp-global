import { createServerFn } from "@tanstack/react-start";

import { salvarConfiguracaoEmpresaSchema } from "../server/configuracoes/configuracao.schema";
import { salvarConfiguracaoEmpresa } from "../server/configuracoes/configuracao.service";

export const salvarConfiguracaoEmpresaFn = createServerFn({
  method: "POST",
})
  .validator((dados: unknown) => {
    return salvarConfiguracaoEmpresaSchema.parse(dados);
  })
  .handler(async ({ data }) => {
    const configuracao = await salvarConfiguracaoEmpresa(data);

    return {
      id: configuracao.id,
      empresaId: configuracao.empresaId,
      moeda: configuracao.moeda,
      idioma: configuracao.idioma,
      fusoHorario: configuracao.fusoHorario,
      regimeTributario: configuracao.regimeTributario,
    };
  });