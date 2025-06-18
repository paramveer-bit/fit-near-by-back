-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_verification_At" TIMESTAMP(3),
ADD COLUMN     "verification_Attempts" INTEGER NOT NULL DEFAULT 0;
