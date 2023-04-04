-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "btcPayoutAddress" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "inscriptionNumber" TEXT NOT NULL,
    "listingAccountId" TEXT NOT NULL,
    "ethPrice" TEXT NOT NULL,
    "pkpPublicKey" TEXT NOT NULL,
    "pkpBtcAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedDate" TIMESTAMP(3),
    "sellDate" TIMESTAMP(3),
    "cancelledDate" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_ethAddress_key" ON "Account"("ethAddress");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingAccountId_fkey" FOREIGN KEY ("listingAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
