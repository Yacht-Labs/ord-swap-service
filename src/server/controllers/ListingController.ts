import { Listing } from "@prisma/client";
import prisma from "../../db/prisma";

export class ListingController {
  async getListingsByBuyer(accountId: string): Promise<Listing[]> {
    try {
      const listings = await prisma.listing.findMany({
        where: { buyerAccountId: accountId },
      });
      return listings;
    } catch (err) {
      throw err;
    }
  }
  async getListingsBySeller(accountId: string): Promise<Listing[]> {
    try {
      const listings = await prisma.listing.findMany({
        where: { listingAccountId: accountId },
      });
      return listings;
    } catch (err) {
      throw err;
    }
  }
}
