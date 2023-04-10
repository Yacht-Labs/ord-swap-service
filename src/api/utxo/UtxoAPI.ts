import { Utxo } from "../../types/models";
import { BaseAPI } from "../base/BaseApi";

export abstract class UtxoAPI extends BaseAPI {
  public abstract getUtxosByAddress(
    address: string,
    confirmations: number
  ): Promise<Utxo[]>;
  public abstract normalizeUtxoResponse(response: any): Utxo;
}
