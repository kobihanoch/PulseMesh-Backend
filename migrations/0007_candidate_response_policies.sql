CREATE POLICY "guest_can_read_incident_candidates" ON "registry"."incident_candidate" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("registry"."incident_candidate"."status" IN ('notified', 'accepted', 'declined'));--> statement-breakpoint
CREATE POLICY "guest_can_respond_to_incident_candidates" ON "registry"."incident_candidate" AS PERMISSIVE FOR UPDATE TO "app_guest" USING ("registry"."incident_candidate"."status" = 'notified') WITH CHECK ("registry"."incident_candidate"."status" IN ('accepted', 'declined'));--> statement-breakpoint
CREATE POLICY "guest_can_read_active_incidents" ON "registry"."incident" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("registry"."incident"."status" = 'active');
--> statement-breakpoint
GRANT SELECT ON "registry"."incident", "registry"."incident_candidate" TO "app_guest";
--> statement-breakpoint
GRANT UPDATE (status, responded_at) ON "registry"."incident_candidate" TO "app_guest";
