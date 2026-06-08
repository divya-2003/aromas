import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

async function hmacSha256Base64(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const rawBody = await req.text()
    const timestamp = req.headers.get('x-webhook-timestamp') || ''
    const signature = req.headers.get('x-webhook-signature') || ''
    const secret = Deno.env.get('CASHFREE_SECRET_KEY')!

    // Cashfree signature = base64(HMAC-SHA256(timestamp + rawBody, secret_key))
    const expected = await hmacSha256Base64(secret, timestamp + rawBody)
    if (expected !== signature) {
      console.error('Invalid Cashfree webhook signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const event = JSON.parse(rawBody)
    const orderId: string | undefined = event?.data?.order?.order_id
    const paymentStatus: string | undefined = event?.data?.payment?.payment_status
    const paymentId = event?.data?.payment?.cf_payment_id?.toString()

    if (!orderId || !paymentStatus) {
      return new Response(JSON.stringify({ error: 'Malformed payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const status = paymentStatus === 'SUCCESS' ? 'paid'
      : paymentStatus === 'FAILED' ? 'failed'
      : paymentStatus === 'USER_DROPPED' ? 'failed'
      : 'pending'

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await supabase.from('orders').update({
      payment_status: status,
      payment_id: paymentId,
    }).eq('id', orderId)

    if (error) console.error('DB update error', error)

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('webhook error', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
