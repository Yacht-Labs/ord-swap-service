import { LitService } from "../../services/lit/LitService";

describe("PKP Tests", () => {
  const litService = new LitService();
  let pkp: any;

  beforeAll(async () => {
    pkp = await litService.mintPkp();
  }, 60000);

  it("On POST /listings it creates a valid PKP on chronicle chain", async () => {
    const derivedPubKey = await litService.getPubKeyByPKPTokenId(pkp.tokenId);
    expect(derivedPubKey).toEqual(pkp.publicKey);
  }, 60000);

  it("should throw an error if minting fails", async () => {
    litService.pkpContract = {
      mintNext: jest.fn().mockImplementation(() => {
        throw new Error('mock error');
      })
    } as any;

    try {
      await litService.mintPkp();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toHaveProperty('message', 'Error minting PKP: Error: mock error');
    }
  }, 60000);
});
