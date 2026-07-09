# Roadmap

## Active Priorities

1. Finalize the CLI Playwright/Gemini DB schema imports.
2. Wire NestJS API and BullMQ for invoice ingestion.
3. Wire NestJS WearOS endpoints.
4. Implement Quota Waterfall & Redis TTL for Gemini-to-Ollama fallbacks.

## AI Behavioral Roadmap

### Translating Kitchen Slang into Actions
The AI will translate slang to strict Tools. For example:
- "86 Mayo" -> `update_item_status(itemId, 'out_of_stock')`
- "We are in the weeds" -> `adjust_throttle_time(minutes)`
- "We have 3 gallons of mayo all day" -> `reconcile_inventory(itemId, quantity, unit)` (Absolute overwrite).

### Customizing Grittiness & Behavior Options
Tenant settings will have an "AI Behavior" section. 
The Persona Slider: You could have a dropdown for the AI's personality: Corporate, Casual, Line Cook (Gritty), or Gordon (R-Rated).
Behaviors are mapped via the `Tenant_AI_Rules` database table for configuring behaviors (e.g., "In the Weeds = +15 minutes").

## Future Work

All lower-priority ideas and exploratory work should be recorded in the backlog rather than the roadmap.
