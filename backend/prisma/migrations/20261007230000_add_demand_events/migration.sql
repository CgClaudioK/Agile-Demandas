-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CRIADA', 'EDITADA', 'STATUS', 'COMENTARIO');

-- CreateTable
CREATE TABLE "DemandEvent" (
    "id" SERIAL NOT NULL,
    "demandId" INTEGER NOT NULL,
    "type" "EventType" NOT NULL,
    "authorId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT,
    "toStatus" "Status",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemandEvent_demandId_createdAt_idx" ON "DemandEvent"("demandId", "createdAt");

-- AddForeignKey
ALTER TABLE "DemandEvent" ADD CONSTRAINT "DemandEvent_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

