/*
  Warnings:

  - You are about to drop the column `duration` on the `Plans` table. All the data in the column will be lost.
  - You are about to drop the column `last_verification_At` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verification_Attempts` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plans" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_verification_At",
DROP COLUMN "verification_Attempts";
