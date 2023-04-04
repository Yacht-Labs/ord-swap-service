// import { UtxoService, UnspentOutput } from "../UtxoService/UtxoService";

// export type InscriptionResponse = {
//   id: string;
//   number: number;
//   address: string;
//   genesis_address: string;
//   genesis_block_height: number;
//   genesis_block_hash: string;
//   genesis_tx_id: string;
//   genesis_fee: string;
//   genesis_timestamp: number;
//   location: string;
//   output: string;
//   value: string;
//   offset: string;
//   sat_ordinal: string;
//   sat_rarity: string;
//   sat_coinbase_height: number;
//   mime_type: string;
//   content_type: string;
//   content_length: number;
//   timestamp: number;
// };

// export class HiroInscriptionApi {
//   private inscriptionIdOrNumber: string;

//   private baseUrl = "https://api.hiro.so";

//   public utxoService = new UtxoService();

//   private inscriptionPath = "/ordinals/v1/inscription";

//   public address: string;

//   constructor(inscriptionIdOrNumber: string, address: string) {
//     this.inscriptionIdOrNumber = inscriptionIdOrNumber;
//     this.address = address;
//   }

//   public getInscriptionDetails = async () => {
//     const inscriptionRegex = /^[a-fA-F0-9]{64}i[0-9]+$/;
//     const numberRegex = /^[0-9]+$/;

//     if (
//       !inscriptionRegex.test(this.inscriptionIdOrNumber) &&
//       !numberRegex.test(this.inscriptionIdOrNumber)
//     ) {
//       throw new Error(
//         `Invalid Inscription idOrNumber: ${this.inscriptionIdOrNumber}`
//       );
//     }
//     try {
//       const response = await fetch(
//         `${this.baseUrl}${this.inscriptionPath}/${this.inscriptionIdOrNumber}`
//       );
//       const inscriptionResponse = await response.json();

//       if (
//         inscriptionResponse.error ||
//         inscriptionResponse.status !== "success"
//       ) {
//         throw new Error(inscriptionResponse.error);
//       }

//       // check some properties of the inscription to make sure its real
//       if (
//         !inscriptionResponse.id ||
//         !inscriptionResponse.number ||
//         !inscriptionResponse.address ||
//         !inscriptionResponse.location
//       ) {
//         throw new Error("Invalid Inscription Response");
//       }

//       return inscriptionResponse as InscriptionResponse;
//     } catch (err) {
//       throw new Error(
//         `Failed to retrieve inscription details: ${(err as Error).message}`
//       );
//     }
//   };

//   public async getInscription() {
//     const inscription = await this.getInscriptionDetails();
//     return inscription.address === this.address ? inscription : undefined;
//   }

//   public async getCardinal() {
//     // get the utxos for the address
//     const utxos = await this.utxoService.getUtxos(this.address);
//     if (utxos.length !== 2) {
//       return false;
//     }
//   }

//   public getInputs = async (address: string) => {
//     const inscription = await this.getInscriptionDetails();
//     const ownsInscription = inscription.address === address;

//     // check that the address owns the inscription
//     if (!ownsInscription) {
//       throw new Error("The address does not own the inscription");
//     }

//     // get the utxos for the address
//     const utxos = await this.utxoService.getUtxos(inscription.address);

//     // check that there are two utxos
//     if (utxos.length !== 2) {
//       throw new Error("There are not two UTXOs in the address");
//     }

//     const [iTxHash, iVout, iOffset] = inscription.location.split(":");
//     const ordinalUtxo = utxos.find((utxo) => {
//       return utxo.txHash === iTxHash && utxo.vout === iVout;
//     });

//     const cardinalUtxo = utxos.find((utxo) => {
//       return utxo.txHash !== iTxHash || utxo.vout !== iVout;
//     });

//     if (!ordinalUtxo || !cardinalUtxo) {
//       throw new Error("Could not find the ordinal and cardinal UTXOs");
//     }

//     return {
//       ordinalUtxo,
//       cardinalUtxo,
//     };
//   };
// }
