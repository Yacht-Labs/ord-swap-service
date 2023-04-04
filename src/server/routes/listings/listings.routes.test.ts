// /* eslint-disable @typescript-eslint/no-explicit-any */
// import request from "supertest";
// import { Listing } from "@prisma/client";
// import { prismaMock } from "../../../db/prisma.singleton";
// import { getRandomEthereumAddress } from "../../../util/eth";
// import { startServer } from "../../server"; // Import your server start function
// // Import your prisma instance
// let server: any;

// beforeAll(async () => {
//   server = await startServer(0);
// });

// afterEach(async () => {
//   server.close();
// });

// describe("POST /listings", () => {
//   let validData: any;

//   beforeEach(() => {
//     validData = {
//       ethAddress: getRandomEthereumAddress(),
//       ethPrice: Math.floor(Math.random() * 1000000 + 1).toString(),
//       inscriptionId: Math.floor(Math.random() * 1000000 + 1).toString(),
//     };
//   });

//   afterAll(() => {
//     jest.clearAllMocks();
//   });

//   test("should create an account if it doesn't exist", async () => {
//     prismaMock.account.findUnique.mockResolvedValue(null);
//     prismaMock.account.create.mockResolvedValue({
//       id: "1",
//       ethAddress: validData.ethAddress,
//       createdAt: new Date(),
//     });
//     prismaMock.listing.create.mockResolvedValue({} as Listing);
//     const res = await request(server).post("/listings").send(validData);

//     expect(prismaMock.account.create).toBeCalledTimes(1);
//     expect(res.status).toBe(201);
//   });

//   test("should fail to create a listing with invalid data", async () => {
//     const invalidAddress = {
//       ethAddress: "0xnotAValidAddress",
//       ethPrice: "0.5",
//       inscriptionId: "",
//     };

//     const res = await request(server).post("/listings").send(invalidAddress);

//     expect(res.status).toBe(400);

//     const invalidPrice = {
//       ethAddress: getRandomEthereumAddress(),
//       ethPrice: 1000000,
//       inscriptionId: getRandomEthereumAddress(),
//     };

//     const res2 = await request(server).post("/listings").send(invalidPrice);

//     expect(res2.status).toBe(400);

//     const invalidInscriptionId = {
//       ethAddress: getRandomEthereumAddress(),
//       ethPrice: "0.5",
//       inscriptionId: 79679967976,
//     };

//     const res3 = await request(server)
//       .post("/listings")
//       .send(invalidInscriptionId);

//     expect(res3.status).toBe(400);
//   });

//   test("should fail to create a listing with missing data", async () => {
//     const missingData = {
//       ethPrice: "0.5",
//     };

//     const res = await request(server).post("/listings").send(missingData);

//     expect(res.status).toBe(400);

//     const missingData2 = {
//       ethAddress: getRandomEthereumAddress(),
//       inscriptionId: getRandomEthereumAddress(),
//     };

//     const res2 = await request(server).post("/listings").send(missingData2);

//     expect(res2.status).toBe(400);

//     const missingData3 = {
//       ethAddress: getRandomEthereumAddress(),
//       ethPrice: "0.5",
//     };

//     const res3 = await request(server).post("/listings").send(missingData3);

//     expect(res3.status).toBe(400);
//   });

//   test("should create a new listing with valid data", async () => {
//     const account = {
//       id: "1",
//       ethAddress: getRandomEthereumAddress(),
//       createdAt: new Date(),
//     };

//     // mock the prisma.account.findUnique() method
//     prismaMock.account.findUnique.mockResolvedValue(account);
//     // mock the prisma.listing.create() method
//     prismaMock.listing.create.mockResolvedValue({
//       ethPrice: validData.ethPrice,
//       listingAccountId: account.id,
//       inscriptionId: validData.inscriptionId,
//     } as Listing);

//     const res = await request(server).post("/listings").send(validData);

//     expect(res.status).toBe(201);
//     expect(res.body).toMatchObject({
//       ethPrice: validData.ethPrice,
//       inscriptionId: validData.inscriptionId,
//       listingAccountId: account.id,
//     });
//   });
// });

// describe("GET /listings", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("Should return all listings when no query parameters are provided", async () => {
//     const mockListings = [
//       {
//         id: "1",
//         inscriptionId: "inscriptionId-1",
//         // ... other properties
//       },
//       {
//         id: "2",
//         inscriptionId: "inscriptionId-2",
//         // ... other properties
//       },
//     ];

//     prismaMock.listing.findMany.mockResolvedValue(mockListings as Listing[]);

//     const res = await request(server).get("/listings");

//     expect(res.status).toBe(200);
//     expect(res.body).toEqual(mockListings);
//     expect(prismaMock.listing.findMany).toHaveBeenCalledTimes(1);
//     expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
//       where: {
//         cancelledDate: null,
//         sellDate: null,
//       },
//     });
//   });

//   test("Should return listings filtered by address", async () => {
//     const address = "0x1234567890123456789012345678901234567890";
//     const filteredMockListings = [
//       {
//         id: "2",
//         inscriptionId: "inscriptionId-2",
//       },
//     ];

//     prismaMock.listing.findMany.mockResolvedValue(
//       filteredMockListings as Listing[]
//     );

//     const res = await request(server).get(`/listings?address=${address}`);

//     expect(res.status).toBe(200);
//     expect(res.body).toEqual(filteredMockListings);
//     expect(prismaMock.listing.findMany).toHaveBeenCalledTimes(1);
//   });

//   test("Should return a listing by id", async () => {
//     const id = "1";
//     const mockListingArr = [
//       {
//         id: "1",
//         inscriptionId: "inscriptionId-1",
//         // ... other properties
//       },
//     ];

//     prismaMock.listing.findMany.mockResolvedValue(mockListingArr as Listing[]);

//     const res = await request(server).get(`/listings?id=${id}`);

//     expect(res.status).toBe(200);
//     expect(res.body).toEqual(mockListingArr);
//     expect(prismaMock.listing.findMany).toHaveBeenCalledTimes(1);
//   });
//   test("Should return 500 when an error occurs", async () => {
//     prismaMock.listing.findMany.mockRejectedValue(new Error("Database error"));

//     const res = await request(server).get("/listings");

//     expect(res.status).toBe(500);
//     expect(res.body).toHaveProperty("error");
//     expect(res.body.error).toBe("Database error");
//     expect(prismaMock.listing.findMany).toHaveBeenCalledTimes(1);
//   });
// });

// describe("PUT /listings/:listingId", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should cancel a listing when signature is provided", async () => {
//     const listingId = "some-listing-id";
//     const signature = "some-signature";
//     const mockListing = {
//       id: listingId,
//       cancelledDate: null,
//       sellDate: null,
//     } as Listing;

//     prismaMock.listing.update.mockResolvedValue({
//       ...mockListing,
//       cancelledDate: new Date(),
//     });

//     prismaMock.listing.findUnique.mockResolvedValue(mockListing);

//     const response = await request(server)
//       .put(`/listings/${listingId}`)
//       .send({ signature });

//     expect(response.status).toBe(200);
//     expect(response.body.cancelledDate).not.toBeNull();
//     expect(prismaMock.listing.update).toHaveBeenCalledWith({
//       where: { id: listingId },
//       data: { cancelledDate: expect.any(Date) },
//     });
//   });

//   test("should mark a listing as sold when no signature is provided", async () => {
//     const listingId = "some-listing-id";
//     const mockListing = {
//       id: listingId,
//       cancelledDate: null,
//       sellDate: null,
//     } as Listing;

//     prismaMock.listing.update.mockResolvedValue({
//       ...mockListing,
//       sellDate: new Date(),
//     });

//     prismaMock.listing.findUnique.mockResolvedValue(mockListing);

//     const response = await request(server)
//       .put(`/listings/${listingId}`)
//       .send({});

//     expect(response.status).toBe(200);
//     expect(response.body.sellDate).not.toBeNull();
//     expect(prismaMock.listing.update).toHaveBeenCalledWith({
//       where: { id: listingId },
//       data: { sellDate: expect.any(Date) },
//     });
//   });

//   test("should return a 500 error when an error occurs during update", async () => {
//     const listingId = "some-listing-id";

//     prismaMock.listing.update.mockRejectedValue(new Error("Some error"));

//     const response = await request(server)
//       .put(`/listings/${listingId}`)
//       .send({});

//     expect(response.status).toBe(500);
//     expect(response.body).toEqual({ error: "Some error" });
//   });
// });
