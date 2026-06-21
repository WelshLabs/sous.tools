-- Add design_tokens to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS design_tokens JSONB DEFAULT '{}'::jsonb;
