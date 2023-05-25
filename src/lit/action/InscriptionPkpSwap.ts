import { InscriptionService } from "../../services/inscription/InscriptionService";
// if (process.env.NODE_ENV === "dev") {
//   require("../../../development");
// }
import { BtcTransactionService } from "../../services/bitcoin/BtcTransactionService";
import {
  mapTransferToTransaction,
  hashTransaction,
} from "./test/ordinalSwapAction";
import { EthTransfer } from "src/types";

const pkpEthAddress = "0x5342b85821849ef2F8b0fB4e7eFf27952F28b3f2";
const btcPayoutAddress =
  "bc1pal6d4gfjt5aa58yv29kzu2a9xwp69rl797uhk8lwk6t2h8wd0s9skhaer8";
const pkpBtcAddress = "184rYD2CTpTv8AabFmwAoXFuPn7dPDrbMi";

const ethPrice = "0.01";
// const ethPrice = "{{ethPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "0x9D55D24aA6186d4a61Fa3BefeDBE4dD5dc0DC171";
// const ethPayoutAddress = "{{ethPayoutAddress}}";
const isCancel = "{{isCancel}}";
const btcCancelAddress = "{{btcCancelAddress}}";
const API_ENDPOINT = "https://api.localhost:3001/swapdata";

export async function go() {
  let response: Record<any, any> = {};
  try {
    const btcTransactionService = new BtcTransactionService();

    let ordinalUtxo;
    let cardinalUtxo;
    let winningTransfer;
    let losingTransfers;
    let maxPriorityFeePerGas: string;
    let maxFeePerGas: string;
    try {
      const url = `${API_ENDPOINT}?pkpBtcAddress=${pkpBtcAddress}?inscriptionId=${inscriptionId}?pkpEthAddress=${pkpEthAddress}?ethPrice=${ethPrice}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        ordinalUtxo = data.results.ordinalUtxo;
        cardinalUtxo = data.results.cardinalUtxo;
        winningTransfer = data.results.winningTransfer;
        losingTransfers = data.results.losingTransfers;
        maxPriorityFeePerGas = data.results.maxPriorityFeePerGas;
        maxFeePerGas = data.results.maxFeePerGas;
      } else {
        throw new Error("Swap data API call returned not ok");
      }
    } catch (error) {
      throw new Error("Swap data API call failed");
    }

    if (!ordinalUtxo) {
      throw new Error("The ordinal has not been sent to the PKP address");
    }
    if (!cardinalUtxo) {
      throw new Error("The cardinal has not been sent to the PKP address");
    }

    // Seller Withdraw
    if (winningTransfer) {
      const unsignedTransaction = mapTransferToTransaction(
        winningTransfer,
        ethPayoutAddress,
        0,
        maxPriorityFeePerGas,
        maxFeePerGas,
        80001
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
      const { hashForInput0, hashForInput1, transaction } =
        btcTransactionService.prepareInscriptionTransaction({
          ordinalUtxo,
          cardinalUtxo,
          destinationAddress: btcCancelAddress,
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
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

go();
