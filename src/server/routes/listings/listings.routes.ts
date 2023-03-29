import { Router, Request, Response } from "express";
import prisma from "../../../db/prisma";

const router = Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const { ethAddress, ethPrice, inscriptionId } = req.body;
    let account = await prisma.account.findUnique({ where: { ethAddress } });
    if (!account) {
      account = await prisma.account.create({
        data: {
          ethAddress,
        },
      });
    }

    // TODO: get the inscription number, pkpPublicKey, and taprootAddress from the inscriptionId

    const listing = await prisma.listing.create({
      data: {
        ethPrice,
        inscriptionId,
        inscriptionNumber: "placeholder", // You can replace this with the actual logic to generate the inscription number
        listingAccountId: account.id,
        pkpPublicKey: "placeholder", // You can replace this with the actual logic to generate the PKP public key
        taprootAddress: "placeholder", // You can replace this with the actual logic to generate the taproot address
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { address, id } = req.query;

    let listings;

    if (address) {
      listings = await prisma.listing.findMany({
        where: {
          account: {
            ethAddress: address as string,
          },
        },
      });
    } else if (id) {
      listings = await prisma.listing.findMany({
        where: {
          id: id as string,
        },
      });
    } else {
      listings = await prisma.listing.findMany({
        where: {
          cancelledDate: null,
          sellDate: null,
        },
      });
    }
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/:listingId", async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const { signature } = req.body;

  try {
    let updatedListing;

    if (signature) {
      // If signature is provided, mark the listing as cancelled
      // TODO: CHECK SIGNATURE
      updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          cancelledDate: new Date(),
        },
      });
    } else {
      // If signature is not provided, mark the listing as sold
      updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          sellDate: new Date(),
        },
      });
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
