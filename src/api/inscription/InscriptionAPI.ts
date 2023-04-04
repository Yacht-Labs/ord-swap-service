import { Inscription } from "src/models/Inscription";
import { BaseAPI } from "../base/BaseApi";

export abstract class BaseInscriptionAPI extends BaseAPI {
  public isValidInscriptionNumber(inscriptionNumber: string): boolean {
    return /^[0-9]+$/.test(inscriptionNumber);
  }

  public isValidInscriptionId(inscriptionId: string): boolean {
    return /^[a-fA-F0-9]{64}i[0-9]+$/.test(inscriptionId);
  }

  public abstract getInscriptionDetails(
    inscriptionIdOrNumber: string
  ): Promise<Inscription>;

  public abstract normalizeInscriptionResponse(response: any): Inscription;
}
