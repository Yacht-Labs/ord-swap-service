if (process.env.NODE_ENV === "test") {
  require("../../../development");
}
import {
  mapTransferToTransaction,
  hashTransaction,
} from "./test/ordinalSwapAction";
import { EthTransfer } from "src/types";
import { InscriptionSwapFixture } from "../../lit/action/test/fixtures";

// HARD CODED on Lit Action Creation
const ethPrice =
  process.env.NODE_ENV === "test"
    ? InscriptionSwapFixture.ethPrice
    : "{{ethPrice}}";
const inscriptionId =
  process.env.NODE_ENV === "test"
    ? InscriptionSwapFixture.inscriptionId
    : "{{inscriptionId}}";
const ethPayoutAddress =
  process.env.NODE_ENV === "test"
    ? InscriptionSwapFixture.ethPayoutAddress
    : "{{ethPayoutAddress}}";
const chainId =
  process.env.NODE_ENV === "test"
    ? InscriptionSwapFixture.chainId
    : "{{chainId}}";

// Passed in on execution
// pkpBtcAddress
// pkpEthAddress
// pkpPublicKey
// btcDestinationAddress
// isCancel

const API_ENDPOINT =
  "https://790b-2600-1700-280-2910-412f-782c-af0a-4e97.ngrok-free.app/swapdata";

export async function go() {
  let response: Record<any, any> = {};
  try {
    let ordinalUtxo;
    let cardinalUtxo;
    let winningTransfer;
    let losingTransfers;
    let maxPriorityFeePerGas: string;
    let maxFeePerGas: string;
    let hashForInput0: string;
    let hashForInput1: string;
    let transaction: string;
    const url = `${API_ENDPOINT}?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}&btcDestinationAddress=${btcDestinationAddress}`;
    const apiResponse = await fetch(url);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      ordinalUtxo = data.results.ordinalUtxo;
      cardinalUtxo = data.results.cardinalUtxo;
      winningTransfer = data.results.winningTransfer;
      losingTransfers = data.results.losingTransfers;
      maxPriorityFeePerGas = data.results.maxPriorityFeePerGas;
      maxFeePerGas = data.results.maxFeePerGas;
      hashForInput0 = data.results.hashForInput0;
      hashForInput1 = data.results.hashForInput1;
      transaction = data.results.transaction;
    } else {
      throw new Error(
        `Swap data API call returned not ok: ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
    // Seller Withdraw
    if (winningTransfer) {
      const unsignedTransaction = mapTransferToTransaction(
        winningTransfer,
        ethPayoutAddress,
        0,
        maxPriorityFeePerGas,
        maxFeePerGas,
        parseInt(chainId)
      );
      await Lit.Actions.signEcdsa({
        toSign: hashTransaction(unsignedTransaction),
        publicKey: pkpPublicKey,
        sigName: "ethWinnerSignature",
      });
      response = {
        ...response,
        unsignedEthTransaction: unsignedTransaction,
      };
    }
    // Cancel listing
    if (Lit.Auth.authSigAddress === ethPayoutAddress && isCancel) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: Buffer.from(hashForInput0, "hex"),
        publicKey: pkpPublicKey,
        sigName: "cancelHashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: Buffer.from(hashForInput1, "hex"),
        publicKey: pkpPublicKey,
        sigName: "cancelHashForInput1",
      });
      response = {
        ...response,
        btcTransaction: transaction,
      };
    }
    // Loser Refund
    if (losingTransfers.length > 0) {
      //iterate through losing transfers
      losingTransfers.forEach(async (transfer: EthTransfer) => {
        if (Lit.Auth.authSigAddress === transfer.from) {
          const unsignedTransaction = mapTransferToTransaction(
            transfer,
            transfer.from,
            0,
            maxPriorityFeePerGas,
            maxFeePerGas,
            80001
          );
          await Lit.Actions.signEcdsa({
            toSign: hashTransaction(unsignedTransaction),
            publicKey: pkpPublicKey,
            sigName: "ethLoserSignature",
          });
          response = {
            ...response,
            unsignedEthTransaction: unsignedTransaction,
          };
        }
      });
    }
    // Buyer Withdraw
    if (Lit.Auth.authSigAddress === winningTransfer.from && btcPayoutAddress) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: Buffer.from(hashForInput0, "hex"),
        publicKey: pkpPublicKey,
        sigName: "hashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: Buffer.from(hashForInput1, "hex"),
        publicKey: pkpPublicKey,
        sigName: "hashForInput1",
      });
      response = {
        ...response,
        btcTransaction: transaction,
      };
    }
    Lit.Actions.setResponse({
      response: JSON.stringify({ response: response }),
    });
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

if (process.env.NODE_ENV !== "test") {
  go();
}
