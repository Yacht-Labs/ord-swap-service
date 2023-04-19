import { Listing, ListingStatus } from "@prisma/client";
import prisma from "../../db/prisma";
import { BusinessLogicError, NotFoundError } from "../../types/errors";
import { ListingWithAccount } from "../../types/models";
import { ListingService } from "../../services/listings/ListingService";
import { OrdXyzInscriptionAPI } from "../../api/inscription/OrdXyzInscriptionAPI";
import { BlockchainInfoUtxoApi } from "../../api/bitcoin/utxo/BlockchainInfoApi";

export class ListingController {
  listingService: ListingService;
  constructor() {
    const inscriptionApi = new OrdXyzInscriptionAPI();
    const utxoApi = new BlockchainInfoUtxoApi();
    this.listingService = new ListingService(inscriptionApi, utxoApi);
  }
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

  async confirmListing(listingId: string): Promise<Listing> {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });
    if (!listing) {
      throw new NotFoundError(`Listing with id ${listingId} not found`);
    }
    if (listing.status === "Cancelled" || listing.status === "Sold") {
      throw new BusinessLogicError(
        `Listing with id ${listingId} already has status ${listing.status}}`
      );
    }
    if (listing.status === "Ready") {
      return listing;
    }
    const listingStatus = await this.listingService.confirmListing(listing);
    let updatedListing;
    if (listing.status !== listingStatus) {
      updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: "Ready" },
      });
    }
    return updatedListing || listing;
  }
}
