-- =====================================================
-- USERNAME UNIQUENESS AND WALLET SECURITY
-- Ensures each username is unique and tracked
-- Prevents duplicate wallets and username bypass
-- =====================================================

-- Create user_wallets table to track registered usernames and wallet addresses
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    username_lower TEXT NOT NULL UNIQUE, -- Case-insensitive uniqueness
    wallet_address TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 4 AND char_length(username) <= 32),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'), -- Alphanumeric, underscore, hyphen only
    CONSTRAINT wallet_address_format CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$') -- Valid Ethereum address
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_wallets_username_lower ON public.user_wallets (username_lower);
CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet_address ON public.user_wallets (wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_created_at ON public.user_wallets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_wallets_is_active ON public.user_wallets (is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own wallet data (by wallet address)
CREATE POLICY "Users can read own wallet data"
ON public.user_wallets
FOR SELECT
TO authenticated, anon
USING (true); -- Allow reading for username availability checks

-- Policy: Only service role can insert/update
CREATE POLICY "Service role can manage wallets"
ON public.user_wallets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to check username availability (case-insensitive)
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username_lower TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Validate username format
    IF p_username IS NULL OR char_length(p_username) < 4 THEN
        RETURN jsonb_build_object(
            'available', false,
            'error', 'Username must be at least 4 characters'
        );
    END IF;
    
    IF char_length(p_username) > 32 THEN
        RETURN jsonb_build_object(
            'available', false,
            'error', 'Username must be 32 characters or less'
        );
    END IF;
    
    IF p_username !~ '^[a-zA-Z0-9_-]+$' THEN
        RETURN jsonb_build_object(
            'available', false,
            'error', 'Username can only contain letters, numbers, underscores, and hyphens'
        );
    END IF;
    
    -- Convert to lowercase for case-insensitive check
    v_username_lower := LOWER(p_username);
    
    -- Check if username already exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_wallets 
        WHERE username_lower = v_username_lower
          AND is_active = true
    ) INTO v_exists;
    
    IF v_exists THEN
        RETURN jsonb_build_object(
            'available', false,
            'error', 'Username already taken'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'available', true,
        'message', 'Username is available'
    );
END;
$$;

-- Function to register a new wallet (called after successful wallet creation)
CREATE OR REPLACE FUNCTION public.register_wallet(
    p_username TEXT,
    p_wallet_address TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username_lower TEXT;
    v_existing_wallet TEXT;
    v_existing_username TEXT;
BEGIN
    -- Validate inputs
    IF p_username IS NULL OR p_wallet_address IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username and wallet address are required'
        );
    END IF;
    
    -- Validate username format
    IF char_length(p_username) < 4 OR char_length(p_username) > 32 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username length'
        );
    END IF;
    
    IF p_username !~ '^[a-zA-Z0-9_-]+$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username format'
        );
    END IF;
    
    -- Validate wallet address format
    IF p_wallet_address !~ '^0x[a-fA-F0-9]{40}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid wallet address format'
        );
    END IF;
    
    v_username_lower := LOWER(p_username);
    
    -- Check if username already exists
    SELECT username INTO v_existing_username
    FROM public.user_wallets
    WHERE username_lower = v_username_lower
      AND is_active = true
    LIMIT 1;
    
    IF v_existing_username IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username already registered',
            'code', 'USERNAME_EXISTS'
        );
    END IF;
    
    -- Check if wallet address already exists
    SELECT username INTO v_existing_wallet
    FROM public.user_wallets
    WHERE wallet_address = p_wallet_address
      AND is_active = true
    LIMIT 1;
    
    IF v_existing_wallet IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Wallet address already registered',
            'code', 'WALLET_EXISTS'
        );
    END IF;
    
    -- Insert the new wallet registration
    INSERT INTO public.user_wallets (
        username,
        username_lower,
        wallet_address,
        ip_address,
        user_agent,
        is_active
    ) VALUES (
        p_username,
        v_username_lower,
        p_wallet_address,
        p_ip_address,
        p_user_agent,
        true
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Wallet registered successfully',
        'username', p_username,
        'wallet_address', p_wallet_address
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username or wallet address already exists',
            'code', 'UNIQUE_VIOLATION'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registration failed',
            'code', 'UNKNOWN_ERROR'
        );
END;
$$;

-- Function to update last login time
CREATE OR REPLACE FUNCTION public.update_last_login(
    p_wallet_address TEXT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_wallets
    SET 
        last_login_at = now(),
        ip_address = COALESCE(p_ip_address, ip_address)
    WHERE wallet_address = p_wallet_address
      AND is_active = true;
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_wallet(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_last_login(TEXT, TEXT) TO anon, authenticated;

-- Add comment
COMMENT ON TABLE public.user_wallets IS 'Tracks registered usernames and wallet addresses to ensure uniqueness and prevent bypassing';
COMMENT ON FUNCTION public.check_username_available IS 'Checks if a username is available for registration (case-insensitive)';
COMMENT ON FUNCTION public.register_wallet IS 'Registers a new wallet after successful creation, ensuring username uniqueness';
COMMENT ON FUNCTION public.update_last_login IS 'Updates the last login timestamp for a wallet address';
