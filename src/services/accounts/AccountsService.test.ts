import { Account } from "@prisma/client";
import { prismaMock } from "../../db/prisma.singleton";
import { getAccount } from "./AccountsService";
import { NotFoundError, DatabaseError } from "../../types/errors";
import { generateStubAccount } from "../../utils/stubs";

describe("getAccount", () => {
  let account: Account;
  beforeEach(() => {
    account = generateStubAccount();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the account when it exists", async () => {
    prismaMock.account.findUnique.mockResolvedValue(account);

    const result = await getAccount(account.ethAddress);

    expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
      where: { ethAddress: account.ethAddress },
    });
    expect(result).toEqual(account);
  });

  it("should throw NotFoundError when the account doesn't exist", async () => {
    prismaMock.account.findUnique.mockResolvedValue(null);
    await expect(getAccount(account.ethAddress)).rejects.toThrow(NotFoundError);
    expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
      where: { ethAddress: account.ethAddress },
    });
  });

  it("should throw DatabaseError when there's a database error", async () => {
    prismaMock.account.findUnique.mockRejectedValue(
      new Error("Database error")
    );

    await expect(getAccount(account.ethAddress)).rejects.toThrow(DatabaseError);
    expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
      where: { ethAddress: account.ethAddress },
    });
  });
});
