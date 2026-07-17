-- CreateEnum
CREATE TYPE "RegimeTributario" AS ENUM ('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI');

-- CreateTable
CREATE TABLE "ConfiguracaoEmpresa" (
    "id" TEXT NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "idioma" TEXT NOT NULL DEFAULT 'pt-BR',
    "fusoHorario" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "regimeTributario" "RegimeTributario" NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoEmpresa_empresaId_key" ON "ConfiguracaoEmpresa"("empresaId");

-- AddForeignKey
ALTER TABLE "ConfiguracaoEmpresa" ADD CONSTRAINT "ConfiguracaoEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
