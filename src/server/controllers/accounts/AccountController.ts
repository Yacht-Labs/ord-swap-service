import { PrismaClient } from "@prisma/client";
import prisma from "../../../db/prisma";
import { DatabaseError } from "../../../types/errors";

export class AccountController {
  prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }

  async getOrCreateAccount(ethAddress: string) {
    try {
      let account = await this.prisma.account.findUnique({
        where: { ethAddress },
      });

      if (!account) {
        account = await this.prisma.account.create({
          data: {
            ethAddress,
          },
        });
      }

      return account;
    } catch (error) {
      throw error;
    }
  }
}
