-- Add RLS policy for users to update their own orders
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add RLS policy for users to delete their own orders
CREATE POLICY "Users can delete own orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id);