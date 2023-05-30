import { InscriptionService } from "../../services/inscription/InscriptionService";
// if (process.env.NODE_ENV === "test") {
//   require("../../../development");
// }
import { BtcTransactionService } from "../../services/bitcoin/BtcTransactionService";
import {
  mapTransferToTransaction,
  hashTransaction,
} from "./test/ordinalSwapAction";
import { EthTransfer } from "src/types";
import {
  HardCodedInscriptionSwapFixture,
  PassedInInscriptionSwapFixture,
} from "../../lit/action/test/fixtures";
// import { ethers } from "ethers";

// HARD CODED on Lit Action Creation

// console.log("Process env: ", process.env);
// console.log("NODE_ENV: ", process.env.NODE_ENV);
// process.env.NODE_ENV = "test";
const ethPrice =
  process.env.PKP_ENV === "test"
    ? HardCodedInscriptionSwapFixture.ethPrice
    : "{{ethPrice}}";
const inscriptionId =
  process.env.PKP_ENV === "test"
    ? HardCodedInscriptionSwapFixture.inscriptionId
    : "{{inscriptionId}}";
const ethPayoutAddress =
  process.env.PKP_ENV === "test"
    ? HardCodedInscriptionSwapFixture.ethPayoutAddress
    : "{{ethPayoutAddress}}";
const chainId =
  process.env.PKP_ENV === "test"
    ? HardCodedInscriptionSwapFixture.chainId
    : "{{chainId}}";

const {
  pkpBtcAddress,
  pkpEthAddress,
  pkpPublicKey,
  btcPayoutAddress,
  isCancel,
  btcCancelAddress,
} = PassedInInscriptionSwapFixture;

// Passed in on execution
// pkpBtcAddress
// pkpEthAddress
// pkpPublicKey
// btcPayoutAddress
// isCancel
// btcCancelAddress

const API_ENDPOINT =
  "https://05f0-2600-1700-280-2910-f9dc-97f2-1162-2b77.ngrok-free.app/swapdata";

export async function go() {
  console.log("HI");
  let response: Record<any, any> = {};
  try {
    const btcTransactionService = new BtcTransactionService();
    let ordinalUtxo;
    let cardinalUtxo;
    let winningTransfer;
    let losingTransfers;
    let maxPriorityFeePerGas: string;
    let maxFeePerGas: string;
    const url = `${API_ENDPOINT}?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}`;
    const apiResponse = await fetch(url);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      ordinalUtxo = data.results.ordinalUtxo;
      cardinalUtxo = data.results.cardinalUtxo;
      winningTransfer = data.results.winningTransfer;
      losingTransfers = data.results.losingTransfers;
      maxPriorityFeePerGas = data.results.maxPriorityFeePerGas;
      maxFeePerGas = data.results.maxFeePerGas;
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
      const { hashForInput0, hashForInput1, transaction } =
        btcTransactionService.prepareInscriptionTransaction({
          ordinalUtxo,
          cardinalUtxo,
          destinationAddress: btcCancelAddress,
        });
      await Lit.Actions.signEcdsa({
        toSign: hashForInput0,
        publicKey: pkpPublicKey,
        sigName: "cancelHashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: hashForInput1,
        publicKey: pkpPublicKey,
        sigName: "cancelHashForInput1",
      });
      response = {
        ...response,
        btcTransaction: transaction.toHex(),
      };
    }
    // Loser Refund
    if (losingTransfers.length > 0) {
      // iterate through losing transfers
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
      const { hashForInput0, hashForInput1, transaction } =
        btcTransactionService.prepareInscriptionTransaction({
          ordinalUtxo,
          cardinalUtxo,
          destinationAddress: btcPayoutAddress,
        });
      await Lit.Actions.signEcdsa({
        toSign: hashForInput0,
        publicKey: pkpPublicKey,
        sigName: "hashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: hashForInput1,
        publicKey: pkpPublicKey,
        sigName: "hashForInput1",
      });
      response = {
        ...response,
        btcTransaction: transaction.toHex(),
      };
    }
    Lit.Actions.setResponse({
      response: JSON.stringify({ response: response }),
    });
    console.log("PREENISSAN");
  } catch (err) {
    console.log({ err });
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

// if (process.env.PKP_ENV !== "test") {
go();
// }
