import { Router, Request, Response } from "express";
import { serialize, Transaction } from "@ethersproject/transactions";
import { ethers } from "ethers";
import * as ethSigUtil from "@metamask/eth-sig-util";
import { LitService } from "../../services/LitService";
import TaprootWallet from "../../../btc/TaprootWallet";
import prisma from "../../../db/prisma";

const router = Router();
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

    // TODO: get the inscription number, pkpPublicKey, and taprootAddress from the inscriptionId

    const litService = new LitService({ btcTestNet: false });

    const pkp = await litService.mintPkp();
    // const btcAddress = litService.generateBtcAddress(pkp.publicKey);

    const code = await LitService.loadJsFile(
      "src/lit/action/ordinalSwapAction.js"
    );

    const authSig = await litService.generateAuthSig();
    const result = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code,
      authSig,
      ethPrice: 88,
      pkpEthAddress: "0xc653a200b2a5D3c0cD93a1BB3A47c61C54bFff36",
      pkpBtcAddress: "placeholder",
      btcAddress: "placeholder",
      ethPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
    });

    const tapRootSeed = result.signatures.taprootSig.signature;
    const taprootWallet = new TaprootWallet();
    const taprootChild = await taprootWallet.getTaprootKeyPairFromSignature(
      tapRootSeed
    );
    const taprootAddress =
      await TaprootWallet.getTaprootAddressFromTaprootChild(taprootChild);
    if (!taprootAddress) {
      throw new Error("Could not get taproot address");
    }
    const listing = await prisma.listing.create({
      data: {
        ethPrice,
        inscriptionId,
        inscriptionNumber,
        listingAccountId: account.id,
        pkpPublicKey: pkp.publicKey,
        taprootAddress,
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

router.put("/", async (req: Request, res: Response) => {
  // const { listingId } = req.params;
  const { signature, pkpPublicKey, encryptionPubKey, isBuy, listingId } =
    req.body;
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
    } else if (isBuy) {
      const code = await LitService.loadJsFile(
        "src/lit/action/ordinalSwapAction.js"
      );
      const litService = new LitService({ btcTestNet: false });
      const authSig = await litService.generateAuthSig();
      const result = await litService.runLitAction({
        pkpPublicKey,
        code,
        authSig,
        ethPrice: 88,
        pkpEthAddress: "0xc653a200b2a5D3c0cD93a1BB3A47c61C54bFff36",
        pkpBtcAddress: "placeholder",
        btcAddress: "placeholder",
        ethPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
      });
      const signedTx = serialize(
        result.response,
        result.signatures.ethPayoutSignature.signature
      );
      const provider = new ethers.providers.JsonRpcProvider(
        "https://polygon-mumbai.g.alchemy.com/v2/i4MQfC5uRVeQQZBK6IVZQQjsOdhx668n"
      );
      const taprootWallet = new TaprootWallet();
      const tapRootSeed = result.signatures.taprootSig.signature;
      const taprootChild = await taprootWallet.getTaprootKeyPairFromSignature(
        tapRootSeed
      );
      const { privateKey } = taprootChild;
      if (privateKey === undefined)
        throw new Error("Taproot address is undefined");
      const hexPrivateKey = privateKey.toString("hex");
      const encryptedPrivateKey = TaprootWallet.encryptMessageWithPubkey(
        hexPrivateKey,
        encryptionPubKey
      );
      updatedListing = encryptedPrivateKey;
      // const tx = await provider.sendTransaction(signedTx);
      // const receipt = await tx.wait(1);
      // console.log("result.response", result.response);
      // console.log(
      //   "result.signatures.ethPayoutSignature.signature",
      //   result.signatures.ethPayoutSignature.signature
      // );
      // console.log("signedTx", signedTx);
      // console.log("result", result);
      // console.log("receipt", receipt);
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
