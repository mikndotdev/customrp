-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Playing', 'Streaming', 'Listening', 'Watching', 'Custom', 'Competing');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('desktop', 'ios', 'android');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "platform" "Platform",
    "type" "ActivityType",
    "details" TEXT,
    "state" TEXT,
    "largeImage" TEXT,
    "smallImage" TEXT,
    "smallText" TEXT,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "User"("refreshToken");
