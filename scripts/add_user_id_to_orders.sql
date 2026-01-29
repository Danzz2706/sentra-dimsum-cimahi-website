-- Add user_id column to orders table
alter table public.orders 
add column user_id uuid references auth.users(id);

-- Update RLS policies to allow users to see their own orders
create policy "Enable select for users based on user_id" 
on public.orders for select 
using (auth.uid() = user_id);

-- Allow users to insert their own orders
create policy "Enable insert for authenticated users" 
on public.orders for insert 
with check (auth.uid() = user_id);
