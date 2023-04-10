import { Inscription } from "../../types/models";
import { BaseAPI } from "../base/BaseApi";

export abstract class InscriptionAPI extends BaseAPI {
  public isValidInscriptionNumber(inscriptionNumber: string): boolean {
    return /^[0-9]+$/.test(inscriptionNumber);
  }

  public isValidInscriptionId(inscriptionId: string): boolean {
    return /^[a-fA-F0-9]{64}i[0-9]+$/.test(inscriptionId);
  }

  public abstract getInscription(
    inscriptionIdOrNumber: string
  ): Promise<Inscription>;

  public abstract normalizeInscriptionResponse(response: any): Inscription;
}
