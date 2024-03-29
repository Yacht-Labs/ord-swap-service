import { Router, Request, Response } from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from "ethers";
import { LitService } from "../../../services/lit/LitService";
import prisma from "../../../db/prisma";
import { ListingService } from "../../../services/listings/ListingService";
import { OrdXyzInscriptionAPI } from "../../../api/inscription/OrdXyzInscriptionAPI";
import { BlockchainInfoUtxoApi } from "../../../api/bitcoin/utxo/BlockchainInfoAPI";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { ListingController } from "../../controllers/listings/ListingController";
import { LitError } from "../../../types/errors";
import { LIT_SWAP_FILE_NAME } from "../../../constants";
import { AccountController } from "../../controllers/accounts/AccountController";
import { SwapDataController } from "../../controllers/swapdata/SwapdataController";
import { SwapDataControllerDependencyFactory } from "../../../factories/SwapDataControllerDependencyFactory";
import { BITCOIN_NETWORKS } from "../../../utils";

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
  try {
    const listing = await listingController.getListingById(listingId as string);
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: listing.ethPrice,
      ethPayoutAddress: listing.account.ethAddress,
      inscriptionId: listing.inscriptionId,
    });
    res.status(200).send({ txId: "0x123" });
    // const { response, signatures } = await litService.runLitAction({
    //   pkpPublicKey: listing.pkpPublicKey,
    //   code: litActionCode,
    //   authSig: litService.generateAuthSig(),
    //   pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
    //   pkpBtcAddress: listing.pkpBtcAddress,
    // });
    // if (response?.error) {
    //   throw new LitError(response.error);
    // }
  } catch (err) {
    next(err);
  }
});

router.post("/buyer/withdraw", async (req, res, next) => {
  const { listingId } = req.query;
  const { authSig, taprootAddress } = req.body;
  const listingController = new ListingController();
  const litService = new LitService();
  const btcTxManager = new BtcTransactionService();
  const factory = new SwapDataControllerDependencyFactory();
  const { inscriptionService, ethAPI, ethService, btcTxService } =
    factory.getDependenciesForEnv(BITCOIN_NETWORKS.REGTEST);
  const swapdataController = new SwapDataController(
    inscriptionService,
    ethAPI,
    ethService,
    btcTxService
  );
  try {
    const listing = await listingController.getListingById(listingId as string);
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: listing.ethPrice,
      ethPayoutAddress: listing.account.ethAddress,
      inscriptionId: listing.inscriptionId,
    });
    const swapData = await swapdataController.getSwapData(
      listing.pkpBtcAddress,
      listing.inscriptionId,
      ethers.utils.computeAddress(listing.pkpPublicKey),
      listing.ethPrice,
      taprootAddress
    );
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: listing.pkpPublicKey,
      code: litActionCode,
      authSig: authSig,
      pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
      pkpBtcAddress: listing.pkpBtcAddress,
      btcPayoutAddress: taprootAddress,
      isUnitTest: false,
      ordinalUtxo: swapData.ordinalUtxo,
      cardinalUtxo: swapData.cardinalUtxo,
      hashForInput0: swapData.hashForInput0,
      hashForInput1: swapData.hashForInput1,
      transaction: swapData.transaction,
      winningTransfer: swapData.winningTransfer,
      losingTransfers: swapData.losingTransfers,
      maxPriorityFeePerGas: swapData.maxPriorityFeePerGas,
      maxFeePerGas: swapData.maxFeePerGas,
    });
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

router.put("/confirm", async (req: Request, res: Response, next) => {
  const { listingId } = req.body;
  const listingController = new ListingController();
  try {
    const listing = await listingController.confirmListing(listingId);
    res.status(200).json({ listing });
  } catch (err) {
    next(err);
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

router.post("/", async (req: Request, res: Response, next) => {
  const accountController = new AccountController();
  const litService = new LitService();
  try {
    const { ethAddress, ethPrice, inscriptionId, inscriptionNumber } = req.body;

    const account = await accountController.getOrCreateAccount(ethAddress);

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
    next(error);
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

export default router;
