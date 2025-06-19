/*
  Warnings:

  - You are about to drop the column `Address` on the `Gym` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gym" DROP COLUMN "Address",
ADD COLUMN     "address" TEXT;
