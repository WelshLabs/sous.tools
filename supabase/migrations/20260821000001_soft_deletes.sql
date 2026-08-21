-- Add deleted_at globally to the primary tables
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE pos_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE displays ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE display_layouts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE square_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE square_line_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add version column for Optimistic Concurrency Control (OCC)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pos_items ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Create indexes for performance on deleted_at
CREATE INDEX IF NOT EXISTS idx_recipes_deleted_at ON recipes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_pos_items_deleted_at ON pos_items(deleted_at);
