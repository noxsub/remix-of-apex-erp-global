/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,numeroDocumento]` on the table `ContaReceber` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContaReceber_empresaId_numeroDocumento_key" ON "ContaReceber"("empresaId", "numeroDocumento");
