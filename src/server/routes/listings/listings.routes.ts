import { Router, Request, Response } from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from "ethers";
import { LitService } from "../../../services/LitService";
import prisma from "../../../db/prisma";
import { LitActionResponse } from "../../../types";
import { ListingService } from "../../../services/listings/ListingService";
import { OrdXyzInscriptionAPI } from "../../../api/inscription/OrdXyzInscriptionAPI";
import { BlockchainInfoUtxoApi } from "../../../api/bitcoin/utxo/BlockchainInfoApi";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { ListingController } from "../../controllers/ListingController";
import { LitError } from "../../../types/errors";

const router = Router();
const listingService = new ListingService(
  new OrdXyzInscriptionAPI(),
  new BlockchainInfoUtxoApi()
);

router.get("/seller/:accountId", async (req, res, next) => {
  const listingController = new ListingController();
  try {
    const accountId = req.params.accountId;
    const listings = await listingController.getListingsBySeller(accountId);
    return res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
});

router.get("/seller/withdraw", async (req, res, next) => {
  const { listingId } = req.query;
  const listingController = new ListingController();
  const litService = new LitService();
  const btcTxManager = new BtcTransactionService();
  try {
    const listing = await listingController.getListingById(listingId as string);
    const litActionCode = await litService.loadActionCode("PkpBtcSwapEth", {
      ethPrice: listing.ethPrice,
      ethPayoutAddress: listing.account.ethAddress,
      inscriptionId: listing.inscriptionId,
    });
    const { response, signatures } = (await litService.runLitAction({
      pkpPublicKey: listing.pkpPublicKey,
      code: litActionCode,
      authSig: litService.generateAuthSig(),
      pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
      pkpBtcAddress: listing.pkpBtcAddress,
    })) as LitActionResponse;
    if (response?.error) {
      throw new LitError(response.error);
    }
    if (response?.btcTransactionHex) {
      const signedTransactionHex = btcTxManager.buildLitBtcTransaction(
        response.btcTransactionHex,
        signatures.hashForInput0,
        signatures.hashForInput1,
        listing.pkpPublicKey
      );
      const txId = await btcTxManager.broadcastTransaction(
        signedTransactionHex
      );
      return res.status(200).json({ txId });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { ethAddress, ethPrice, inscriptionId, inscriptionNumber } = req.body;
    let account = await prisma.account.findUnique({ where: { ethAddress } });
    if (!account) {
      account = await prisma.account.create({
        data: {
          ethAddress,
        },
      });
    }

    const litService = new LitService();
    const pkp = await litService.mintPkp();
    const pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);

    const listing = await prisma.listing.create({
      data: {
        ethPrice,
        inscriptionId,
        inscriptionNumber,
        listingAccountId: account.id,
        pkpPublicKey: pkp.publicKey,
        pkpBtcAddress,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/confirm", async (req: Request, res: Response) => {
  const { listingId } = req.body;
  try {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id: listingId,
      },
    });
    const { listingIsConfirmed } = await listingService.confirmListing(listing);
    await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        confirmedDate: new Date(),
      },
    });
    res.status(200).json({ listingIsConfirmed });
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { address, id } = req.query;

    let listings: any[];

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

router.put("/buy", async (req: Request, res: Response, next) => {
  const { listingId, accountId } = req.body;
  const listingController = new ListingController();
  try {
    const listing = await listingController.buyListing(listingId, accountId);
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
});

router.get("/buyer/:accountId", async (req: Request, res: Response, next) => {
  const listingController = new ListingController();
  try {
    const { accountId } = req.params;
    const listings = await listingController.getListingsByBuyer(accountId);
    return res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
});

export default router;
