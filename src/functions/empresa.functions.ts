import { createServerFn } from "@tanstack/react-start";

import { criarEmpresaSchema } from "../server/empresas/empresa.schema";
import {
  criarEmpresa,
  listarEmpresas,
} from "../server/empresas/empresa.service";

export const criarEmpresaFn = createServerFn({
  method: "POST",
})
  .validator((dados: unknown) => {
    return criarEmpresaSchema.parse(dados);
  })
  .handler(async ({ data }) => {
    return criarEmpresa(data);
  });

export const listarEmpresasFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return listarEmpresas();
});