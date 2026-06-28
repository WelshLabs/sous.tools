-- Make organization_id nullable to allow unpaired devices to register a pairing code before being linked to a tenant
ALTER TABLE signage_devices ALTER COLUMN organization_id DROP NOT NULL;
