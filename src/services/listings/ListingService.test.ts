import { ListingService } from "./ListingService";
import { prismaMock } from "../../db/prisma.singleton";
import { generateValidStubListing } from "../../utils/stubs";
import { faker } from "@faker-js/faker";

describe("ListingService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return bought listings when they exist", async () => {
    const accountId = faker.datatype.uuid();
    const listing1 = {
      ...generateValidStubListing(),
      buyerAccountId: accountId,
    };
    const listing2 = {
      ...generateValidStubListing(),
      buyerAccountId: accountId,
    };

    prismaMock.listing.findMany.mockResolvedValue([listing1, listing2]);

    const listings = await ListingService.getBoughtListings(accountId);

    expect(listings).toEqual([listing1, listing2]);
    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: { buyerAccountId: accountId },
    });
  });
});
