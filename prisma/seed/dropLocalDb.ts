import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.listing.deleteMany({}).then(() => prisma.account.deleteMany({}));
