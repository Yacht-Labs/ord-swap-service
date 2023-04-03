import { HiroOrdinalService } from "../OrdinalService/HiroOrdinalService";
import { UnspentOutput, UtxoService } from "../UtxoService/UtxoService";

export class LitInscriptionService {
  private utxoService: UtxoService;

  private ordinalService: HiroOrdinalService;

  constructor(utxoService: UtxoService, ordinalService: HiroOrdinalService) {
    this.utxoService = utxoService;
    this.ordinalService = ordinalService;
  }

  public getInscriptionDetails = async (idOrNumber: string) => {
    return this.ordinalService.getInscriptionDetails(idOrNumber);
  };

  public verifyInscriptionOwnership = async (
    idOrNumber: string,
    address: string
  ) => {
    return this.ordinalService.verifyInscriptionOwnership(idOrNumber, address);
  };

  public addressHasTwoUtxos = async (address: string) => {
    const utxos = await this.utxoService.getUtxos(address);
    return utxos.length === 2;
  };

  // public checkCardinalFeeRate = async (utxos: Array<UnspentOutput>) => {
  //   // 57.5*num_inputs + 43*num_outputs + 10.5
  //   const feeRate = 20; // sat/vbyte
  //   // check the size of the non inscription utxo and make sure it can satisfy the fee rate.  There will be two inputs and two outputs
  //   const nonInscriptionUtxo = utxos.find((utxo) => {
  //     return !utxo.inscription;
  //   }
  // };
}
