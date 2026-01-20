import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import React from 'https://esm.sh/react@18.3.1'
import { renderToStaticMarkup } from 'https://esm.sh/react-dom@18.3.1/server'
import { PasswordChangedEmail } from '../send-email/_templates/password-changed.tsx'

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

Deno.serve(async (req) => {
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

    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
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
        
        const html = renderToStaticMarkup(
          React.createElement(PasswordChangedEmail, {
            email: email,
            changed_at: changedAt,
            ip_address: clientIP !== 'Unknown' ? clientIP : null,
          })
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
