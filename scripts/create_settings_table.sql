-- Create store_settings table
-- We use a singleton pattern where we enforce only one row exists
create table public.store_settings (
  id bool primary key default true,
  store_name text not null default 'Sentra Dimsum Cimahi',
  store_address text not null default 'Cimahi, Jawa Barat',
  store_phone text not null default '081234567890',
  shipping_cost numeric not null default 10000,
  constraint store_settings_singleton check (id)
);

-- Enable RLS
alter table public.store_settings enable row level security;

-- Allow read access to everyone (needed for Cart to see shipping cost)
create policy "Enable read access for all users" on public.store_settings for select using (true);

-- Allow update access only to authenticated users (admin)
-- Ideally restrict to specific admin role, but for now authenticated is fine as we only have admin login
create policy "Enable update for authenticated users only" on public.store_settings for update using (auth.role() = 'authenticated');

-- Insert default row
insert into public.store_settings (id) values (true) on conflict (id) do nothing;
