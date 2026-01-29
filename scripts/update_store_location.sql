-- 1. Alter table to add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_lat') THEN
        ALTER TABLE public.store_settings ADD COLUMN store_lat numeric DEFAULT -6.8925;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_lng') THEN
        ALTER TABLE public.store_settings ADD COLUMN store_lng numeric DEFAULT 107.5544;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'price_per_km') THEN
        ALTER TABLE public.store_settings ADD COLUMN price_per_km numeric DEFAULT 2500;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE public.store_settings ADD COLUMN updated_at timestamptz DEFAULT NOW();
    END IF;
END $$;

-- 2. Update the existing singleton row (id = true)
INSERT INTO public.store_settings (id, store_name, store_address, store_lat, store_lng, price_per_km, shipping_cost)
VALUES (
    true, 
    'Sentra Dimsum Cimahi', 
    'Jl. Cibaligo Cluster Pintu Air Kavling No. 03, Cigugur Tengah, Cimahi', 
    -6.8925, 
    107.5544, 
    2500,
    10000
)
ON CONFLICT (id) DO UPDATE 
SET 
    store_address = EXCLUDED.store_address,
    store_lat = EXCLUDED.store_lat,
    store_lng = EXCLUDED.store_lng,
    price_per_km = EXCLUDED.price_per_km,
    updated_at = NOW();
