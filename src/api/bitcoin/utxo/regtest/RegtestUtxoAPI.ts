import { RegtestUtils } from "regtest-client";
import { UtxoAPI } from "../UtxoAPI";

interface Unspent {
  value: number;
  txId: string;
  vout: number;
  address?: string;
  height?: number;
}

export class RegtestUtxoAPI extends UtxoAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "http://localhost:8080/1";
  }

  getUtxosByAddress = async (address: string, confirmations = 0) => {
    const regtestUtils = new RegtestUtils({ APIURL: this.baseURL });
    const utxos = await regtestUtils.unspents(address);
    return utxos.map((utxo) => ({
      ...this.normalizeUtxoResponse(utxo),
      address,
    }));
  };

  public normalizeUtxoResponse(utxo: Unspent) {
    return {
      txId: utxo.txId,
      vout: utxo.vout,
      scriptPubKey: "",
      amount: utxo.value,
      confirmations: utxo.height || null,
      address: "",
    };
  }
}
