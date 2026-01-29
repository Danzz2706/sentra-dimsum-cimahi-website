-- Create orders table
create table public.orders (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total_price numeric not null,
  items jsonb not null,
  status text not null default 'pending'::text,
  constraint orders_pkey primary key (id)
);

-- Enable RLS (Optional, but good practice. For now we might skip policies for simplicity or allow public insert)
alter table public.orders enable row level security;

-- Allow anyone to insert orders (for public checkout)
create policy "Enable insert for everyone" on public.orders as permissive for insert to public with check (true);

-- Allow anyone to read their own orders? Or just public for now?
-- For Admin, we need to read all.
-- Since we are using the anon key for everything, we might need to allow select for everyone OR use a service role key for admin.
-- For simplicity in this prototype, allow select for everyone.
create policy "Enable select for everyone" on public.orders as permissive for select to public using (true);

-- Allow update for everyone (to change status)
create policy "Enable update for everyone" on public.orders as permissive for update to public using (true);
