import request from "supertest";
import { prismaMock } from "../../../db/prisma.singleton";
import { getRandomEthereumAddress } from "../../util/eth";
import { startServer } from "../../server"; // Import your server start function
// Import your prisma instance
let server: any;

beforeAll(async () => {
  server = await startServer(0);
});

afterAll(async () => {
  server.close();
});

describe("POST /listings", () => {
  test("should create a new listing with valid data", async () => {
    // mock an Account from prisma
    const account = {
      id: "1",
      ethAddress: getRandomEthereumAddress(),
      createdAt: new Date(),
    };

    // mock the prisma.account.findUnique() method
    prismaMock.account.findUnique.mockResolvedValue(account);

    const validData = {
      ethAddress: getRandomEthereumAddress(),
      ethPrice: Math.floor(Math.random() * 1000000 + 1).toString(),
      inscriptionId: Math.floor(Math.random() * 1000000 + 1).toString(),
    };

    const res = await request(server).post("/listings").send(validData);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(validData);
  });

  xtest("should fail to create a listing with invalid data", async () => {
    const invalidData = {
      ethAddress: "0xnotAValidAddress",
      ethPrice: "0.5",
      inscriptionId: "",
    };

    const res = await request(server)
      .post("/listings/create")
      .send(invalidData);

    expect(res.status).toBe(400);
  });

  xtest("should fail to create a listing with missing data", async () => {
    const missingData = {
      ethPrice: "0.5",
    };

    const res = await request(server)
      .post("/listings/create")
      .send(missingData);

    expect(res.status).toBe(400);
  });
});
