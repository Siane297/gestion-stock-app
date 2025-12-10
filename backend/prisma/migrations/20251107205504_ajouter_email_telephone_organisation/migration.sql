/*
  Warnings:

  - Added the required column `emailOrganisation` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephoneOrganisation` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "emailOrganisation" TEXT NOT NULL,
ADD COLUMN     "telephoneOrganisation" TEXT NOT NULL;
