CREATE TYPE "registry"."incident_candidate_status" AS ENUM('selected', 'notified', 'accepted', 'declined', 'failed');--> statement-breakpoint
CREATE TYPE "registry"."incident_source" AS ENUM('app', 'emergency_center', 'simulator');--> statement-breakpoint
CREATE TYPE "registry"."incident_status" AS ENUM('active', 'resolved', 'cancelled');--> statement-breakpoint
CREATE TABLE "registry"."incident_candidate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"lora_device_id" uuid NOT NULL,
	"distance_meters" integer NOT NULL,
	"status" "registry"."incident_candidate_status" DEFAULT 'selected' NOT NULL,
	"notified_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "registry"."incident" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "registry"."incident_source" DEFAULT 'simulator' NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"radius_meters" integer DEFAULT 5000 NOT NULL,
	"status" "registry"."incident_status" DEFAULT 'active' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "incident_latitude_range" CHECK ("registry"."incident"."latitude" BETWEEN -90 AND 90),
	CONSTRAINT "incident_longitude_range" CHECK ("registry"."incident"."longitude" BETWEEN -180 AND 180),
	CONSTRAINT "incident_radius_positive" CHECK ("registry"."incident"."radius_meters" > 0),
	CONSTRAINT "incident_closed_at_matches_status" CHECK (("registry"."incident"."status" = 'active' AND "registry"."incident"."closed_at" IS NULL) OR ("registry"."incident"."status" <> 'active' AND "registry"."incident"."closed_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "registry"."incident" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ADD CONSTRAINT "incident_candidate_incident_id_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "registry"."incident"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registry"."incident_candidate" ADD CONSTRAINT "incident_candidate_lora_device_id_lora_device_id_fk" FOREIGN KEY ("lora_device_id") REFERENCES "registry"."lora_device"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "incident_candidate_incident_device_unique" ON "registry"."incident_candidate" USING btree ("incident_id","lora_device_id");--> statement-breakpoint
CREATE INDEX "incident_candidate_incident_id_idx" ON "registry"."incident_candidate" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "incident_candidate_lora_device_id_idx" ON "registry"."incident_candidate" USING btree ("lora_device_id");--> statement-breakpoint
CREATE POLICY "admin_can_manage_incident_candidates" ON "registry"."incident_candidate" AS PERMISSIVE FOR ALL TO "app_authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "guest_can_create_incident" ON "registry"."incident" AS PERMISSIVE FOR INSERT TO "app_guest" WITH CHECK ("registry"."incident"."status" = 'active' AND "registry"."incident"."closed_at" IS NULL);--> statement-breakpoint
CREATE POLICY "admin_can_manage_incidents" ON "registry"."incident" AS PERMISSIVE FOR ALL TO "app_authenticated" USING (true) WITH CHECK (true);

-- Allow runtime roles to resolve objects in the registry schema.
GRANT USAGE ON SCHEMA registry
TO app_guest, app_authenticated;

-- Public users may only submit the initial incident information.
-- Status and timestamps must use their database defaults.
GRANT INSERT (
  source,
  latitude,
  longitude,
  radius_meters,
  description
)
ON registry.incident
TO app_guest;

-- Required because the public registration may provide incident.source.
GRANT USAGE ON TYPE registry.incident_source
TO app_guest;

-- Admins manage incidents and selected candidates.
GRANT SELECT, INSERT, UPDATE, DELETE
ON registry.incident, registry.incident_candidate
TO app_authenticated;

-- Admins may read and assign all incident-related enum values.
GRANT USAGE ON TYPE
  registry.incident_source,
  registry.incident_status,
  registry.incident_candidate_status
TO app_authenticated;