/*
  Warnings:

  - Added the required column `color` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;
