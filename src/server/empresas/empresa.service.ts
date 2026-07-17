import { prisma } from "../prisma.server";
import type { CriarEmpresaInput } from "./empresa.schema";

export async function criarEmpresa(data: CriarEmpresaInput) {
  const empresaExistente = await prisma.empresa.findUnique({
    where: {
      cnpj: data.cnpj,
    },
  });

  if (empresaExistente) {
    throw new Error("Já existe uma empresa cadastrada com este CNPJ.");
  }

  return prisma.empresa.create({
    data,
  });
}

export async function listarEmpresas() {
  return prisma.empresa.findMany({
    orderBy: {
      razaoSocial: "asc",
    },
  });
}