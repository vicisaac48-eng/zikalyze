import type {} from './types.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@latest'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hash token for comparison
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get client IP from request headers
function getClientIP(req: Request): string {
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  const xForwardedFor = req.headers.get('x-forwarded-for')
  const xRealIP = req.headers.get('x-real-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  if (xRealIP) return xRealIP
  return 'Unknown'
}

// Generate password changed email HTML
function generatePasswordChangedEmailHTML(email: string, changedAt: string, ipAddress: string | null): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Zikalyze</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; border: 1px solid #1e1e2e; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
      <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; line-height: 60px; font-size: 28px;">🔐</div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 20px 0 0 0;">Password Changed Successfully</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Your Zikalyze account password has been successfully changed. This is a confirmation that your password update was completed.
      </p>

      <!-- Details Box -->
      <div style="background-color: #1c1c2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e; margin-bottom: 20px;">
        <h3 style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">Change Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Account:</td>
            <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px; text-align: right;">${email}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Changed At:</td>
            <td style="color: #22d3ee; padding: 8px 0; font-size: 14px; text-align: right;">${changedAt}</td>
          </tr>
          ${ipAddress ? `<tr>
            <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">IP Address:</td>
            <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${ipAddress}</td>
          </tr>` : ''}
        </table>
      </div>

      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e3a5f; margin-bottom: 20px;">
        <h4 style="color: #22d3ee; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">✅ What This Means</h4>
        <ul style="color: #9ca3af; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Your new password is now active</li>
          <li>Previous password will no longer work</li>
          <li>Active sessions remain logged in</li>
        </ul>
      </div>

      <p style="color: #f87171; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; padding: 15px; background-color: rgba(248, 113, 113, 0.1); border-radius: 8px; border: 1px solid rgba(248, 113, 113, 0.2);">
        <strong>⚠️ Didn't change your password?</strong><br>
        If you didn't make this change, your account may be compromised. Please contact support immediately and secure your account.
      </p>

      <!-- Security Box -->
      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e3a5f;">
        <h4 style="color: #22d3ee; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">🛡️ Security Recommendations</h4>
        <ul style="color: #9ca3af; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Enable Two-Factor Authentication for extra security</li>
          <li>Review active sessions in your Settings</li>
          <li>Use a unique password not used elsewhere</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #1e1e2e; padding: 20px 30px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        This is an automated security notification from Zikalyze.<br>
        © ${new Date().getFullYear()} Zikalyze. AI-Powered Crypto Analytics.
      </p>
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { token, email, newPassword } = await req.json()

    if (!token || !email || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Token, email, and new password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Verifying reset token for: ${email}`)
    
    const clientIP = getClientIP(req)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hash the provided token
    const tokenHash = await hashToken(token)

    // Look up the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .single()

    if (tokenError || !tokenData) {
      console.log('Token not found or already used')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired reset link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired')
      return new Response(
        JSON.stringify({ error: 'Reset link has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error finding user:', userError)
      throw new Error('Failed to process request')
    }

    const user = userData.users.find((u: { id: string; email?: string | null }) =>
      u.email?.toLowerCase() === email.toLowerCase()
    )
    
    if (!user) {
      console.log('User not found')
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error('Failed to update password')
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    console.log(`Password updated successfully for ${email}`)

    // Send password changed notification email
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        
        const changedAt = new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
        
        const html = generatePasswordChangedEmailHTML(
          email,
          changedAt,
          clientIP !== 'Unknown' ? clientIP : null
        )
        
        await resend.emails.send({
          from: 'Zikalyze Security <onboarding@resend.dev>',
          to: [email],
          subject: '🔐 Password Changed Successfully - Zikalyze',
          html,
        })
        
        console.log(`Password change notification sent to ${email}`)
      } catch (emailError) {
        // Don't fail password reset if email notification fails
        console.error('Failed to send password change notification:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password updated successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Verify reset token error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
