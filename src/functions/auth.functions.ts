import { createServerFn } from "@tanstack/react-start";

import { loginSchema } from "../server/auth/auth.schema";
import { autenticarUsuario } from "../server/auth/auth.service";
import { prisma } from "../server/prisma.server";
import { useSynteraSession } from "../server/auth/session.server";

export const loginFn = createServerFn({
  method: "POST",
})
  .validator((dados: unknown) => {
    return loginSchema.parse(dados);
  })
  .handler(async ({ data }) => {
    const usuario = await autenticarUsuario(data);
    const session = await useSynteraSession();

    await session.update({
      usuarioId: usuario.id,
      empresaId: usuario.empresaId,
      perfil: usuario.perfil,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        empresaId: usuario.empresaId,
      },
      empresa: usuario.empresa,
    };
  });

export const obterSessaoFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const session = await useSynteraSession();
  const dados = session.data;

  if (!dados.usuarioId || !dados.empresaId) {
    return {
      autenticado: false as const,
      usuario: null,
      empresa: null,
    };
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      id: dados.usuarioId,
      empresaId: dados.empresaId,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
      empresaId: true,
      empresa: {
        select: {
          id: true,
          razaoSocial: true,
          nomeFantasia: true,
          ativo: true,
        },
      },
    },
  });

  if (
    !usuario ||
    !usuario.ativo ||
    !usuario.empresa.ativo
  ) {
    await session.clear();

    return {
      autenticado: false as const,
      usuario: null,
      empresa: null,
    };
  }

  return {
    autenticado: true as const,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      empresaId: usuario.empresaId,
    },
    empresa: {
      id: usuario.empresa.id,
      razaoSocial: usuario.empresa.razaoSocial,
      nomeFantasia: usuario.empresa.nomeFantasia,
    },
  };
});

export const logoutFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await useSynteraSession();

  await session.clear();

  return {
    sucesso: true,
  };
});