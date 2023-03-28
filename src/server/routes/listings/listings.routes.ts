import { Router, Request, Response } from "express";
import prisma from "../../../db/prisma";

const router = Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const { ethAddress, ethPrice, inscriptionId } = req.body;
    const account = await prisma.account.findUnique({ where: { ethAddress } });
    console.log(account);
    if (!account) {
      return res.status(400).json({ error: "Account not found" });
    }

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

router.get("/getListing/:listingId", async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    const listings = await prisma.listing.findMany({
      where: address
        ? { account: { ethAddress: address as string }, cancelledDate: null }
        : undefined,
      include: {
        account: true,
      },
    });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post(
  "/cancelListing/:listingId",
  async (req: Request, res: Response) => {
    try {
      const { listingId } = req.params;
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          cancelledDate: new Date(),
        },
      });

      res.status(200).json(updatedListing);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
