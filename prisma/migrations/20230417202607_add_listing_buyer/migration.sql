-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('NeedsCardinal', 'NeedsOrdinal', 'NeedsBoth', 'Ready', 'Sold', 'Cancelled');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "buyerAccountId" TEXT,
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'NeedsCardinal';

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_buyerAccountId_fkey" FOREIGN KEY ("buyerAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
