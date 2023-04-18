import { NotFoundError, DatabaseError } from "../../types/errors";
import prisma from "../../db/prisma";
import { Account } from "@prisma/client";

export async function createAccount(ethAddress: string) {
  const existingAccount = await prisma.account.findFirst({
    where: {
      ethAddress,
    },
  });

  if (existingAccount) {
    throw new NotFoundError(
      "An account with this Ethereum address already exists."
    );
  }

  const account = await prisma.account.create({
    data: {
      ethAddress,
    },
  });

  return account;
}

export async function updateAccount(
  ethAddress: string,
  btcPayoutAddress: string
) {
  try {
    const account = await prisma.account.update({
      where: {
        ethAddress,
      },
      data: {
        btcPayoutAddress,
      },
    });
    return account;
  } catch (error) {
    throw new DatabaseError("Failed to update account.");
  }
}

export async function getAccount(ethAddress: string) {
  let account: Account | null;
  try {
    account = await prisma.account.findUnique({
      where: {
        ethAddress,
      },
    });
  } catch (err) {
    throw new DatabaseError(`Failed to get account: ${err}`);
  }
  if (!account) {
    throw new NotFoundError(
      `Account not found with ethAddress: ${ethAddress}}`
    );
  }

  return account;
}
