-- Add location columns to store_settings
alter table public.store_settings 
add column if not exists store_lat numeric default -6.8722, -- Default to Cimahi/Bandung area
add column if not exists store_lng numeric default 107.5428,
add column if not exists price_per_km numeric default 2000;
