/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Account_id_seq";

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "inscriptionNumber" TEXT NOT NULL,
    "listingAccountId" TEXT NOT NULL,
    "ethPrice" TEXT NOT NULL,
    "pkpPublicKey" TEXT NOT NULL,
    "taprootAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellDate" TIMESTAMP(3),
    "cancelledDate" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingAccountId_fkey" FOREIGN KEY ("listingAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
