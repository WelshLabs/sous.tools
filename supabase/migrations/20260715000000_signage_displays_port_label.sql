-- ============================================================================
-- 20260715000000_signage_displays_port_label.sql
-- Enforces physical port label constraints for dual-HDMI kiosk routing
-- ============================================================================

-- 1. Ensure port_label exists and is indexed (schema init usually has it,
--    but we want to strictly enforce the unique constraint per-device).
CREATE INDEX IF NOT EXISTS idx_signage_displays_port_label ON signage_displays(port_label);

-- 2. Prevent two displays from being assigned to the same physical port on the same device
ALTER TABLE signage_displays
  ADD CONSTRAINT uq_signage_displays_device_port
  UNIQUE NULLS NOT DISTINCT (device_id, port_label);

-- 3. Add a check constraint to restrict port_label to known Pi 5 physical ports
--    (HDMI-A-1 and HDMI-A-2 are the standard Wayland output names)
ALTER TABLE signage_displays
  ADD CONSTRAINT chk_signage_displays_valid_ports
  CHECK (port_label IN ('HDMI-A-1', 'HDMI-A-2', 'VIRTUAL', null));
