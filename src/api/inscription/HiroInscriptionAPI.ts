import { Inscription } from "../../types/models";
import { InscriptionAPI } from "./InscriptionAPI";

export type HiroInscriptionResponse = {
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

export class HiroInscriptionAPI extends InscriptionAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL =
      process.env.NODE_ENV === "test"
        ? "http://localhost:3001"
        : "https://api.hiro.so";
  }
  public getInscription = async (
    inscriptionIdOrNumber: string
  ): Promise<Inscription> => {
    try {
      // if (!this.isValidInscriptionId(inscriptionIdOrNumber)) {
      //   throw new Error(`Invalid inscription id: ${inscriptionIdOrNumber}`);
      // }
      // if (!this.isValidInscriptionNumber(inscriptionIdOrNumber)) {
      //   throw new Error(`Invalid inscription number: ${inscriptionIdOrNumber}`);
      // }
      const URL = `/ordinals/v1/inscriptions/${inscriptionIdOrNumber}`;
      const inscription = (await this.fetchData(URL)) as Inscription;
      return inscription;
    } catch (err) {
      throw new Error(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public getInscriptionsByAddress = async (address: string): Promise<any> => {
    try {
      // if (!this.isValidAddress(address)) {
      //   throw new Error(`Invalid address: ${address}`);
      // }
      const URL = `/ordinals/v1/inscriptions?address=${address}`;
      const inscription = (await this.fetchData(URL)) as any;
      return inscription.results[0];
      // return this.normalizeInscriptionResponse(inscription);
      return inscription;
    } catch (err) {
      throw new Error(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public normalizeInscriptionResponse(
    response: HiroInscriptionResponse
  ): Inscription {
    const { id, number, address, location, output, value, offset } = response;
    return { id, number, address, location, output, value, offset };
  }
}
