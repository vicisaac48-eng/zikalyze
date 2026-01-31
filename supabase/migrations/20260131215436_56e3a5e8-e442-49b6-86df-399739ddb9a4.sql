-- =====================================================
-- IP-BASED RATE LIMITING WITH 15-HOUR BLOCK
-- Blocks users who spam with different usernames from same IP
-- =====================================================

-- Create a table to track IP-based blocking for 15 hours
CREATE TABLE IF NOT EXISTS public.ip_blocks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unblock_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT DEFAULT 'Multiple username spam attempts',
    username_count INTEGER NOT NULL DEFAULT 0
);

-- Create an index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ip_blocks_ip ON public.ip_blocks (ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blocks_unblock ON public.ip_blocks (unblock_at);

-- Enable RLS
ALTER TABLE public.ip_blocks ENABLE ROW LEVEL SECURITY;

-- Block all direct access - only service role can access via functions
CREATE POLICY "No direct access to ip_blocks"
ON public.ip_blocks
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Update check_rate_limit function to include 15-hour IP blocking
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_email TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email_attempts INTEGER;
    v_ip_attempts INTEGER;
    v_unique_emails INTEGER;
    v_is_blocked BOOLEAN := false;
    v_retry_after INTEGER := 0;
    v_oldest_attempt TIMESTAMP WITH TIME ZONE;
    v_ip_block RECORD;
BEGIN
    -- First check if IP is in the 15-hour block list
    IF p_ip_address IS NOT NULL THEN
        SELECT * INTO v_ip_block
        FROM public.ip_blocks
        WHERE ip_address = p_ip_address
          AND unblock_at > now();
        
        IF FOUND THEN
            -- IP is blocked, calculate remaining time in seconds
            v_retry_after := EXTRACT(EPOCH FROM (v_ip_block.unblock_at - now()))::INTEGER;
            RETURN jsonb_build_object(
                'allowed', false,
                'attempts', 0,
                'max_attempts', p_max_attempts,
                'retry_after', v_retry_after,
                'block_reason', 'ip_spam_block',
                'message', 'Your IP has been blocked for 15 hours due to suspicious activity'
            );
        END IF;
        
        -- Clean up expired IP blocks
        DELETE FROM public.ip_blocks WHERE unblock_at <= now();
    END IF;

    -- Count recent failed attempts by email
    SELECT COUNT(*), MIN(attempted_at)
    INTO v_email_attempts, v_oldest_attempt
    FROM public.login_attempts
    WHERE email = LOWER(p_email)
      AND attempted_at > (now() - (p_window_minutes || ' minutes')::INTERVAL)
      AND success = false;

    -- Check if blocked by email attempts
    IF v_email_attempts >= p_max_attempts THEN
        v_is_blocked := true;
        -- Calculate retry_after in seconds
        v_retry_after := EXTRACT(EPOCH FROM (v_oldest_attempt + (p_window_minutes || ' minutes')::INTERVAL - now()))::INTEGER;
        IF v_retry_after < 0 THEN
            v_retry_after := 0;
            v_is_blocked := false;
        END IF;
    END IF;

    -- Check for IP-based spam (multiple different usernames from same IP)
    IF p_ip_address IS NOT NULL AND NOT v_is_blocked THEN
        -- Count unique emails from this IP in the last 30 minutes
        SELECT COUNT(DISTINCT email)
        INTO v_unique_emails
        FROM public.login_attempts
        WHERE ip_address = p_ip_address
          AND attempted_at > (now() - INTERVAL '30 minutes')
          AND success = false;

        -- If more than 5 different usernames from same IP, block for 15 hours
        IF v_unique_emails >= 5 THEN
            -- Insert into ip_blocks table with 15-hour block
            INSERT INTO public.ip_blocks (ip_address, unblock_at, username_count)
            VALUES (p_ip_address, now() + INTERVAL '15 hours', v_unique_emails)
            ON CONFLICT (ip_address) 
            DO UPDATE SET 
                blocked_at = now(),
                unblock_at = now() + INTERVAL '15 hours',
                username_count = EXCLUDED.username_count;
            
            v_is_blocked := true;
            v_retry_after := 15 * 60 * 60; -- 15 hours in seconds
            
            RETURN jsonb_build_object(
                'allowed', false,
                'attempts', v_email_attempts,
                'max_attempts', p_max_attempts,
                'retry_after', v_retry_after,
                'block_reason', 'ip_spam_block',
                'message', 'Your IP has been blocked for 15 hours due to suspicious activity with multiple usernames'
            );
        END IF;

        -- Also check total IP attempts (original logic - 2x email limit)
        SELECT COUNT(*)
        INTO v_ip_attempts
        FROM public.login_attempts
        WHERE ip_address = p_ip_address
          AND attempted_at > (now() - (p_window_minutes || ' minutes')::INTERVAL)
          AND success = false;

        IF v_ip_attempts >= (p_max_attempts * 2) THEN
            v_is_blocked := true;
            v_retry_after := p_window_minutes * 60;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'allowed', NOT v_is_blocked,
        'attempts', v_email_attempts,
        'max_attempts', p_max_attempts,
        'retry_after', v_retry_after
    );
END;
$$;

-- Update record_login_attempt to track unique usernames per IP
CREATE OR REPLACE FUNCTION public.record_login_attempt(
    p_email TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.login_attempts (email, ip_address, success)
    VALUES (LOWER(p_email), p_ip_address, p_success);

    -- If successful, delete old failed attempts for this email
    IF p_success THEN
        DELETE FROM public.login_attempts
        WHERE email = LOWER(p_email)
          AND success = false;
    END IF;

    -- Clean up old attempts (older than 24 hours)
    DELETE FROM public.login_attempts
    WHERE attempted_at < (now() - INTERVAL '24 hours');
    
    -- Clean up expired IP blocks
    DELETE FROM public.ip_blocks
    WHERE unblock_at <= now();
END;
$$;
