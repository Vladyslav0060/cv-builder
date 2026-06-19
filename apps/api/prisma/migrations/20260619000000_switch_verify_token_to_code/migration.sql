-- Drop the unique index on verifyToken before renaming
DROP INDEX IF EXISTS "Credential_verifyToken_key";

-- AlterTable: rename verifyToken -> verifyCode and verifyTokenExpiresAt -> verifyCodeExpiresAt
ALTER TABLE "Credential" RENAME COLUMN "verifyToken" TO "verifyCode";
ALTER TABLE "Credential" RENAME COLUMN "verifyTokenExpiresAt" TO "verifyCodeExpiresAt";
