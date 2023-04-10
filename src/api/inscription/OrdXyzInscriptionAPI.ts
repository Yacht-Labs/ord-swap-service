import { InscriptionAPI } from "./InscriptionAPI";
import { Inscription } from "../../types/models";

type OrdXyxInscriptionResponse = {
  address: string;
  content: string;
  "content length": string;
  "content type": string;
  content_length: string;
  content_type: string;
  "genesis fee": string;
  "genesis height": string;
  "genesis transaction": string;
  genesis_fee: string;
  genesis_height: string;
  genesis_transaction: string;
  id: string;
  inscription_number: number;
  location: string;
  offset: string;
  output: string;
  "output value": string;
  output_value: string;
  preview: string;
  sat: string;
  timestamp: string;
  title: string;
};

export class OrdXyzInscriptionAPI extends InscriptionAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "https://ordapi.xyz";
  }
  public getInscription = async (
    inscriptionId: string
  ): Promise<Inscription> => {
    try {
      const URL = `/inscription/${inscriptionId}`;
      const inscriptionResponse = (await this.fetchData(
        URL
      )) as OrdXyxInscriptionResponse;
      return this.normalizeInscriptionResponse(inscriptionResponse);
    } catch (err) {
      throw new Error(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public normalizeInscriptionResponse = (
    ordXyzInscription: OrdXyxInscriptionResponse
  ): Inscription => {
    return {
      id: ordXyzInscription.id,
      number: ordXyzInscription.inscription_number,
      address: ordXyzInscription.address,
      location: ordXyzInscription.location,
      output: ordXyzInscription.location.split(":")[1],
      value: ordXyzInscription.output_value,
      offset: ordXyzInscription.offset,
    };
  };
}
