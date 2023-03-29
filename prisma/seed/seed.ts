import { Account, Listing, Prisma, PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import crypto from "crypto";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const API_ENDPOINT = "https://api.hiro.so/ordinals/v1/inscriptions"; // Replace with the correct API endpoint

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

async function fetchInscriptions(limit = 50) {
  try {
    const url = `${API_ENDPOINT}?limit=${limit}`;
    console.log(url);
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

async function seedAndReset() {
  // Fetch inscriptions from the API
  const inscriptions = await fetchInscriptions(50);

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
            ethAddress: inscription.address,
          },
        });
      }

      return prisma.listing.create({
        data: {
          inscriptionId: inscription.id,
          inscriptionNumber: inscription.number.toString(),
          listingAccountId: account.id,
          ethPrice: (Math.random() * 1000 + 0.01).toFixed(
            Math.floor(Math.random() * 5)
          ),
          pkpPublicKey: ethers.Wallet.createRandom().publicKey, // Replace with a valid uncompressed ethereum public key
          taprootAddress: `bc1p${crypto.randomBytes(30).toString("hex")}`, // This is not a valid taproot address but a placeholder. Use a library to generate a valid taproot address., // Replace with a valid bitcoin taproot address
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