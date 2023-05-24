import { InscriptionService } from "../../services/inscription/InscriptionService";
// if (process.env.NODE_ENV === "dev") {
//   require("../../../development");
// }
import { BlockchainInfoUtxoApi } from "../../api/bitcoin/utxo/BlockchainInfoAPI";
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
import { MempoolSpaceAPI } from "../../api/bitcoin/utxo/MempoolSpaceAPI";
import { AlchemyEthTransactionAPI } from "../../api/ethereum/AlchemyEthTransactionAPI";
import { EthereumService } from "../../services/ethereum/EthereumService";
import { InscriptionSwapFixture } from "./test/fixtures";

const { pkpEthAddress, pkpBtcAddress, btcPayoutAddress, ethPrice } =
  InscriptionSwapFixture;
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "{{ethPayoutAddress}}";

export async function go() {
  let response: Record<any, any> = {};
  try {
    const utxoAPI = new MempoolSpaceAPI();
    const inscriptionAPI = new OrdXyzInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const ethAPI = new AlchemyEthTransactionAPI();
    const ethService = new EthereumService(ethAPI);
    const inscriptionService = new InscriptionService(listingService);
    const btcTransactionService = new BtcTransactionService();

    // Inscription Manager
    // params: pkpBtcAddress, inscriptionId
    // returns: ordinalUtxo, cardinalUtxo

    // EthApi
    // params: none
    // returns: maxPriorityFeePerGas, maxFeePerGas

    // const { ordinalUtxo, cardinalUtxo } =
    //   await inscriptionService.checkInscriptionStatus(
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

    // TODO: Implement loser refund

    // Buyer Withdraw
    // if (Lit.Auth.authSigAddress === winningTransfer.from && btcPayoutAddress) {
    //   const { hashForInput0, hashForInput1, transaction } =
    //     btcTransactionService.prepareInscriptionTransaction({
    //       ordinalUtxo,
    //       cardinalUtxo,
    //       receivingAddress: btcPayoutAddress,
    //     });
    //   await Lit.Actions.signEcdsa({
    //     toSign: hashForInput0,
    //     publicKey: pkpPublicKey,
    //     sigName: "hashForInput0",
    //   });
    //   await Lit.Actions.signEcdsa({
    //     toSign: hashForInput1,
    //     publicKey: pkpPublicKey,
    //     sigName: "hashForInput1",
    //   });
    //   response = {
    //     ...response,
    //     btcTransaction: transaction.toHex(),
    //   };
    // }
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

go();
