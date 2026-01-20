import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing password reset request for: ${email}`)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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
      // Don't reveal if user exists
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate token
    const token = generateToken()
    const tokenHash = await hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Clean up old tokens for this email
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('email', email.toLowerCase())

    // Store token hash
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
