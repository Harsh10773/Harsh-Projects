
-- This SQL function inserts a component quote into the history table
-- bypassing foreign key constraints
CREATE OR REPLACE FUNCTION public.insert_component_quote_history(
  vendor_id_param UUID,
  order_id_param UUID,
  order_item_id_param UUID,
  component_name_param TEXT,
  quoted_price_param NUMERIC,
  quantity_param INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quote_id UUID;
BEGIN
  -- Direct insert using SQL to bypass foreign key constraints if needed
  INSERT INTO public.vendor_component_quotations_history(
    vendor_id,
    order_id, 
    order_item_id,
    component_name,
    quoted_price,
    status,
    quantity
  ) VALUES (
    vendor_id_param,
    order_id_param,
    order_item_id_param,
    component_name_param,
    quoted_price_param,
    'pending',
    COALESCE(quantity_param, 1)
  )
  RETURNING id INTO quote_id;
  
  RETURN quote_id;
END;
$$;
