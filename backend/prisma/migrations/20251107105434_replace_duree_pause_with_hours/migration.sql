/*
  Warnings:

  - You are about to drop the column `dureePauseMinutes` on the `configurations_horaire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "configurations_horaire" DROP COLUMN "dureePauseMinutes",
ADD COLUMN     "heureDebutPause" TEXT,
ADD COLUMN     "heureFinPause" TEXT;
