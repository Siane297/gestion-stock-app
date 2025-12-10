-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "heurePointage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "attendances_employeeId_heurePointage_idx" ON "attendances"("employeeId", "heurePointage");
