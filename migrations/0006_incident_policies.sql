CREATE POLICY "guest_can_read_working_defibrillators" ON "registry"."defibrillator" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("registry"."defibrillator"."status" = 'working');--> statement-breakpoint
CREATE POLICY "guest_can_create_incident_candidates" ON "registry"."incident_candidate" AS PERMISSIVE FOR INSERT TO "app_guest" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "guest_can_read_eligible_lora_devices" ON "registry"."lora_device" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("registry"."lora_device"."status" = 'active' AND "registry"."lora_device"."latitude" IS NOT NULL AND "registry"."lora_device"."longitude" IS NOT NULL);
--> statement-breakpoint
GRANT SELECT ON "registry"."lora_device", "registry"."defibrillator" TO "app_guest";
--> statement-breakpoint
GRANT INSERT ON "registry"."incident_candidate" TO "app_guest";
--> statement-breakpoint
GRANT INSERT (id, status, created_at) ON "registry"."incident" TO "app_guest";
