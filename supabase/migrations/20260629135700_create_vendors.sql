create table if not exists public.vendors (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    order_days jsonb default '[]'::jsonb, -- array of strings e.g. ["Monday", "Thursday"]
    order_method text check (order_method in ('email', 'text')),
    email text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vendors enable row level security;

create policy "Enable read access for authenticated users" on public.vendors
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.vendors
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on public.vendors
    for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on public.vendors
    for delete using (auth.role() = 'authenticated');

-- Create helper function for updated_at if not exists
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_vendors_updated_at
    before update on public.vendors
    for each row
    execute function public.handle_updated_at();
