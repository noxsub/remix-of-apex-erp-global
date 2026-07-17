import { compare } from "bcryptjs";

import { prisma } from "../prisma.server";
import type { LoginInput } from "./auth.schema";

export async function autenticarUsuario(dados: LoginInput) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      email: dados.email,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      senhaHash: true,
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

  /*
   * Usamos a mesma mensagem para e-mail inexistente e senha incorreta.
   * Isso evita revelar quais e-mails estão cadastrados no sistema.
   */
  if (!usuario) {
    throw new Error("E-mail ou senha inválidos.");
  }

  if (!usuario.ativo || !usuario.empresa.ativo) {
    throw new Error(
      "Este acesso está desativado. Entre em contato com o administrador.",
    );
  }

  const senhaCorreta = await compare(
    dados.senha,
    usuario.senhaHash,
  );

  if (!senhaCorreta) {
    throw new Error("E-mail ou senha inválidos.");
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    empresaId: usuario.empresaId,
    empresa: {
      id: usuario.empresa.id,
      razaoSocial: usuario.empresa.razaoSocial,
      nomeFantasia: usuario.empresa.nomeFantasia,
    },
  };
}