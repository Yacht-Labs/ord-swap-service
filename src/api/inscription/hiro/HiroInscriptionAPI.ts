import { ApiError } from "../../../types/errors";
import { Inscription } from "../../../types/models";
import { isDevelopment, isTest } from "../../../utils/env";
import { InscriptionAPI } from "../InscriptionAPI";

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
      isTest() || isDevelopment()
        ? "http://localhost:3001"
        : "https://api.hiro.so";
  }

  public getInscription = async (
    inscriptionIdOrNumber: string
  ): Promise<Inscription> => {
    try {
      // TODO: VALIDATE INSCRIPTION ID
      const URL = `/ordinals/v1/inscriptions/${inscriptionIdOrNumber}`;
      const inscription = (await this.fetchData(URL)) as Inscription;
      return inscription;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public getInscriptionsByAddress = async (
    address: string
  ): Promise<Inscription[]> => {
    try {
      const URL = `/ordinals/v1/inscriptions?address=${address}`;
      const inscriptions = (await this.fetchData(URL)) as any;
      if (inscriptions.results) {
        return inscriptions.results.map(this.normalizeInscriptionResponse);
      }
      throw new Error(`No inscriptions found for address: ${address}`);
    } catch (err) {
      throw new ApiError(
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
