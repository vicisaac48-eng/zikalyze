import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, username, walletAddress, ipAddress, userAgent } = await req.json()

    // Check username availability
    if (action === 'check_username') {
      if (!username) {
        return new Response(
          JSON.stringify({ available: false, error: 'Username is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabaseClient
        .rpc('check_username_available', { p_username: username })

      if (error) {
        console.error('Error checking username:', error)
        return new Response(
          JSON.stringify({ available: false, error: 'Failed to check username' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Register new wallet
    if (action === 'register_wallet') {
      if (!username || !walletAddress) {
        return new Response(
          JSON.stringify({ success: false, error: 'Username and wallet address are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabaseClient
        .rpc('register_wallet', {
          p_username: username,
          p_wallet_address: walletAddress,
          p_ip_address: ipAddress || null,
          p_user_agent: userAgent || null
        })

      if (error) {
        console.error('Error registering wallet:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to register wallet' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Update last login
    if (action === 'update_login') {
      if (!walletAddress) {
        return new Response(
          JSON.stringify({ success: false, error: 'Wallet address is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabaseClient
        .rpc('update_last_login', {
          p_wallet_address: walletAddress,
          p_ip_address: ipAddress || null
        })

      if (error) {
        console.error('Error updating last login:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update login' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
