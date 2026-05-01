-- CreateTable
CREATE TABLE "ai_request_usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_request_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_request_usages_day_idx" ON "ai_request_usages"("day");

-- CreateIndex
CREATE UNIQUE INDEX "ai_request_usages_user_id_day_key" ON "ai_request_usages"("user_id", "day");

-- AddForeignKey
ALTER TABLE "ai_request_usages"
ADD CONSTRAINT "ai_request_usages_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
