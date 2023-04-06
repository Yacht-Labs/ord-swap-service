if (process.env.NODE_ENV === "true") {
  require("../../../development");
}
import { TransactionService } from "../../bitcoin/TransactionService/TransactionService";
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
  "bc1p3xxdttztn9q30qksh8jm6haprjkknln7vl7gd930up3lcpnkaxsshykufv";
// const ethPrice = "{{hardEthPrice}}";
// const inscriptionId = "{{inscriptionId}}";
// const ethPayoutAddress = "{{ethPayoutAddress}}";

export async function go() {
  const { ordinalUtxo, cardinalUtxo } = await checkInscriptionStatus(
    pkpBtcAddress,
    inscriptionId
  );
  const inboundEthTransactions = await getInboundEthTransactions(pkpEthAddress);
  const { winningTransfer, losingTransfers } = findWinnersByTransaction(
    inboundEthTransactions,
    ethPrice
  );
  const executorAddress = Lit.Auth.authSigAddress;
  if (executorAddress === winningTransfer?.from) {
    if (ordinalUtxo && cardinalUtxo) {
      const transactionService = new TransactionService();
      const { hashForSig0, hashForSig1 } =
        transactionService.prepareInscriptionTransaction({
          ordinalUtxo,
          cardinalUtxo,
          receivingAddress: btcPayoutAddress,
        });
      await Lit.LitActions.signEcdsa({
        toSign: hashForSig0,
        publicKey: pkpPublicKey,
        sigName: "hashForSig0",
      });
      await Lit.LitActions.signEcdsa({
        toSign: hashForSig1,
        publicKey: pkpPublicKey,
        sigName: "hashForSig1",
      });
    }
  }
  let maxPriorityFeePerGas, maxFeePerGas;
  if (winningTransfer || losingTransfers) {
    ({ maxPriorityFeePerGas, maxFeePerGas } = await getCurrentGasPrices(80001));
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
    // Lit.Actions.setResponse({
    //   response: JSON.stringify(unsignedTransaction),
    // });
  }
  if (losingTransfers) {
  }
}

go();
