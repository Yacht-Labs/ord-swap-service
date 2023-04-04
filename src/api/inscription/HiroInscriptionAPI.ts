import { Inscription } from "src/models/Inscription";
import { BaseInscriptionAPI } from "./InscriptionAPI";

type InscriptionResponse = {
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

export class HiroInscriptionAPI extends BaseInscriptionAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "https://api.hiro.so";
  }
  public getInscriptionDetails = async (
    inscriptionIdOrNumber: string
  ): Promise<Inscription> => {
    try {
      if (!this.isValidInscriptionId(inscriptionIdOrNumber)) {
        throw new Error(`Invalid inscription id: ${inscriptionIdOrNumber}`);
      }
      if (!this.isValidInscriptionNumber(inscriptionIdOrNumber)) {
        throw new Error(`Invalid inscription number: ${inscriptionIdOrNumber}`);
      }
      const URL = `/inscriptions/${inscriptionIdOrNumber}`;
      const inscription = (await this.fetchData(URL)) as Inscription;
      return inscription;
    } catch (err) {
      throw new Error(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public normalizeInscriptionResponse(
    response: InscriptionResponse
  ): Inscription {
    const { id, number, address, location, output, value, offset } = response;
    return { id, number, address, location, output, value, offset };
  }
}
