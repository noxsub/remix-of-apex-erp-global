import { prisma } from "../prisma.server";
import type { SalvarConfiguracaoEmpresaInput } from "./configuracao.schema";

export async function salvarConfiguracaoEmpresa(
  dados: SalvarConfiguracaoEmpresaInput,
) {
  const empresa = await prisma.empresa.findUnique({
    where: {
      id: dados.empresaId,
    },
  });

  if (!empresa) {
    throw new Error("A empresa informada não foi encontrada.");
  }

  return prisma.configuracaoEmpresa.upsert({
    where: {
      empresaId: dados.empresaId,
    },
    update: {
      moeda: dados.moeda,
      idioma: dados.idioma,
      fusoHorario: dados.fusoHorario,
      regimeTributario: dados.regimeTributario,
    },
    create: {
      empresaId: dados.empresaId,
      moeda: dados.moeda,
      idioma: dados.idioma,
      fusoHorario: dados.fusoHorario,
      regimeTributario: dados.regimeTributario,
    },
  });
}