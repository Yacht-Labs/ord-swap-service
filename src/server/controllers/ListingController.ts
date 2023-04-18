import { Listing } from "@prisma/client";
import prisma from "../../db/prisma";
import { NotFoundError } from "../../types/errors";
import { ListingWithAccount } from "../../types/models";

export class ListingController {
  async getListingById(listingId: string): Promise<ListingWithAccount> {
    // include account in the Listing type
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        // include account
        include: {
          account: true,
        },
      });
      if (!listing) {
        throw new NotFoundError(`Listing with id ${listingId} not found`);
      }
      return listing;
    } catch (err) {
      throw err;
    }
  }

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
