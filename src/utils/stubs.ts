import { faker } from "@faker-js/faker";
import { Account } from "@prisma/client";
import { ethers } from "ethers";

export function generateStubAccount(): Account {
  const ethAddress = faker.finance.ethereumAddress();
  const btcPayoutAddress =
    faker.random.word().length % 2 === 0
      ? faker.finance.bitcoinAddress()
      : null;
  const createdAt = faker.date.recent();

  return {
    id: faker.datatype.uuid(),
    ethAddress,
    createdAt,
    btcPayoutAddress,
  };
}

import { ListingStatus } from "@prisma/client";

export function getRandomDateInPast(days: number) {
  const now = new Date();
  const msInPast = Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - msInPast);
}

export function generateRandomInscriptionId() {
  // Generate a random Bitcoin transaction ID (TXID)
  const txId = faker.finance.bitcoinAddress();

  // Generate a random index N (between 1 and 10 for example)
  const n = faker.datatype.number({ min: 1, max: 10 });

  // Return the inscription ID in the format "TXIDiN"
  return `${txId}i${n}`;
}

export function getRandomListingStatus() {
  const statuses = Object.values(ListingStatus);
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateValidStubListing() {
  const randomStatus = getRandomListingStatus();

  const buyerAccountId =
    randomStatus === ListingStatus.Sold ? faker.datatype.uuid() : null;

  const confirmedDate =
    randomStatus === ListingStatus.Ready ||
    randomStatus === ListingStatus.Sold ||
    (randomStatus === ListingStatus.Cancelled && Math.random() < 0.5)
      ? getRandomDateInPast(10)
      : null;

  const cancelledDate =
    randomStatus === ListingStatus.Cancelled ? getRandomDateInPast(10) : null;

  const sellDate =
    randomStatus === ListingStatus.Sold ? getRandomDateInPast(10) : null;

  return {
    id: faker.datatype.uuid(),
    inscriptionId: generateRandomInscriptionId(),
    inscriptionNumber: getRandomNumber(1, 1000000).toString(),
    listingAccountId: faker.datatype.uuid(),
    ethPrice: (Math.random() * 300 + 0.01).toFixed(
      Math.floor(Math.random() * 5)
    ),
    pkpPublicKey: ethers.Wallet.createRandom().publicKey,
    pkpBtcAddress: faker.finance.bitcoinAddress(), // This is not a valid btc address but a placeholder. Use a library to generate a valid taproot address., // Replace with a valid bitcoin taproot address
    createdAt: faker.date.past(),
    confirmedDate,
    cancelledDate,
    sellDate,
    status: randomStatus,
    buyerAccountId,
  };
}
