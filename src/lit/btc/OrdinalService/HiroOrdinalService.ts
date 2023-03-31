import { UtxoService, UnspentOutput } from "../UtxoService/UtxoService";

export type InscriptionResponse = {
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

export class HiroOrdinalService {
  private baseUrl = "https://api.hiro.so";

  private utxoService = new UtxoService();

  private inscriptionPath = "/ordinals/v1/inscription";

  public getInscriptionDetails = async (idOrNumber: string) => {
    const inscriptionRegex = /^[a-fA-F0-9]{64}i[0-9]+$/;
    const numberRegex = /^[0-9]+$/;

    if (!inscriptionRegex.test(idOrNumber) && !numberRegex.test(idOrNumber)) {
      throw new Error("Invalid idOrNumber");
    }
    try {
      const response = await fetch(
        `${this.baseUrl}${this.inscriptionPath}/${idOrNumber}`
      );
      const inscriptionResponse = await response.json();
      return inscriptionResponse as InscriptionResponse;
    } catch (err) {
      throw new Error(
        `Failed to retrieve inscription details: ${(err as Error).message}`
      );
    }
  };

  public verifyInscriptionOwnership = async (
    idOrNumber: string,
    address: string
  ) => {
    const inscriptionResponse = await this.getInscriptionDetails(idOrNumber);
    return inscriptionResponse.address === address;
  };

  public getInputs = async (idOrNumber: string, address: string) => {
    const inscription = await this.getInscriptionDetails(idOrNumber);
    const ownsInscription = await this.verifyInscriptionOwnership(
      idOrNumber,
      address
    );

    // check that the address owns the inscription
    if (!ownsInscription) {
      throw new Error("The address does not own the inscription");
    }

    // get the utxos for the address
    const utxos = await this.utxoService.getUtxos(inscription.address);

    // check that there are two utxos
    if (utxos.length !== 2) {
      throw new Error("There are not two UTXOs in the address");
    }

    const [iTxHash, iVout, iOffset] = inscription.location.split(":");
    const ordinalUtxo = utxos.find((utxo) => {
      return utxo.txHash === iTxHash && utxo.vout === iVout;
    });

    const cardinalUtxo = utxos.find((utxo) => {
      return utxo.txHash !== iTxHash || utxo.vout !== iVout;
    });

    if (!ordinalUtxo || !cardinalUtxo) {
      throw new Error("Could not find the ordinal and cardinal UTXOs");
    }

    return {
      ordinalUtxo,
      cardinalUtxo,
    };
  };
}
