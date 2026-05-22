-- CreateTable
CREATE TABLE "AdaptationVersion" (
    "id" TEXT NOT NULL,
    "adaptationId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "matchScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdaptationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdaptationVersion_adaptationId_idx" ON "AdaptationVersion"("adaptationId");

-- AddForeignKey
ALTER TABLE "AdaptationVersion" ADD CONSTRAINT "AdaptationVersion_adaptationId_fkey" FOREIGN KEY ("adaptationId") REFERENCES "Adaptation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
