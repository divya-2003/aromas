CREATE OR REPLACE FUNCTION public.restrict_order_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow cancellation within 5 minutes of placement if still in 'placed' status
  IF OLD.status = 'placed' AND NEW.status = 'cancelled'
     AND (now() - OLD.placed_at) <= interval '5 minutes'
  THEN
    RETURN NEW;
  END IF;

  -- Allow admin/restaurant status transitions (placed->preparing->ready->picked_up)
  IF OLD.status IS DISTINCT FROM NEW.status
     AND OLD.status IN ('placed', 'preparing', 'ready')
     AND NEW.status IN ('preparing', 'ready', 'picked_up')
  THEN
    RETURN NEW;
  END IF;

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
$function$;