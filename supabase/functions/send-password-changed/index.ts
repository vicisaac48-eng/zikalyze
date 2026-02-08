import React from 'https://esm.sh/react@18.3.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { render } from 'https://esm.sh/@react-email/render@0.0.12'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Inline email template
const PasswordChangedEmail = ({ email, changed_at, ip_address }: { email: string; changed_at: string; ip_address?: string | null }) => {
  return React.createElement('html', null,
    React.createElement('head', null,
      React.createElement('meta', { charSet: 'utf-8' }),
      React.createElement('title', null, 'Password Changed - Zikalyze')
    ),
    React.createElement('body', { style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0a0a0f', margin: 0, padding: '40px 20px' } },
      React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#12121a', borderRadius: '16px', border: '1px solid #1e1e2e', overflow: 'hidden' } },
        // Header
        React.createElement('div', { style: { background: 'linear-gradient(135deg, #6effc0 0%, #3de6a0 100%)', padding: '30px', textAlign: 'center' } },
          React.createElement('div', { style: { display: 'inline-block', width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', lineHeight: '60px', fontSize: '28px' } }, '🔐'),
          React.createElement('h1', { style: { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: '20px 0 0 0' } }, 'Password Changed Successfully')
        ),
        // Content
        React.createElement('div', { style: { padding: '30px' } },
          React.createElement('p', { style: { color: '#e5e5e5', fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' } },
            'Your Zikalyze account password has been successfully changed.'
          ),
          // Details Box
          React.createElement('div', { style: { backgroundColor: '#1c1c2e', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a3e', marginBottom: '20px' } },
            React.createElement('h3', { style: { color: '#6effc0', fontSize: '14px', fontWeight: '600', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Change Details'),
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
              React.createElement('tbody', null,
                React.createElement('tr', null,
                  React.createElement('td', { style: { color: '#9ca3af', padding: '8px 0', fontSize: '14px' } }, 'Account:'),
                  React.createElement('td', { style: { color: '#e5e5e5', padding: '8px 0', fontSize: '14px', textAlign: 'right' } }, email)
                ),
                React.createElement('tr', null,
                  React.createElement('td', { style: { color: '#9ca3af', padding: '8px 0', fontSize: '14px' } }, 'Changed At:'),
                  React.createElement('td', { style: { color: '#22d3ee', padding: '8px 0', fontSize: '14px', textAlign: 'right' } }, changed_at)
                ),
                ip_address && React.createElement('tr', null,
                  React.createElement('td', { style: { color: '#9ca3af', padding: '8px 0', fontSize: '14px' } }, 'IP Address:'),
                  React.createElement('td', { style: { color: '#e5e5e5', padding: '8px 0', fontSize: '14px', textAlign: 'right', fontFamily: 'monospace' } }, ip_address)
                )
              )
            )
          ),
          // Warning
          React.createElement('p', { style: { color: '#f87171', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0', padding: '15px', backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.2)' } },
            React.createElement('strong', null, "⚠️ Didn't change your password?"),
            React.createElement('br'),
            'If you didn\'t make this change, your account may be compromised. Please contact support immediately.'
          )
        ),
        // Footer
        React.createElement('div', { style: { borderTop: '1px solid #1e1e2e', padding: '20px 30px', textAlign: 'center' } },
          React.createElement('p', { style: { color: '#6b7280', fontSize: '12px', margin: 0 } },
            'This is an automated security notification from Zikalyze.'
          )
        )
      )
    )
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    const changedAt = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    console.log(`Sending password changed email to ${user.email}`)

    const html = render(
      React.createElement(PasswordChangedEmail, {
        email: user.email!,
        changed_at: changedAt,
        ip_address: ipAddress,
      })
    )

    const { error: emailError } = await resend.emails.send({
      from: 'Zikalyze Security <security@zikalyze.app>',
      to: [user.email!],
      subject: '🔐 Your Zikalyze password has been changed',
      html,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return new Response(
        JSON.stringify({ success: true, emailSent: false, error: emailError.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully sent password changed email to ${user.email}`)

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error sending password changed email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ success: true, emailSent: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
