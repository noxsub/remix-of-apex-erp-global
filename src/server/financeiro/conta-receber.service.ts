import { prisma } from "../prisma.server";
import {
  listarContasReceberSchema,
  type ListarContasReceberInput,
} from "./conta-receber.schema.ts";

export async function listarContasReceber(
  filtros: ListarContasReceberInput,
) {
  const dados = listarContasReceberSchema.parse(filtros);

  const periodoVencimento =
    dados.dataVencimentoInicial || dados.dataVencimentoFinal
      ? {
          gte: dados.dataVencimentoInicial,
          lte: dados.dataVencimentoFinal,
        }
      : undefined;

  return prisma.contaReceber.findMany({
    where: {
      empresaId: dados.empresaId,
      clienteId: dados.clienteId,
      status: dados.status,

      dataVencimento: periodoVencimento,

      ...(dados.busca
        ? {
            OR: [
              {
                numeroDocumento: {
                  contains: dados.busca,
                  mode: "insensitive",
                },
              },
              {
                descricao: {
                  contains: dados.busca,
                  mode: "insensitive",
                },
              },
              {
                cliente: {
                  is: {
                    razaoSocial: {
                      contains: dados.busca,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                cliente: {
                  is: {
                    nomeFantasia: {
                      contains: dados.busca,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      cliente: {
        select: {
          id: true,
          codigo: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpjCpf: true,
        },
      },
    },

    orderBy: [
      {
        dataVencimento: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}