-- Migration: Backfill metadata.merchantId for SQUARE integration rows
-- that are missing it.
--
-- Background:
-- The handleSquareCallback OAuth flow previously stored only `connectedAs`
-- inside `metadata` and did NOT populate `metadata.merchantId`. The webhook
-- controller relies on `metadata->>'merchantId'` to look up the integration,
-- so any row created before this field was added is effectively invisible to
-- incoming webhooks.
--
-- This migration attempts to recover the merchantId from `connectedAs` when
-- it follows the pattern "Square Merchant <ID>" (the old default display name).
-- Rows with a real business name in connectedAs (no extractable merchant ID)
-- are left unchanged and must be fixed by re-running the OAuth flow or using
-- the repair script at scripts/repair-square-merchant-ids.ts.

UPDATE integrations
SET metadata = jsonb_set(
  metadata,
  '{merchantId}',
  to_jsonb(
    regexp_replace(
      metadata->>'connectedAs',
      '^Square Merchant (.+)$',
      '\1'
    )
  ),
  true
)
WHERE
  provider = 'SQUARE'
  AND (metadata->>'merchantId') IS NULL
  AND metadata->>'connectedAs' ~ '^Square Merchant .+$';
