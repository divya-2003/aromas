
-- Add ready_at timestamp to track when order became ready
ALTER TABLE public.orders ADD COLUMN ready_at timestamp with time zone;

-- Add feedback columns
ALTER TABLE public.orders ADD COLUMN feedback_rating integer;
ALTER TABLE public.orders ADD COLUMN feedback_comment text;

-- Allow users to update their own orders (only feedback fields via RLS + trigger)
CREATE POLICY "Users can update own order feedback"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger to only allow updating feedback fields
CREATE OR REPLACE FUNCTION public.restrict_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow feedback_rating and feedback_comment to be changed
  IF OLD.status IS DISTINCT FROM NEW.status
     OR OLD.items IS DISTINCT FROM NEW.items
     OR OLD.total_amount IS DISTINCT FROM NEW.total_amount
     OR OLD.special_instructions IS DISTINCT FROM NEW.special_instructions
     OR OLD.estimated_ready_time IS DISTINCT FROM NEW.estimated_ready_time
     OR OLD.ready_at IS DISTINCT FROM NEW.ready_at
     OR OLD.user_id IS DISTINCT FROM NEW.user_id
  THEN
    RAISE EXCEPTION 'Only feedback fields can be updated by users';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_feedback_only_update
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.restrict_order_update();
