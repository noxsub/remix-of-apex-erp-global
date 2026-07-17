-- CreateEnum
CREATE TYPE "StatusContaReceber" AS ENUM ('PENDENTE', 'PARCIAL', 'RECEBIDO', 'VENCIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "descricao" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorOriginal" DECIMAL(65,30) NOT NULL,
    "valorRecebido" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valorAberto" DECIMAL(65,30) NOT NULL,
    "juros" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "multa" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "StatusContaReceber" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContaReceber_empresaId_idx" ON "ContaReceber"("empresaId");

-- CreateIndex
CREATE INDEX "ContaReceber_clienteId_idx" ON "ContaReceber"("clienteId");

-- CreateIndex
CREATE INDEX "ContaReceber_status_idx" ON "ContaReceber"("status");

-- CreateIndex
CREATE INDEX "ContaReceber_dataVencimento_idx" ON "ContaReceber"("dataVencimento");

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
