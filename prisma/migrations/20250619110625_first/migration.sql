/*
  Warnings:

  - You are about to drop the column `locationLink` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "locationLink" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationLink";
