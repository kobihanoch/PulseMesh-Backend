ALTER TABLE "app_auth"."user" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
DROP POLICY "guest_can_register" ON "app_auth"."user" CASCADE;--> statement-breakpoint
REVOKE INSERT (username, email, password_hash, first_name, last_name) ON app_auth."user" FROM app_guest;--> statement-breakpoint
ALTER POLICY "guest_can_login" ON "app_auth"."user" TO app_guest USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), ''));--> statement-breakpoint
ALTER POLICY "guest_can_refresh" ON "app_auth"."user" TO app_guest USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), '')) WITH CHECK ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                              "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), ''));--> statement-breakpoint
ALTER TABLE "app_auth"."user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "app_auth"."user" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "app_auth"."user" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "app_auth"."user" DROP COLUMN "last_name";
