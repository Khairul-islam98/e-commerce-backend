/*
  Warnings:

  - A unique constraint covering the columns `[owner]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shops_owner_key" ON "shops"("owner");
