import { Request, Response } from "express";
import { ListingService } from "../../services/ListingService";
import { UtxoAPI } from "../../api/utxo/UtxoAPI";
import { InscriptionAPI } from "../../api/inscription/InscriptionAPI";

export class ListingController {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  confirmListing = async (req: Request, res: Response) => {
    const { listingId } = req.body;
    const listingService = new ListingService(
      this.inscriptionAPI,
      this.utxoAPI
    );

    try {
      const { listingIsConfirmed } = await listingService.confirmListing(
        listingId
      );
      res.status(200).json({ listingIsConfirmed });
    } catch (err) {
      console.error(err);
      res.status(500).send((err as Error).message);
    }
  };
}
