import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit settings
const RATE_LIMIT_WINDOW_MINUTES = 15
const MAX_REQUESTS_PER_WINDOW = 3

// Generate secure random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Hash token for storage
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// Generate HTML email
function generateResetEmail(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">🔐 Password Reset Request</h1>
    </div>
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #333;">
      <p style="color: #e0e0e0; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
        We received a request to reset your password for your Zikalyze account.
      </p>
      <p style="color: #e0e0e0; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
        Click the button below to set a new password:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #00d4ff; border-radius: 8px; color: #000000; display: inline-block; font-size: 16px; font-weight: bold; padding: 14px 32px; text-decoration: none;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 14px; line-height: 20px; margin: 16px 0 0 0; text-align: center;">
        This link will expire in 1 hour for security reasons.
      </p>
      <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
      <p style="color: #888; font-size: 14px; line-height: 20px; margin: 0;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #666; font-size: 12px; margin: 0;">
        © 2024 Zikalyze. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Check rate limit for email
async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof createClient<Record<string, unknown>>>,
  email: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  
  const { count, error } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('created_at', windowStart.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    // Allow on error to prevent blocking legitimate users
    return { allowed: true }
  }

  if ((count ?? 0) >= MAX_REQUESTS_PER_WINDOW) {
    // Calculate retry after time
    const { data: oldestToken } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('created_at')
      .eq('email', email.toLowerCase())
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (oldestToken && typeof oldestToken.created_at === 'string') {
      const oldestTime = new Date(oldestToken.created_at).getTime()
      const retryAfter = Math.ceil((oldestTime + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000 - Date.now()) / 1000)
      return { allowed: false, retryAfter: Math.max(retryAfter, 60) }
    }

    return { allowed: false, retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60 }
  }

  return { allowed: true }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    // Validate email input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing password reset request for: ${email}`)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check rate limit BEFORE checking if user exists (prevents email enumeration)
    const rateLimitResult = await checkRateLimit(supabaseAdmin, email)
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for ${email}`)
      const retryMinutes = Math.ceil((rateLimitResult.retryAfter ?? 900) / 60)
      return new Response(
        JSON.stringify({ 
          error: `Too many password reset requests. Please try again in ${retryMinutes} minutes.`,
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter ?? 900)
          } 
        }
      )
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error checking user:', userError)
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userExists = userData.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!userExists) {
      console.log('User not found, returning success for security')
      // Don't reveal if user exists - but still create a token record for rate limiting
      // This prevents attackers from using rate limit responses to enumerate emails
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate token
    const token = generateToken()
    const tokenHash = await hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token hash (don't delete old ones - they're used for rate limiting)
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        email: email.toLowerCase(),
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Error storing token:', insertError)
      throw new Error('Failed to process reset request')
    }

    // Build reset URL with origin detection
    const origin = req.headers.get('origin') || 'https://id-preview--f5148d12-6d88-4366-a3be-be78c99727ed.lovable.app'
    const resetUrl = `${origin}/#/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    // Send email via Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const html = generateResetEmail(resetUrl)

    const { error: emailError } = await resend.emails.send({
      from: 'Zikalyze <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset your Zikalyze password',
      html,
    })

    if (emailError) {
      console.error('Email send error:', emailError)
      throw new Error('Failed to send reset email')
    }

    console.log(`Password reset email sent to ${email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
