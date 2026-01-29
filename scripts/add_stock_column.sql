-- Add stock column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 100;

-- Update existing rows to have default stock if needed (though default handles it for new rows)
UPDATE public.products SET stock = 100 WHERE stock IS NULL;
