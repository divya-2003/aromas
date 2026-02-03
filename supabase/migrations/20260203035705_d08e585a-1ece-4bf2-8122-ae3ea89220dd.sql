-- Remove UPDATE and DELETE policies for orders table
-- Orders should be immutable once created (only staff should modify via admin interface)

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;