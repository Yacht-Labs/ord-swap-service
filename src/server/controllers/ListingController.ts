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

  async buyListing(listingId: string, accountId: string): Promise<Listing> {
    try {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { buyerAccountId: accountId, status: "Sold" },
      });
      return listing;
    } catch (err) {
      throw err;
    }
  }
}
