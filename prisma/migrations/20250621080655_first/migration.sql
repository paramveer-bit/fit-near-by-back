/*
  Warnings:

  - The primary key for the `GymOperatingHours` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "GymOperatingHours" DROP CONSTRAINT "GymOperatingHours_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GymOperatingHours_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GymOperatingHours_id_seq";
