-- Create site_stats table to track dynamic statistics
CREATE TABLE public.site_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  user_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial row with starting count
INSERT INTO public.site_stats (id, user_count) VALUES ('global', 25000);

-- Enable RLS
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stats (public data)
CREATE POLICY "Anyone can view site stats"
ON public.site_stats
FOR SELECT
USING (true);

-- Only service role can update (through functions)
CREATE POLICY "Service role can update stats"
ON public.site_stats
FOR UPDATE
USING (false);

-- Create function to increment user count (called on signup)
CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_stats 
  SET user_count = user_count + 1, updated_at = now()
  WHERE id = 'global';
END;
$$;

-- Create function to decrement user count (called on delete)
CREATE OR REPLACE FUNCTION public.decrement_user_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_stats 
  SET user_count = GREATEST(user_count - 1, 0), updated_at = now()
  WHERE id = 'global';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_user_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_user_count() TO authenticated;