// params provided:
// pkpBtcAddress
// pkpEthAddress
// ethPayoutAddress
// ethPrice
// buyer btcAddress

// first check if the ordinal UTXO is on the pkpBtcAddress
// second check if the cardinal UTXO is on the pkpBtcAddress

// third check if any ETH transactions have been sent to the pkpEthAddress

// iterate through the ETH transactions and choose the one that has above the ethPrice and lowest ethAddress

// if there is an ETH transaction that satisfies the above conditions
// actionExecutorEthAddress === sentFrom address of the transaction then return:
// 1: signed bitcoin ordinal transaction that will transfer the ordinal UTXO to the buyer's btcAddress
// 2: signed ETH transaction that will transfer the ethPrice - platform fee to the ethPayoutAddress

// if there is are additional ETH transactions that did not win the bid proceed with the following logic:
// then return:
// 1: signed ETH transactions returning the full transaction amount to the from address on the losing ETH transactions

const hashTransaction = (tx) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.arrayify(ethers.utils.serializeTransaction(tx))
    )
  );
};

const createUnsignedTransaction = (
  fromAddress,
  toAddress,
  value,
  nonce,
  maxPriorityFeePerGas,
  maxFeePerGas
) => {
  const transaction = {
    from: fromAddress,
    to: toAddress,
    value: ethers.utils.parseEther(value),
    nonce,
    maxPriorityFeePerGas: ethers.utils.parseUnits(maxPriorityFeePerGas, "gwei"),
    maxFeePerGas: ethers.utils.parseUnits(maxFeePerGas, "gwei"),
    gasLimit: ethers.BigNumber.from("21000"), // Gas limit for a simple Ether transfer
    type: 2, // EIP-1559 transaction
    chainId: 80001, // Polygon Mumbai testnet
  };

  return transaction;
};

async function signEthPayoutTx() {
  const unsignedTx = createUnsignedTransaction(
    pkpEthAddress,
    ethPayoutAddress,
    "0.1",
    0,
    "10",
    "100"
  );

  Lit.Actions.setResponse({
    response: JSON.stringify(unsignedTx),
  });

  await LitActions.signEcdsa({
    toSign: hashTransaction(unsignedTx),
    publicKey: pkpPublicKey,
    sigName: "ethPayoutSignature",
  });
}

async function createTaprootSeedSig() {
  await LitActions.signEcdsa({
    toSign: "TaprootSeedSigner",
    publicKey: pkpPublicKey,
    sigName: "taprootSig",
  });
}

function findWinnerAndLosersByBlock(transfers, minAmount) {
  let winner = null;
  const losers = [];

  for (const transfer of transfers) {
    const blockNum = parseInt(transfer.blockNum, 16);
    const { value } = transfer;

    if (value >= minAmount) {
      if (
        !winner ||
        blockNum < parseInt(winner.blockNum, 16) ||
        (blockNum === parseInt(winner.blockNum, 16) &&
          transfer.from < winner.from)
      ) {
        if (winner) {
          losers.push(winner.from);
        }
        winner = transfer;
      } else {
        losers.push(transfer.from);
      }
    }
  }

  return {
    winner: winner ? winner.from : null,
    losers,
  };
}

async function getAssetTransfers(address) {
  const payload = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: {
      fromBlock: "0x0",
      toBlock: "latest",
      toAddress: address,
      category: ["external"],
      withMetadata: true,
    },
  };

  const response = await fetch(
    "https://polygon-mumbai.g.alchemy.com/v2/Agko3FEsqf1Kez7aSFPZViQnUd8sI3rJ",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();

  if (data.error) {
    console.error("Error fetching asset transfers:", data.error);
    return;
  }
  return data.result.transfers;
}

async function main() {
  const executorAddress = Lit.Auth.authSigAddress;

  await createTaprootSeedSig();
  await signEthPayoutTx();
}
main();
