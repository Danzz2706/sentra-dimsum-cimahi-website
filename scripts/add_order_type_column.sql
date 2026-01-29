-- Add order_type column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'takeaway';

-- Update existing rows to have default order_type if needed
UPDATE public.orders SET order_type = 'takeaway' WHERE order_type IS NULL;
