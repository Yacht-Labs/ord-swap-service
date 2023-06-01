import {
  mapTransferToTransaction,
  hashTransaction,
} from "./test/ordinalSwapAction";
import { EthTransfer } from "src/types";

const ethPrice = "{{ethPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "{{ethPayoutAddress}}";
const chainId = "{{chainId}}";

// Passed in on execution
// pkpBtcAddress
// pkpEthAddress
// pkpPublicKey
// btcPayoutAddress
// isCancel

const API_ENDPOINT =
  "https://9c50-2600-1700-280-2910-6040-8448-9815-5a85.ngrok-free.app/swapdata";

export async function go() {
  let response: Record<any, any> = {};
  try {
    let ordinalUtxo;
    let cardinalUtxo;
    let winningTransfer;
    let losingTransfers;
    let maxPriorityFeePerGas: string;
    let maxFeePerGas: string;
    let hashForInput0: Buffer;
    let hashForInput1: Buffer;
    let transaction: string;
    const url = `${API_ENDPOINT}?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}&btcPayoutAddress=${btcPayoutAddress}`;
    const apiResponse = await fetch(url);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      ordinalUtxo = data.ordinalUtxo;
      cardinalUtxo = data.cardinalUtxo;
      winningTransfer = data.winningTransfer;
      losingTransfers = data.losingTransfers;
      maxPriorityFeePerGas = data.maxPriorityFeePerGas;
      maxFeePerGas = data.maxFeePerGas;
      hashForInput0 = data.hashForInput0;
      hashForInput1 = data.hashForInput1;
      transaction = data.transaction;
    } else {
      throw new Error(
        `Swap data API call returned not ok: ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
    // Seller Withdraw
    if (
      winningTransfer &&
      !isCancel &&
      Lit.Auth.authSigAddress.toLowerCase() === ethPayoutAddress.toLowerCase()
    ) {
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
        publicKey,
        sigName: "ethWinnerSignature",
      });
      response = {
        ...response,
        unsignedEthTransaction: unsignedTransaction,
      };
    }
    // Cancel listing
    if (
      Lit.Auth.authSigAddress.toLowerCase() ===
        ethPayoutAddress.toLowerCase() &&
      isCancel
    ) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: new Uint8Array(hashForInput0),
        publicKey,
        sigName: "cancelHashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: new Uint8Array(hashForInput1),
        publicKey,
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
        if (
          Lit.Auth.authSigAddress.toLowerCase() === transfer.from.toLowerCase()
        ) {
          const unsignedTransaction = mapTransferToTransaction(
            transfer,
            transfer.from,
            0,
            maxPriorityFeePerGas,
            maxFeePerGas,
            parseInt(chainId)
          );
          await Lit.Actions.signEcdsa({
            toSign: hashTransaction(unsignedTransaction),
            publicKey,
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
    if (
      Lit.Auth.authSigAddress.toLowerCase() ===
        winningTransfer.from.toLowerCase() &&
      btcPayoutAddress
    ) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: new Uint8Array(hashForInput0),
        publicKey,
        sigName: "hashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: new Uint8Array(hashForInput1),
        publicKey,
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
go();
