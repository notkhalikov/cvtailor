-- CreateTable
CREATE TABLE "Adaptation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Адаптация',
    "jobText" TEXT,
    "jobData" JSONB,
    "adaptedData" JSONB,
    "matchScore" INTEGER,
    "gaps" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adaptation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Adaptation_userId_idx" ON "Adaptation"("userId");

-- CreateIndex
CREATE INDEX "Adaptation_resumeId_idx" ON "Adaptation"("resumeId");

-- AddForeignKey
ALTER TABLE "Adaptation" ADD CONSTRAINT "Adaptation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adaptation" ADD CONSTRAINT "Adaptation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
