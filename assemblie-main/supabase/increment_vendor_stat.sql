
-- Function to increment a field in the vendor_stats table
CREATE OR REPLACE FUNCTION public.increment_vendor_stat(
  vendor_id_param UUID,
  field_name TEXT,
  increment_by INTEGER DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the vendor stats record exists
  DECLARE
    stats_exists BOOLEAN;
  BEGIN
    SELECT EXISTS(
      SELECT 1 FROM vendor_stats WHERE vendor_id = vendor_id_param
    ) INTO stats_exists;
    
    -- If stats record doesn't exist, create it
    IF NOT stats_exists THEN
      IF field_name = 'orders_won' THEN
        INSERT INTO vendor_stats (vendor_id, orders_won, orders_lost)
        VALUES (vendor_id_param, increment_by, 0);
      ELSIF field_name = 'orders_lost' THEN
        INSERT INTO vendor_stats (vendor_id, orders_won, orders_lost)
        VALUES (vendor_id_param, 0, increment_by);
      END IF;
    ELSE
      -- Update the appropriate field
      IF field_name = 'orders_won' THEN
        UPDATE vendor_stats
        SET orders_won = orders_won + increment_by,
            updated_at = now()
        WHERE vendor_id = vendor_id_param;
      ELSIF field_name = 'orders_lost' THEN
        UPDATE vendor_stats
        SET orders_lost = orders_lost + increment_by,
            updated_at = now()
        WHERE vendor_id = vendor_id_param;
      END IF;
    END IF;
  END;
END;
$$;
