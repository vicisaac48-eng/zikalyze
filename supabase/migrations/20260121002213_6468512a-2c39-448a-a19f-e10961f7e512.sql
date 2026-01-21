-- Add RLS policies to the views to protect user data

-- Enable RLS on the views (views inherit from base table, but we add explicit policies)

-- Fix push_subscriptions_safe view - users can only see their own
DROP POLICY IF EXISTS "Users can view own push subscription status" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscription status"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Fix user_2fa_safe view - users can only see their own 2FA status  
DROP POLICY IF EXISTS "Users can view own 2fa status" ON public.user_2fa;
CREATE POLICY "Users can view own 2fa status"
ON public.user_2fa
FOR SELECT
USING (auth.uid() = user_id);

-- Fix user_sessions_safe view - users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Add RLS to ai_learning_stats view (it's a view of ai_learning_data)
-- Users can only see learning stats for their own data or global stats
DROP POLICY IF EXISTS "Users can view own learning data" ON public.ai_learning_data;
CREATE POLICY "Users can view own learning data"
ON public.ai_learning_data
FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

-- Strengthen password_reset_tokens - block all direct access
DROP POLICY IF EXISTS "Block all access to password reset tokens" ON public.password_reset_tokens;
CREATE POLICY "Block all access to password reset tokens"
ON public.password_reset_tokens
FOR ALL
USING (false);

-- Strengthen login_attempts - ensure only backend access
DROP POLICY IF EXISTS "Block all direct access to login attempts" ON public.login_attempts;
CREATE POLICY "Block all direct access to login attempts"
ON public.login_attempts
FOR ALL
USING (false);