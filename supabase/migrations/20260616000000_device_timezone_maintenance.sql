-- =============================================================================
-- Migration: device_timezone_maintenance
-- Adds timezone and maintenance_window columns to signage_devices.
-- =============================================================================

ALTER TABLE signage_devices
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS maintenance_window JSONB NOT NULL DEFAULT '{"hour": 2, "minute": 0, "dayOfWeek": null}'::jsonb;
