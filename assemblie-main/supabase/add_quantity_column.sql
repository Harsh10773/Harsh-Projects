
-- Add quantity column to vendor_component_quotations_history if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vendor_component_quotations_history' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.vendor_component_quotations_history
        ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Update the foreign key constraint to be deferrable if it isn't already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'vendor_component_quotations_history_order_item_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.vendor_component_quotations_history
        DROP CONSTRAINT vendor_component_quotations_history_order_item_id_fkey;
    END IF;
    
    -- Create a softer foreign key constraint that allows NULL values
    ALTER TABLE public.vendor_component_quotations_history
    ADD CONSTRAINT vendor_component_quotations_history_order_item_id_fkey
    FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY DEFERRED;
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error modifying foreign key: %', SQLERRM;
END $$;
