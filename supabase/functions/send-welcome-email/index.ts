import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateWelcomeEmailHTML(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zikalyze</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; border: 1px solid #1e1e2e; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); padding: 30px; text-align: center;">
      <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; line-height: 60px; font-size: 28px;">
        📊
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 20px 0 0 0;">
        Welcome to Zikalyze! 🎉
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Your account has been successfully created. You're now part of the Zikalyze community with access to AI-powered crypto analytics.
      </p>

      <!-- Account Info -->
      <div style="background-color: #1c1c2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e; margin-bottom: 20px;">
        <h3 style="color: #22d3ee; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          ✅ Account Confirmed
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Email:</td>
              <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px; text-align: right;">${email}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">Status:</td>
              <td style="color: #6effc0; padding: 8px 0; font-size: 14px; text-align: right;">Active ✓</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Features -->
      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e3a5f; margin-bottom: 20px;">
        <h4 style="color: #22d3ee; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
          🚀 What You Can Do Now
        </h4>
        <ul style="color: #9ca3af; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Track real-time cryptocurrency prices</li>
          <li>Get AI-powered market analysis and predictions</li>
          <li>Set custom price alerts for any crypto</li>
          <li>View on-chain metrics and smart money flows</li>
          <li>Analyze market sentiment and trends</li>
        </ul>
      </div>

      <!-- Security Tips -->
      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e3a5f;">
        <h4 style="color: #fbbf24; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
          🛡️ Secure Your Account
        </h4>
        <ul style="color: #9ca3af; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Enable Two-Factor Authentication (2FA) in Settings</li>
          <li>Use a strong, unique password</li>
          <li>Keep your recovery codes safe</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #1e1e2e; padding: 20px 30px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Welcome aboard! If you have questions, just reply to this email.<br>
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

    console.log(`Sending welcome email to: ${email}`)

    const html = generateWelcomeEmailHTML(email)

    const { error } = await resend.emails.send({
      from: 'Zikalyze <noreply@zikalyze.app>',
      to: [email],
      subject: '🎉 Welcome to Zikalyze - Your Account is Ready!',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`Welcome email sent successfully to ${email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending welcome email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
