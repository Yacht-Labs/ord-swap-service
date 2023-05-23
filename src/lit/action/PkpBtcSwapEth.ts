import { InscriptionManager } from "../../services/inscription/InscriptionService";
// if (process.env.NODE_ENV === "dev") {
//   require("../../../development");
// }
import { BlockchainInfoUtxoApi } from "../../api/bitcoin/utxo/BlockchainInfoApi";
import { BtcTransactionService } from "../../services/bitcoin/BtcTransactionService";
import {
  findWinnersByTransaction,
  getInboundEthTransactions,
  mapTransferToTransaction,
  hashTransaction,
  getCurrentGasPricesMainnet,
} from "./test/ordinalSwapAction";
import { OrdXyzInscriptionAPI } from "../../api/inscription/OrdXyzInscriptionAPI";
import { ListingService } from "../../services/listings/ListingService";
import { MempoolSpaceAPI } from "../../api/bitcoin/MempoolSpaceAPI";
import { AlchemyEthTransactionAPI } from "../../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../../services/ethereum/EthereumService";

const pkpEthAddress = "0x5342b85821849ef2F8b0fB4e7eFf27952F28b3f2";
const btcPayoutAddress =
  "bc1pal6d4gfjt5aa58yv29kzu2a9xwp69rl797uhk8lwk6t2h8wd0s9skhaer8";
const pkpBtcAddress = "184rYD2CTpTv8AabFmwAoXFuPn7dPDrbMi";

const ethPrice = "0.01";
// const ethPrice = "{{ethPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "0x9D55D24aA6186d4a61Fa3BefeDBE4dD5dc0DC171";
// const ethPayoutAddress = "{{ethPayoutAddress}}";
const isCancel = {{isCancel}};
const btcCancelAddress = "{{btcCancelAddress}}";

export async function go() {
  let response: Record<any, any> = {};
  try {
    const utxoAPI = new MempoolSpaceAPI();
    const inscriptionAPI = new OrdXyzInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const ethAPI = new AlchemyEthTransactionAPI();
    const ethService = new EthereumService(ethAPI);
    const inscriptionManager = new InscriptionManager(listingService);
    const btcTransactionService = new BtcTransactionService();

    // Inscription Manager
    // params: pkpBtcAddress, inscriptionId
    // returns: ordinalUtxo, cardinalUtxo

    // EthApi
    // params: none
    // returns: maxPriorityFeePerGas, maxFeePerGas 


    // const { ordinalUtxo, cardinalUtxo } =
    //   await inscriptionManager.checkInscriptionStatus(
    //     pkpBtcAddress,
    //     inscriptionId
    //   );
    // if (!ordinalUtxo) {
    //   throw new Error("The ordinal has not been sent to the PKP address");
    // }
    // if (!cardinalUtxo) {
    //   throw new Error("The cardinal has not been sent to the PKP address");
    // }

    const { winningTransfer, losingTransfers } =
      await ethService.findWinnersByAddress(pkpEthAddress, ethPrice);
    if (!winningTransfer) {
      throw new Error("No winning transfer found");
    }

    // Seller Withdraw
    if (winningTransfer) {
      const { maxPriorityFeePerGas, maxFeePerGas } =
        await ethAPI.getCurrentGasPrices();
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
          receivingAddress: btcCancelAddress,
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
      losingTransfers.forEach((transfer) => {
        if (Lit.Auth.authSigAddress === transfer.from) {
          const { maxPriorityFeePerGas, maxFeePerGas } =
            await ethAPI.getCurrentGasPrices();
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
          receivingAddress: btcPayoutAddress,
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
