// if (process.env.NODE_ENV === "true") {
//   require("../../../development");
// }
import { BtcTransactionManager } from "../../bitcoin/TransactionManager";
import { checkInscriptionStatus } from "./ListingActions";
import {
  findWinnersByTransaction,
  getCurrentGasPrices,
  getInboundEthTransactions,
  mapTransferToTransaction,
  hashTransaction,
} from "./ordinalSwapAction";
// const ethPrice = "0.1";
// const inscriptionId =
//   "3f22c588f0b509ed9f53f340e5d9fb1ae288db4830a7d48d9fd28d7f5f1e105ei0";
// const ethPayoutAddress = "0x9D55D24aA6186d4a61Fa3BefeDBE4dD5dc0DC171";
// const btcPayoutAddress =
//   "bc1pdj2gvzymxtmcrs5ypm3pya8vc3h4fkk2g9kmav0j6skgruez88rsjprd7j";

const ethPrice = "{{hardEthPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "{{ethPayoutAddress}}";

export async function go() {
  try {
    const { ordinalUtxo, cardinalUtxo } = await checkInscriptionStatus(
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

    let maxPriorityFeePerGas, maxFeePerGas;
    if (winningTransfer || losingTransfers) {
      ({ maxPriorityFeePerGas, maxFeePerGas } = await getCurrentGasPrices(
        80001
      ));
    }
    if (winningTransfer) {
      const unsignedTransaction = mapTransferToTransaction(
        winningTransfer,
        ethPayoutAddress,
        0,
        maxPriorityFeePerGas as string,
        maxFeePerGas as string,
        80001
      );
      Lit.Actions.signEcdsa({
        toSign: hashTransaction(unsignedTransaction),
        publicKey: pkpPublicKey,
        sigName: "winningEthTransaction",
      });
      Lit.Actions.setResponse({
        response: JSON.stringify({
          unsignedEthTransaction: unsignedTransaction,
        }),
      });
    }
    if (losingTransfers) {
    }
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ error: (err as Error).message }),
    });
  }
}

go();
