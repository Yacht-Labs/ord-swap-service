import { TestnetInscriptionAPI } from "./TestnetInscriptionAPI";

describe("InscriptionAPI", () => {
  let api: TestnetInscriptionAPI;

  beforeEach(() => {
    api = new TestnetInscriptionAPI();
  });

  it("should return the correct inscription data", async () => {
    // Replace with the actual inscriptionId you want to test
    const inscriptionId =
      "ada3ea268edf0ed5be424f9b4ab93ae8c23ebc262040682f177c645ac028d93ei0";
    const response = await api.getInscription(inscriptionId);

    // Replace with the actual values you expect
    expect(response).toEqual({
      id: "ada3ea268edf0ed5be424f9b4ab93ae8c23ebc262040682f177c645ac028d93ei0",
      number: 6215,
      address: "mnVtct1xY3LwJxR37esRwU1kMxSANd4sMq",
      location:
        "ada3ea268edf0ed5be424f9b4ab93ae8c23ebc262040682f177c645ac028d93e:0:0",
      output:
        "ada3ea268edf0ed5be424f9b4ab93ae8c23ebc262040682f177c645ac028d93e:0",
      value: "550",
      offset: "0",
    });
  });
});
