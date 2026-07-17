import { createServerFn } from "@tanstack/react-start";

import { criarAdministradorSchema } from "../server/usuarios/usuario.schema";
import { criarAdministrador } from "../server/usuarios/usuario.service";

export const criarAdministradorFn = createServerFn({
  method: "POST",
})
  .validator((dados: unknown) => {
    return criarAdministradorSchema.parse(dados);
  })
  .handler(async ({ data }) => {
    const usuario = await criarAdministrador(data);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      empresaId: usuario.empresaId,
    };
  });