import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não foi definida. Verifique o arquivo .env na raiz do projeto.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Iniciando Seed do Syntera...");

  const empresa = await prisma.empresa.upsert({
    where: {
      cnpj: "12345678000190",
    },
    update: {
      razaoSocial: "Syntera Tecnologia Ltda.",
      nomeFantasia: "Syntera Demo",
      email: "contato@syntera.demo",
      telefone: "(11) 4000-1234",
      ativo: true,
    },
    create: {
      razaoSocial: "Syntera Tecnologia Ltda.",
      nomeFantasia: "Syntera Demo",
      cnpj: "12345678000190",
      email: "contato@syntera.demo",
      telefone: "(11) 4000-1234",
      ativo: true,
    },
  });

  await prisma.configuracaoEmpresa.upsert({
    where: {
      empresaId: empresa.id,
    },
    update: {
      moeda: "BRL",
      idioma: "pt-BR",
      fusoHorario: "America/Sao_Paulo",
      regimeTributario: "SIMPLES_NACIONAL",
    },
    create: {
      empresaId: empresa.id,
      moeda: "BRL",
      idioma: "pt-BR",
      fusoHorario: "America/Sao_Paulo",
      regimeTributario: "SIMPLES_NACIONAL",
    },
  });

  console.log(`🏢 Empresa preparada: ${empresa.nomeFantasia}`);

  const clientesDemo = [
  {
    codigo: "CLI-001",
    razaoSocial: "Mercado Horizonte Ltda.",
    nomeFantasia: "Mercado Horizonte",
    cnpjCpf: "11222333000181",
    email: "financeiro@mercadohorizonte.demo",
    telefone: "(11) 3000-1001",
  },
  {
    codigo: "CLI-002",
    razaoSocial: "Distribuidora Vale Azul Ltda.",
    nomeFantasia: "Vale Azul",
    cnpjCpf: "22333444000192",
    email: "contas@valeazul.demo",
    telefone: "(11) 3000-1002",
  },
  {
    codigo: "CLI-003",
    razaoSocial: "Comercial Nova Era Ltda.",
    nomeFantasia: "Nova Era",
    cnpjCpf: "33444555000103",
    email: "financeiro@novaera.demo",
    telefone: "(11) 3000-1003",
  },
  {
    codigo: "CLI-004",
    razaoSocial: "Grupo Serra Verde Ltda.",
    nomeFantasia: "Serra Verde",
    cnpjCpf: "44555666000114",
    email: "pagamentos@serraverde.demo",
    telefone: "(11) 3000-1004",
  },
  {
    codigo: "CLI-005",
    razaoSocial: "Atacado Central do Brasil Ltda.",
    nomeFantasia: "Atacado Central",
    cnpjCpf: "55666777000125",
    email: "financeiro@atacadocentral.demo",
    telefone: "(11) 3000-1005",
  },
];

const clientes = [];

for (const clienteDemo of clientesDemo) {
  const cliente = await prisma.cliente.upsert({
    where: {
      empresaId_cnpjCpf: {
        empresaId: empresa.id,
        cnpjCpf: clienteDemo.cnpjCpf,
      },
    },
    update: {
      codigo: clienteDemo.codigo,
      razaoSocial: clienteDemo.razaoSocial,
      nomeFantasia: clienteDemo.nomeFantasia,
      email: clienteDemo.email,
      telefone: clienteDemo.telefone,
      ativo: true,
    },
    create: {
      ...clienteDemo,
      empresaId: empresa.id,
      ativo: true,
    },
  });

  clientes.push(cliente);
}

console.log(`👥 Clientes preparados: ${clientes.length}`);

}

main()
  .then(async () => {
    console.log("✅ Seed finalizado.");
    await prisma.$disconnect();
  })
  .catch(async (erro: unknown) => {
    console.error("❌ Erro ao executar Seed:", erro);
    await prisma.$disconnect();
    process.exit(1);
  });