import { hash } from "bcryptjs";

import { prisma } from "../prisma.server";
import type { CriarAdministradorInput } from "./usuario.schema";

export async function criarAdministrador(
  dados: CriarAdministradorInput,
) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      email: dados.email,
    },
  });

  if (usuarioExistente) {
    throw new Error(
      "Já existe um usuário cadastrado com este e-mail.",
    );
  }

  const senhaHash = await hash(dados.senha, 12);

  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      perfil: "ADMIN",
      empresaId: dados.empresaId,
    },
  });
}