-- Create audit_logs table
create table public.audit_logs (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users(id),
  user_email text,
  action text not null,
  details jsonb,
  ip_address text,
  constraint audit_logs_pkey primary key (id)
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Allow inserts from authenticated users (for their own actions) and anon (for login attempts if needed, but usually we log after auth)
-- Actually, for simplicity and security, we might want to use a service role for logging to ensure integrity, 
-- OR allow authenticated users to insert their own logs.
-- Let's allow public insert for now to catch login attempts, but in production restrict this.
create policy "Enable insert for everyone" on public.audit_logs for insert with check (true);

-- Allow select only for admins (we'll use service role in API to bypass this, so no policy needed for select if we don't expose it to client)
-- But if we want to be safe:
create policy "Enable select for service role only" on public.audit_logs for select using (false);
