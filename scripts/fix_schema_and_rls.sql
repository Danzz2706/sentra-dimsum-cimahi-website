-- 1. Add stock column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE public.products ADD COLUMN stock integer NOT NULL DEFAULT 100;
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.products;

-- 4. Create permissive policies (since we use anon key for Admin)
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.products FOR DELETE USING (true);

-- 5. Ensure orders table also has policies (just in case)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.orders;
DROP POLICY IF EXISTS "Enable update for everyone" ON public.orders;

CREATE POLICY "Enable insert for everyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable update for everyone" ON public.orders FOR UPDATE USING (true);
