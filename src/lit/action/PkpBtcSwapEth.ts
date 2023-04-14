import { InscriptionManager } from "./../../services/InscriptionService";
// if (process.env.NODE_ENV === "dev") {
//   require("../../../development");
// }
import { BlockchainInfoUtxoApi } from "../../api/utxo/BlockchainInfoApi";
import { BtcTransactionManager } from "../bitcoin/BtcTransactionManager";
import {
  findWinnersByTransaction,
  getInboundEthTransactions,
  mapTransferToTransaction,
  hashTransaction,
  getCurrentGasPricesMainnet,
} from "./test/ordinalSwapAction";
import { OrdXyzInscriptionAPI } from "../../api/inscription/OrdXyzInscriptionAPI";
import { ListingService } from "../../services/ListingService";

// const ethPrice = "0.001";
// const pkpEthAddress = "0x5342b85821849ef2F8b0fB4e7eFf27952F28b3f2";
// const inscriptionId =
//   "9b2590f8a8d358e9f09d9a3d25aec3a964d063a44b61974c018562de064f66bei0";
// const ethPayoutAddress = "0x90B8F7A3004080a8dadC9Ab935250714a3A27aaE";
// const btcPayoutAddress =
//   "bc1pal6d4gfjt5aa58yv29kzu2a9xwp69rl797uhk8lwk6t2h8wd0s9skhaer8";
// const pkpBtcAddress = "184rYD2CTpTv8AabFmwAoXFuPn7dPDrbMi";

const ethPrice = "{{ethPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "{{ethPayoutAddress}}";

export async function go() {
  try {
    const utxoAPI = new BlockchainInfoUtxoApi();
    const inscriptionAPI = new OrdXyzInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const inscriptionManager = new InscriptionManager(listingService);
    const { ordinalUtxo, cardinalUtxo } =
      await inscriptionManager.checkInscriptionStatus(
        pkpBtcAddress,
        inscriptionId
      );

    const inboundEthTransactions = await getInboundEthTransactions(
      pkpEthAddress
    );

    const { winningTransfer, losingTransfers } = findWinnersByTransaction(
      inboundEthTransactions,
      ethPrice
    );

    const executorAddress = Lit.Auth.authSigAddress;
    if (executorAddress === winningTransfer?.from) {
      if (ordinalUtxo && cardinalUtxo && btcPayoutAddress) {
        const btcTransactionManager = new BtcTransactionManager();
        const { hashForInput0, hashForInput1, transaction } =
          btcTransactionManager.prepareInscriptionTransaction({
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
        Lit.Actions.setResponse({
          response: JSON.stringify({
            btcTransaction: transaction.toHex(),
          }),
        });
      }
    }

    if (winningTransfer || losingTransfers.length !== 0) {
      const { maxPriorityFeePerGas, maxFeePerGas } =
        await getCurrentGasPricesMainnet();

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
          sigName: "winningEthTransactionSignature",
        });
        Lit.Actions.setResponse({
          response: JSON.stringify({
            unsignedWinningEthTransaction: unsignedTransaction,
          }),
        });
      }
      if (losingTransfers) {
      }
    }
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

go();
