
ALTER TABLE "app_auth"."user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "guest_can_register" ON "app_auth"."user" AS PERMISSIVE FOR INSERT TO "app_guest" WITH CHECK ("app_auth"."user"."role" = 'user' AND "app_auth"."user"."token_version" = 0);--> statement-breakpoint
CREATE POLICY "guest_can_login" ON "app_auth"."user" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), '') OR 
                          "app_auth"."user"."email" = NULLIF(current_setting('app.login_identifier', true), ''));--> statement-breakpoint
CREATE POLICY "guest_can_refresh" ON "app_auth"."user" AS PERMISSIVE FOR UPDATE TO "app_guest" USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), '') OR
                          "app_auth"."user"."email" = NULLIF(current_setting('app.login_identifier', true), '')) WITH CHECK ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                              "app_auth"."user"."username" = NULLIF(current_setting('app.login_identifier', true), '') OR
                              "app_auth"."user"."email" = NULLIF(current_setting('app.login_identifier', true), ''));--> statement-breakpoint
CREATE POLICY "authenticated_can_select_own_user" ON "app_auth"."user" AS PERMISSIVE FOR SELECT TO "app_authenticated" USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "authenticated_can_update_own_user" ON "app_auth"."user" AS PERMISSIVE FOR UPDATE TO "app_authenticated" USING ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("app_auth"."user"."id" = NULLIF(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "authenticated_can_delete_own_user" ON "app_auth"."user" AS PERMISSIVE FOR DELETE TO "app_authenticated" USING ("app_auth"."user"."id" =NULLIF(current_setting('app.user_id', true), '')::uuid);
