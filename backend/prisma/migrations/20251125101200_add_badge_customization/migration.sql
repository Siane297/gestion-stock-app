-- CreateTable
CREATE TABLE "badge_customizations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "borderColor" TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.6)',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badge_customizations_companyId_key" ON "badge_customizations"("companyId");

-- AddForeignKey
ALTER TABLE "badge_customizations" ADD CONSTRAINT "badge_customizations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
