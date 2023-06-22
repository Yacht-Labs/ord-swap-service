// Passed in on execution
// pkpBtcAddress
// pkpEthAddress
// pkpPublicKey
// btcPayoutAddress
// isCancel
// accountAddress
if (isUnitTest) {
  require("../../../development");
}
import {
  mapTransferToTransaction,
  hashTransaction,
} from "./test/ordinalSwapAction";
import { InscriptionSwapFixture } from "./test/fixtures";
import { EthTransfer } from "src/types";

const ethPrice = isUnitTest ? InscriptionSwapFixture.ethPrice : "{{ethPrice}}";
const inscriptionId = isUnitTest
  ? InscriptionSwapFixture.inscriptionId
  : "{{inscriptionId}}";
const ethPayoutAddress = isUnitTest
  ? InscriptionSwapFixture.ethPayoutAddress
  : "{{ethPayoutAddress}}";
const chainId = isUnitTest ? InscriptionSwapFixture.chainId : "{{chainId}}";

function toUint8Array(hexString: string) {
  if (hexString.length % 2 !== 0) {
    throw new Error(
      "Invalid hexadecimal string. Length must be an even number."
    );
  }
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
}

export async function go() {
  let response: Record<any, any> = {};
  try {
    // let ordinalUtxo;
    // let cardinalUtxo;
    // let winningTransfer;
    // let losingTransfers;
    // let maxPriorityFeePerGas: string;
    // let maxFeePerGas: string;
    // let hashForInput0: string;
    // let hashForInput1: string;
    // let transaction: string;
    // const url = `${API_ENDPOINT}?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}&btcPayoutAddress=${btcPayoutAddress}`;
    // const apiResponse = await fetch(url);
    // if (apiResponse.ok) {
    //   const data = await apiResponse.json();
    //   ordinalUtxo = data.ordinalUtxo;
    //   cardinalUtxo = data.cardinalUtxo;
    //   winningTransfer = data.winningTransfer;
    //   losingTransfers = data.losingTransfers;
    //   maxPriorityFeePerGas = data.maxPriorityFeePerGas;
    //   maxFeePerGas = data.maxFeePerGas;
    //   hashForInput0 = data.hashForInput0;
    //   hashForInput1 = data.hashForInput1;
    //   transaction = data.transaction;
    // } else {
    //   throw new Error(
    //     `Swap data API call returned not ok: ${apiResponse.status}: ${apiResponse.statusText}`
    //   );
    // }

    // console.log("hashinput0: ", toUint8Array(hashForInput0));
    // console.log("hashinput1: ", toUint8Array(hashForInput1));

    // Seller Withdraw
    if (
      winningTransfer &&
      !isCancel &&
      accountAddress.toLowerCase() === ethPayoutAddress.toLowerCase()
    ) {
      const unsignedTransaction = mapTransferToTransaction(
        winningTransfer,
        ethPayoutAddress,
        0,
        maxPriorityFeePerGas,
        maxFeePerGas,
        parseInt(chainId),
        pkpEthAddress
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
      accountAddress.toLowerCase() === ethPayoutAddress.toLowerCase() &&
      isCancel &&
      !winningTransfer
    ) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: toUint8Array(hashForInput0),
        publicKey,
        sigName: "cancelHashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: toUint8Array(hashForInput1),
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
      for (const transfer of losingTransfers) {
        if (accountAddress.toLowerCase() === transfer.from.toLowerCase()) {
          const unsignedTransaction = mapTransferToTransaction(
            transfer,
            transfer.from,
            0,
            maxPriorityFeePerGas,
            maxFeePerGas,
            parseInt(chainId),
            pkpEthAddress
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
      }
    }

    // Buyer Withdraw
    if (
      accountAddress.toLowerCase() === winningTransfer?.from.toLowerCase() &&
      btcPayoutAddress
    ) {
      if (!ordinalUtxo) {
        throw new Error("The ordinal has not been sent to the PKP address");
      }
      if (!cardinalUtxo) {
        throw new Error("The cardinal has not been sent to the PKP address");
      }
      await Lit.Actions.signEcdsa({
        toSign: toUint8Array(hashForInput0),
        publicKey,
        sigName: "hashForInput0",
      });
      await Lit.Actions.signEcdsa({
        toSign: toUint8Array(hashForInput1),
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

if (!isUnitTest) {
  go();
}
