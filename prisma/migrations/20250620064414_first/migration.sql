/*
  Warnings:

  - You are about to drop the column `description` on the `Plans` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Plans` table. All the data in the column will be lost.
  - Added the required column `newprice` to the `Plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldprice` to the `Plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plans" DROP COLUMN "description",
DROP COLUMN "price",
ADD COLUMN     "featured" TEXT[],
ADD COLUMN     "newprice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "oldprice" DOUBLE PRECISION NOT NULL;
