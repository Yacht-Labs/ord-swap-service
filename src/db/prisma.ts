// eslint-disable-next-line import/no-extraneous-dependencies
import { PrismaClient } from "@prisma/client";
import { DatabaseError } from "../types/errors";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const { model, action } = params;
  const startTime = Date.now();
  try {
    const result = await next(params);
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.info(`Prisma query: ${model}.${action}`, {
      model,
      action,
      duration,
    });
    return result;
  } catch (error) {
    logger.error(`Prisma query error: ${model}.${action}`, {
      model,
      action,
      error,
    });
    throw new DatabaseError((error as Error).message);
  }
});

export default prisma;
