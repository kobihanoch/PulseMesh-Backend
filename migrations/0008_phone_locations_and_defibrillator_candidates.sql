ALTER TABLE "registry"."incident_candidate" DROP CONSTRAINT "incident_candidate_lora_device_id_lora_device_id_fk";
--> statement-breakpoint
DROP INDEX "registry"."incident_candidate_incident_device_unique";--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ALTER COLUMN "lora_device_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ADD COLUMN "defibrillator_id" uuid;--> statement-breakpoint
UPDATE "registry"."incident_candidate" candidate
SET "defibrillator_id" = device."defibrillator_id"
FROM "registry"."lora_device" device
WHERE device."id" = candidate."lora_device_id";--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ALTER COLUMN "defibrillator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "registry"."registrant" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "registry"."registrant" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "registry"."registrant" ADD COLUMN "last_location_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ADD CONSTRAINT "incident_candidate_defibrillator_id_defibrillator_id_fk" FOREIGN KEY ("defibrillator_id") REFERENCES "registry"."defibrillator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ADD CONSTRAINT "incident_candidate_lora_device_id_lora_device_id_fk" FOREIGN KEY ("lora_device_id") REFERENCES "registry"."lora_device"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "incident_candidate_incident_defibrillator_unique" ON "registry"."incident_candidate" USING btree ("incident_id","defibrillator_id");--> statement-breakpoint
CREATE INDEX "incident_candidate_defibrillator_id_idx" ON "registry"."incident_candidate" USING btree ("defibrillator_id");--> statement-breakpoint
CREATE POLICY "guest_can_update_registrant_location" ON "registry"."registrant" AS PERMISSIVE FOR UPDATE TO "app_guest" USING (true) WITH CHECK ("registry"."registrant"."latitude" IS NOT NULL AND "registry"."registrant"."longitude" IS NOT NULL);--> statement-breakpoint
CREATE POLICY "guest_can_read_located_registrants" ON "registry"."registrant" AS PERMISSIVE FOR SELECT TO "app_guest" USING ("registry"."registrant"."latitude" IS NOT NULL AND "registry"."registrant"."longitude" IS NOT NULL);
--> statement-breakpoint
GRANT SELECT ON "registry"."registrant" TO "app_guest";
--> statement-breakpoint
GRANT UPDATE (latitude, longitude, last_location_at, updated_at) ON "registry"."registrant" TO "app_guest";
