async function fetchAssetTransfers(toAddress) {
  const url =
    "https://polygon-mumbai.g.alchemy.com/v2/Agko3FEsqf1Kez7aSFPZViQnUd8sI3rJ";

  const payload = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: {
      fromBlock: "0x0",
      toBlock: "latest",
      toAddress,
      category: ["external"],
      withMetadata: true,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.error) {
    console.error("Error fetching asset transfers:", data.error);
    return;
  }

  console.log("Asset transfers:", data.result);
  console.log("Asset transfers:", data.result.transfers[0].metadata);
  console.log("Asset transfers:", data.result.transfers[1].metadata);
}

// Replace this with the address you want to fetch asset transfers for
const targetAddress = "0xf655d48565d45eC4CAB67c0dF35479E3c0Fa2c57";
fetchAssetTransfers(targetAddress);
