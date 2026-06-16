-- =============================================================================
-- Migration: device_maintenance
-- Alters signage_devices to add timezone and maintenance_window columns.
-- =============================================================================

ALTER TABLE signage_devices
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS maintenance_window JSONB NOT NULL DEFAULT '{"hour": 3, "minute": 0, "day_of_week": "*"}'::jsonb;
