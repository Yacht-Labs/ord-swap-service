import { PrismaClient } from "@prisma/client";
import { HiroOrdinalService } from "../lit/btc/OrdinalService/HiroOrdinalService";

const prisma = new PrismaClient();
export async function confirmOrdinalsInWallet() {
  // get all listings that haven't been sold and havent been confirmed or cancelled
  const listings = await prisma.listing.findMany({
    where: {
      cancelledDate: null,
      sellDate: null,
      confirmedDate: null,
    },
  });
  // for each listing, see if the ordinal is in the wallet along with a cardinal at a certain fee rate (will read ENV var for now)
  for await (const listing of listings) {
    const ordService = new HiroOrdinalService(
      listing.inscriptionId,
      listing.pkpBtcAddress
    );
    const inscription = await ordService.getInscription();
    if (inscription) {
      // check to see if it has cardinal transaction that matches a certain fee rate
      // Pay-to-Public-Key-Hash (P2PKH) outputs have a fixed size of 34 bytes
      // Inputs have average size of 147.5 bytes
      const cardinal = await ordService.getCardinal();
    }
  }
}
