-- AlterTable
ALTER TABLE "Credential" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Credential" ADD COLUMN "verifyToken" TEXT;
ALTER TABLE "Credential" ADD COLUMN "verifyTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Credential" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Credential" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_verifyToken_key" ON "Credential"("verifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_resetToken_key" ON "Credential"("resetToken");
