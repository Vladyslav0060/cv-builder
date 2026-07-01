-- Enable row-level security for user-owned and authentication-sensitive tables.
-- Policies use the request-scoped user id set by PrismaService.forUser:
--   SELECT set_config('app.current_user_id', <user_id>, true)
-- Trusted server-only workflows that cannot start from a user id use:
--   SELECT set_config('app.bypass_rls', 'on', true)

ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resume" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Credential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OAuthAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document_user_owns_row"
ON "Document"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
);

CREATE POLICY "Resume_user_owns_document"
ON "Resume"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR
    EXISTS (
        SELECT 1
        FROM "Document"
        WHERE "Document"."id" = "Resume"."documentId"
          AND "Document"."userId" = current_setting('app.current_user_id', true)
    )
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR
    EXISTS (
        SELECT 1
        FROM "Document"
        WHERE "Document"."id" = "Resume"."documentId"
          AND "Document"."userId" = current_setting('app.current_user_id', true)
    )
);

CREATE POLICY "User_owns_self"
ON "User"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "id" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "id" = current_setting('app.current_user_id', true)
);

CREATE POLICY "Credential_user_owns_row"
ON "Credential"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
);

CREATE POLICY "Session_user_owns_row"
ON "Session"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
);

CREATE POLICY "OAuthAccount_user_owns_row"
ON "OAuthAccount"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
);

CREATE POLICY "Subscription_user_owns_row"
ON "Subscription"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "userId" = current_setting('app.current_user_id', true)
);

CREATE POLICY "usage_records_user_owns_row"
ON "usage_records"
USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR "user_id" = current_setting('app.current_user_id', true)
)
WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR "user_id" = current_setting('app.current_user_id', true)
);
