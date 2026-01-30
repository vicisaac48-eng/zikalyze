import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSignInEmailHTML(email: string, signInTime: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In Notification - Zikalyze</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; border: 1px solid #1e1e2e; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); padding: 30px; text-align: center;">
      <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; line-height: 60px; font-size: 28px;">
        🔐
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 20px 0 0 0;">
        Successful Sign In
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello! You have successfully signed in to your Zikalyze account.
      </p>

      <!-- Sign In Details -->
      <div style="background-color: #1c1c2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e; margin-bottom: 20px;">
        <h3 style="color: #22d3ee; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 Sign In Details
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Account:</td>
              <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px; text-align: right;">${email}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Time:</td>
              <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px; text-align: right;">${signInTime}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Status:</td>
              <td style="color: #22c55e; padding: 8px 0; font-size: 14px; text-align: right;">✓ Authenticated</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e3a5f;">
        <h4 style="color: #fbbf24; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
          🛡️ Security Notice
        </h4>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
          If you did not sign in to your account, please change your password immediately and contact support.
        </p>
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending sign-in notification email to: ${email}`)

    // Format the current time
    const signInTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    const html = generateSignInEmailHTML(email, signInTime)

    const { error } = await resend.emails.send({
      from: 'Zikalyze <noreply@zikalyze.app>',
      to: [email],
      subject: '🔐 Successful Sign In - Zikalyze',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`Sign-in notification email sent successfully to ${email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Sign-in notification email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending sign-in notification email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
