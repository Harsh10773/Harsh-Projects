
CREATE OR REPLACE FUNCTION public.create_tracking_files_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the tracking_files table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.tracking_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    file_type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  
  -- Add a trigger for updated_at
  DROP TRIGGER IF EXISTS set_tracking_files_updated_at ON public.tracking_files;
  CREATE TRIGGER set_tracking_files_updated_at
  BEFORE UPDATE ON public.tracking_files
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
  
  -- Ensure the set_updated_at function exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;
  END IF;
END;
$$;
