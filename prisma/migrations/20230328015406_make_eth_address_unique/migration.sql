/*
  Warnings:

  - A unique constraint covering the columns `[ethAddress]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_ethAddress_key" ON "Account"("ethAddress");
