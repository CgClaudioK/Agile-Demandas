-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SOLICITANTE', 'ANALISTA');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ABERTA', 'EM_ANALISE', 'APROVADA', 'REJEITADA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'SOLICITANTE';

-- CreateTable
CREATE TABLE "Demand" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIA',
    "status" "Status" NOT NULL DEFAULT 'ABERTA',
    "decisionComment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Demand_status_priority_createdAt_idx" ON "Demand"("status", "priority", "createdAt");

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

