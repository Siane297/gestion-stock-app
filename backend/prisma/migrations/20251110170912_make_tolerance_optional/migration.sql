-- AlterTable
ALTER TABLE "configurations_horaire" ALTER COLUMN "toleranceRetardMinutes" DROP NOT NULL,
ALTER COLUMN "toleranceRetardMinutes" DROP DEFAULT;
