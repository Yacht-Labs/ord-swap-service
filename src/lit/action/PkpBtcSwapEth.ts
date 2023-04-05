import { checkInscriptionStatus } from "./ListingActions";
import {
  findWinnersByTransaction,
  getCurrentGasPrices,
  getInboundEthTransactions,
  mapTransferToTransaction,
  hashTransaction,
} from "./ordinalSwapAction";

const ethPrice = "{{hardEthPrice}}";
const inscriptionId = "{{inscriptionId}}";
const ethPayoutAddress = "{{ethPayoutAddress}}";

async function go() {
  const { ordinalUtxo, cardinalUtxo } = await checkInscriptionStatus(
    pkpBtcAddress,
    inscriptionId
  );
  console.log("Here in Lit Action0");
  const inboundEthTransactions = await getInboundEthTransactions(pkpEthAddress);
  const { winningTransfer, losingTransfers } = findWinnersByTransaction(
    inboundEthTransactions,
    ethPrice
  );
  console.log("Here in Lit Action1");
  const executorAddress = Lit.Auth.authSigAddress;
  if (executorAddress === winningTransfer?.from) {
    if (ordinalUtxo && cardinalUtxo) {
      console.log(
        "Found Cardinal and Ordinal and are creating btc payout transaction"
      );
    }
  }
  let maxPriorityFeePerGas, maxFeePerGas;
  if (winningTransfer || losingTransfers) {
    ({ maxPriorityFeePerGas, maxFeePerGas } = await getCurrentGasPrices(80001));
    console.log("Here in Lit Action2");
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
    console.log("Here in Lit Action3");
    Lit.Actions.setResponse({
      response: JSON.stringify(unsignedTransaction),
    });
  }
  if (losingTransfers) {
  }
}

go();
