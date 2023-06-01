import axios from "axios";
import cheerio from "cheerio";
import { Inscription } from "../../../types/models";
import { InscriptionAPI } from "../InscriptionAPI";

export class TestnetInscriptionAPI extends InscriptionAPI {
  protected baseURL = "";
  async getInscription(inscriptionIdOrNumber: string): Promise<Inscription> {
    const response = await axios.get(
      `https://testnet.cleverord.com/inscription/${inscriptionIdOrNumber}`
    );
    return this.normalizeInscriptionResponse(response.data);
  }

  normalizeInscriptionResponse(response: any): Inscription {
    const $ = cheerio.load(response);

    const data: Partial<Inscription> = {};

    const h1Text = $("h1").text(); // This will give you 'Inscription 6215'
    const inscriptionNumber = h1Text.split(" ")[1]; // This will give you '6215'

    data.number = parseInt(inscriptionNumber); // Assuming your Inscription type has a 'number' field

    // iterate over each dt element and set the corresponding dd element to the data object
    $("dl")
      .children("dt")
      .each((index, element) => {
        const key = $(element).text();
        const value = $(element).next("dd").text();

        switch (key) {
          case "id":
            data.id = value;
            break;
          case "address":
            data.address = value;
            break;
          case "output value":
            data.value = value;
            break;
          // case "content length":
          //   // Process to remove ' bytes' from value
          //   data.contentLength = value.replace(" bytes", "");
          //   break;
          // case "content type":
          //   data.contentType = value;
          //   break;
          // case "timestamp":
          //   data.timestamp = value;
          //   break;
          // case "genesis height":
          //   data.genesisHeight = value;
          //   break;
          // case "genesis fee":
          //   data.genesisFee = value;
          //   break;
          // case "genesis transaction":
          //   data.genesisTransaction = value;
          //   break;
          case "location":
            data.location = value;
            break;
          case "output":
            data.output = value;
            break;
          case "offset":
            data.offset = value;
            break;
        }
      });

    if (
      !data.id ||
      !data.address ||
      !data.value ||
      // !data.contentLength ||
      // !data.contentType ||
      // !data.timestamp ||
      // !data.genesisHeight ||
      // !data.genesisFee ||
      // !data.genesisTransaction ||
      !data.location ||
      !data.output ||
      !data.offset
    ) {
      throw new Error("Missing required data");
    }

    return data as Inscription;
  }
}
