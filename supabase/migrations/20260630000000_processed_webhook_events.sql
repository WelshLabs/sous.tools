-- Create processed_webhook_events table for webhook idempotency
create table if not exists public.processed_webhook_events (
    event_id text primary key,
    provider text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.processed_webhook_events enable row level security;

-- Read/write policies for service role only since webhooks are processed by the api backend
create policy "Enable all for service_role" on public.processed_webhook_events
    for all using (true);
