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
  // let pkp: any;
  const pkp = {
    tokenId:
      "9584624190520229793684518815665461083423772642060812468802145859465862214156",
    publicKey:
      "0x04bfa10c90fc1592686e0e0b85bcf991f9462c86b60c8546885d3070f60a8e62fbbe1fd712e69d216492d8aec298de3c25c33cdc49a55cdf4cb68ae7b90d01e204",
    address: "0x14698cbc9dD499Ab659106Ff23B5106f9bA09D85",
  };

  // beforeAll(async () => {
  //   try {
  //     pkp = await litService.mintPkp();
  //     console.log({ pkp });
  //   } catch (err) {
  //     console.log("error minting pkp", err);
  //   }
  // }, 15000);

  it("should get no signatures when running the lit action on empty kp", async () => {
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: ethPrice,
      ethPayoutAddress: sellerEthWallet.address,
      inscriptionId: "123",
    });
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      // code: litActionCode,
      ipfsCID: "QmTx3g3AN89mcMJ5JD1bGRbLR9Zmrzo3BV1FSn8aarkZsw",
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
