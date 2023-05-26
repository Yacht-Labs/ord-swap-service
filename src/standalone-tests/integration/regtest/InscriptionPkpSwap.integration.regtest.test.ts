process.env.NODE_ENV = "not-test";
import { LitService } from "../../../services/lit/LitService";
import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliRpcUrlEnv,
} from "../../../utils/env";
import { LIT_SWAP_FILE_NAME } from "../../../constants";
import { ethers } from "ethers";

const ethPrice = "0.000001";

const sellerEthWallet = new ethers.Wallet(
  readGoerliPrivateKey(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

describe("InscriptionPkpSwap Integration", () => {
  const litService = new LitService();
  let pkp: any;

  beforeAll(async () => {
    try {
      pkp = await litService.mintPkp();
    } catch (err) {
      console.log("error minting pkp", err);
    }
  }, 15000);

  it("should get no signatures when running the lit action on empty pkp", async () => {
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: ethPrice,
      ethPayoutAddress: sellerEthWallet.address,
      inscriptionId: "123",
    });
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(),
      pkpEthAddress: ethers.utils.computeAddress(pkp.publicKey),
      pkpBtcAddress: litService.generateBtcAddress(pkp.publicKey),
      btcPayoutAddress: "",
    });
    console.log("response", response);
    console.log("signatures", signatures);
    expect(response).toEqual({});
    expect(signatures).toEqual([]);
  });
});

// mint a pkp

// run the lit action
// expect to get no signatures

// create an inscription
// send the inscription to the pkp address
// send eth to the pkp address

// run the lit action as the seller
// expect to get a signature to transfer eth to the seller

// run the lit action as the buyer
// expect to get a signature to transfer ordinal to buyer

// import { LitService } from "../../../services/lit/LitService";
// import { LIT_SWAP_FILE_NAME } from "../../../constants";

// describe("InscriptionPkpSwap", () => {
//   const litService = new LitService();
//   let pkp: any;

//   beforeAll(async () => {
//     pkp = await litService.mintPkp();
//   }, 60000);

//   it("should not get any signatures if nothing exists on pkp", async () => {
//     const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
//       ethPrice: listing.ethPrice,
//       ethPayoutAddress: listing.account.ethAddress,
//       inscriptionId: listing.inscriptionId,
//     });
//     const { response, signatures } = await litService.runLitAction({
//       pkpPublicKey: listing.pkpPublicKey,
//       code: litActionCode,
//       authSig: authSig,
//       pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
//       pkpBtcAddress: listing.pkpBtcAddress,
//       btcPayoutAddress: taprootAddress,
//     });
//   });
// });
