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

import { LitService } from "../../../services/lit/LitService";
import { LIT_SWAP_FILE_NAME } from "../../../constants";

describe("InscriptionPkpSwap", () => {
  const litService = new LitService();
  let pkp: any;

  beforeAll(async () => {
    pkp = await litService.mintPkp();
  }, 60000);

  it("should not get any signatures if nothing exists on pkp", async () => {
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: listing.ethPrice,
      ethPayoutAddress: listing.account.ethAddress,
      inscriptionId: listing.inscriptionId,
    });
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: listing.pkpPublicKey,
      code: litActionCode,
      authSig: authSig,
      pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
      pkpBtcAddress: listing.pkpBtcAddress,
      btcPayoutAddress: taprootAddress,
    });
  });
});
