// if (process.env.NODE_ENV === "true") {
//   require("../../../development");
// }
import { TransactionService } from "../../bitcoin/TransactionManager";
import { checkInscriptionStatus } from "./ListingActions";
import {
  findWinnersByTransaction,
  getCurrentGasPrices,
  getInboundEthTransactions,
  mapTransferToTransaction,
  hashTransaction,
} from "./ordinalSwapAction";
const ethPrice = "0.1";
const inscriptionId =
  "3f22c588f0b509ed9f53f340e5d9fb1ae288db4830a7d48d9fd28d7f5f1e105ei0";
const ethPayoutAddress = "0x9D55D24aA6186d4a61Fa3BefeDBE4dD5dc0DC171";
const btcPayoutAddress =
  "bc1pdj2gvzymxtmcrs5ypm3pya8vc3h4fkk2g9kmav0j6skgruez88rsjprd7j";
// "bc1qfgfwtrlhk22y09v4c86dtlg373eeqfu0ujp6ft";
// const ethPrice = "{{hardEthPrice}}";
// const inscriptionId = "{{inscriptionId}}";
// const ethPayoutAddress = "{{ethPayoutAddress}}";

export async function go() {
  const { ordinalUtxo, cardinalUtxo } = await checkInscriptionStatus(
    pkpBtcAddress,
    inscriptionId
  );
  // const inboundEthTransactions = await getInboundEthTransactions(pkpEthAddress);
  // const { winningTransfer, losingTransfers } = findWinnersByTransaction(
  //   inboundEthTransactions,
  //   ethPrice
  // );
  // const executorAddress = Lit.Auth.authSigAddress;
  // if (executorAddress === winningTransfer?.from) {
  if (true) {
    if (ordinalUtxo && cardinalUtxo) {
      const transactionService = new TransactionService();
      const { hashForSig0, hashForSig1, transaction } =
        transactionService.prepareInscriptionTransaction({
          ordinalUtxo,
          cardinalUtxo,
          receivingAddress: btcPayoutAddress,
        });
      await Lit.Actions.signEcdsa({
        toSign: hashForSig0,
        publicKey: pkpPublicKey,
        sigName: "hashForSig0",
      });
      await Lit.Actions.signEcdsa({
        toSign: hashForSig1,
        publicKey: pkpPublicKey,
        sigName: "hashForSig1",
      });
      Lit.Actions.setResponse({
        response: JSON.stringify(transaction.toHex()),
      });
    }
  }
  // let maxPriorityFeePerGas, maxFeePerGas;
  // if (winningTransfer || losingTransfers) {
  //   ({ maxPriorityFeePerGas, maxFeePerGas } = await getCurrentGasPrices(80001));
  // }
  // if (winningTransfer) {
  //   const unsignedTransaction = mapTransferToTransaction(
  //     winningTransfer,
  //     ethPayoutAddress,
  //     0,
  //     maxPriorityFeePerGas as string,
  //     maxFeePerGas as string,
  //     80001
  //   );
  //   // Lit.Actions.setResponse({
  //   //   response: JSON.stringify(unsignedTransaction),
  //   // });
  // }
  // if (losingTransfers) {
  // }
}

go();
