-- CreateTable
CREATE TABLE "AiUsageDay" (
    "day" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheWriteTokens" INTEGER NOT NULL DEFAULT 0,
    "costMicroUsd" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiUsageDay_pkey" PRIMARY KEY ("day")
);

-- CreateTable
CREATE TABLE "AiSearchMiss" (
    "id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSearchMiss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiSearchMiss_createdAt_idx" ON "AiSearchMiss"("createdAt");

-- CreateIndex
CREATE INDEX "AiSearchMiss_tool_createdAt_idx" ON "AiSearchMiss"("tool", "createdAt");
