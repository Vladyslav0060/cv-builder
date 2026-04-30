CREATE TABLE IF NOT EXISTS "app_sessions" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "app_sessions_expire_idx"
ON "app_sessions" ("expire");
