import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormRequest {
  name: string
  email: string
  subject: string
  message: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json()

    console.log(`Received contact form submission from ${email}`)

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Input exceeds maximum allowed length' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Sanitize inputs for HTML
    const sanitize = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

    const sanitizedName = sanitize(name)
    const sanitizedSubject = sanitize(subject)
    const sanitizedMessage = sanitize(message).replace(/\n/g, '<br>')

    // Build the email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
            </div>
            <div style="padding: 32px;">
              <div style="margin-bottom: 24px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 4px 0;">From</p>
                <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 500;">${sanitizedName}</p>
                <p style="color: #06b6d4; font-size: 14px; margin: 4px 0 0 0;">${email}</p>
              </div>
              <div style="margin-bottom: 24px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 4px 0;">Subject</p>
                <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 500;">${sanitizedSubject}</p>
              </div>
              <div style="background-color: #1f2937; border-radius: 8px; padding: 20px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">Message</p>
                <p style="color: #e5e7eb; font-size: 15px; margin: 0; line-height: 1.6;">${sanitizedMessage}</p>
              </div>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  This message was sent via the Zikalyze contact form.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to the support address
    const { error: sendError } = await resend.emails.send({
      from: 'Zikalyze Contact <onboarding@resend.dev>',
      to: ['privacyzikalyze@gmail.com'],
      replyTo: email,
      subject: `[Zikalyze Contact] ${subject}`,
      html,
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      throw sendError
    }

    // Send confirmation email to the user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Thank You for Contacting Us!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi ${sanitizedName},
              </p>
              <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                We've received your message and will get back to you as soon as possible. Our team typically responds within 24-48 hours.
              </p>
              <div style="background-color: #1f2937; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">Your Message:</p>
                <p style="color: #e5e7eb; font-size: 14px; margin: 0; line-height: 1.6;">${sanitizedMessage}</p>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Best regards,<br>
                <span style="color: #06b6d4;">The Zikalyze Team</span>
              </p>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 Zikalyze. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: 'Zikalyze <onboarding@resend.dev>',
      to: [email],
      subject: 'We received your message - Zikalyze',
      html: confirmationHtml,
    })

    console.log(`Successfully sent contact emails for ${email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: unknown) {
    console.error('Error processing contact form:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
