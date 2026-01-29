-- Enable RLS on products table if not already enabled
alter table public.products enable row level security;

-- Allow read access to everyone
create policy "Enable read access for all users" on public.products for select using (true);

-- Allow insert access to everyone (since we use anon key for admin for now)
-- In a real app, you'd restrict this to authenticated users or specific roles
create policy "Enable insert for all users" on public.products for insert with check (true);

-- Allow update access to everyone
create policy "Enable update for all users" on public.products for update using (true);

-- Allow delete access to everyone
create policy "Enable delete for all users" on public.products for delete using (true);
