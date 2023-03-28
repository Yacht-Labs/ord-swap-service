-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
