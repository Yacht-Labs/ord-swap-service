import { PrismaClient, ListingStatus } from "@prisma/client";
import { ethers } from "ethers";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const API_ENDPOINT = "https://api.hiro.so/ordinals/v1/inscriptions"; // Replace with the correct API endpoint
const NUM_INSCRIPTIONS = 60; // Replace with the desired number of inscriptions

type Inscription = {
  id: string;
  number: number;
  address: string;
  genesis_address: string;
  genesis_block_height: number;
  genesis_block_hash: string;
  genesis_tx_id: string;
  genesis_fee: string;
  genesis_timestamp: number;
  location: string;
  output: string;
  value: string;
  offset: string;
  sat_ordinal: string;
  sat_rarity: string;
  sat_coinbase_height: number;
  mime_type: string;
  content_type: string;
  content_length: number;
  timestamp: number;
};

type ApiResponse = {
  limit: number;
  offset: number;
  total: number;
  results: Inscription[];
};

function generateRandomAddress() {
  const addressLength = 34; // P2PKH addresses are 34 characters long
  const addressCharset =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // Base58 character set (excluding confusing characters)

  let address = "";
  for (let i = 0; i < addressLength; i++) {
    const randomCharIndex = Math.floor(Math.random() * addressCharset.length);
    address += addressCharset[randomCharIndex];
  }

  return address;
}

function getRandomDateInPast(days: number) {
  const now = new Date();
  const msInPast = Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - msInPast);
}

async function fetchInscriptions(limit = 50) {
  try {
    const url = `${API_ENDPOINT}?limit=${limit}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = (await response.json()) as ApiResponse;
      return data.results;
    }
    console.log("API call failed:", response.statusText);
  } catch (error) {
    console.log("API call failed:", (error as Error).message);
  }
  return [];
}

function getRandomStatus() {
  const statuses = Object.values(ListingStatus);
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
}

async function getRandomAccountId() {
  const randomAccount = await prisma.account.findFirst({
    orderBy: {
      createdAt: "desc", // or 'asc' if you prefer
    },
    skip: Math.floor(Math.random() * (await prisma.account.count())),
  });

  return randomAccount?.id;
}

async function seedAndReset() {
  // Fetch inscriptions from the API
  const inscriptions = await fetchInscriptions(NUM_INSCRIPTIONS);

  if (inscriptions.length === 0) {
    console.log("No inscriptions fetched. Aborting database update.");
    return;
  }

  // Delete existing data
  await prisma.listing.deleteMany({});
  await prisma.account.deleteMany({});

  // Seed the database with the new data
  const accounts = inscriptions
    .filter((inscription: Inscription) => {
      return inscription.mime_type.includes("image");
    })
    .map(async (inscription: Inscription) => {
      let account = await prisma.account.findFirst({
        where: {
          ethAddress: inscription.address,
        },
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            ethAddress: ethers.Wallet.createRandom().address,
          },
        });
      }

      const randomStatus = getRandomStatus();

      const buyerAccountId =
        randomStatus === ListingStatus.Sold ? await getRandomAccountId() : null;

      const confirmedDate =
        randomStatus === ListingStatus.Ready ||
        randomStatus === ListingStatus.Sold ||
        (randomStatus === ListingStatus.Cancelled && Math.random() < 0.5)
          ? getRandomDateInPast(10)
          : null;

      const cancelledDate =
        randomStatus === ListingStatus.Cancelled
          ? getRandomDateInPast(10)
          : null;

      const sellDate =
        randomStatus === ListingStatus.Sold ? getRandomDateInPast(10) : null;
      return prisma.listing.create({
        data: {
          inscriptionId: inscription.id,
          inscriptionNumber: inscription.number.toString(),
          listingAccountId: account.id,
          ethPrice: (Math.random() * 300 + 0.01).toFixed(
            Math.floor(Math.random() * 5)
          ),
          pkpPublicKey: ethers.Wallet.createRandom().publicKey,
          pkpBtcAddress: generateRandomAddress(), // This is not a valid btc address but a placeholder. Use a library to generate a valid taproot address., // Replace with a valid bitcoin taproot address
          confirmedDate,
          cancelledDate,
          sellDate,
          status: randomStatus,
          buyerAccountId,
        },
      });
    });

  await Promise.all(accounts);
  console.log("Database seeded and reset successfully.");
}

seedAndReset()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
