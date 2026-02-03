-- Fix: Restrict orders table policies to authenticated users only
-- This prevents anonymous role from accessing orders table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Recreate policies with explicit authenticated role restriction
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);