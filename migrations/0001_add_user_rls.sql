ALTER SCHEMA "auth" RENAME TO "app_auth";


--> statement-breakpoint
CREATE ROLE "app_authenticated";--> statement-breakpoint
CREATE ROLE "app_guest";--> statement-breakpoint
ALTER TABLE "app_auth"."user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Allow access to the auth schema
GRANT USAGE ON SCHEMA app_auth TO app_authenticated;

-- Existing tables
GRANT SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app_auth TO app_authenticated;

-- Future tables created by the migration/database owner
ALTER DEFAULT PRIVILEGES IN SCHEMA app_auth GRANT SELECT, UPDATE, DELETE ON TABLES TO app_authenticated;

GRANT USAGE ON SCHEMA app_auth TO app_guest;

GRANT INSERT (
  username,
  email,
  password_hash,
  first_name,
  last_name
)
ON app_auth."user"
TO app_guest;

CREATE POLICY "user_access_own_row" ON "app_auth"."user" AS PERMISSIVE FOR ALL TO "app_authenticated" USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid);

