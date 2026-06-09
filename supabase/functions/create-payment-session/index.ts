import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COLLEGE_LOCATION = { latitude: 12.730493, longitude: 77.706792 }
const ALLOWED_RADIUS_METERS = 2000
const PARCEL_CHARGE = 10

const MENU_ITEMS: Record<string, { name: string; price: number }> = {
  "1": { name: "Butter Chicken", price: 120 },
  "2": { name: "Paneer Tikka Masala", price: 100 },
  "3": { name: "Paneer Butter Masala", price: 110 },
  "4": { name: "Veg Biryani", price: 90 },
  "5": { name: "Chicken Biryani", price: 130 },
  "6": { name: "White Sauce Pasta", price: 130 },
  "7": { name: "Red Sauce Pasta", price: 80 },
  "8": { name: "Pink Sauce Pasta", price: 90 },
  "10": { name: "French Fries", price: 50 },
  "11": { name: "Chicken Momos", price: 60 },
  "12": { name: "Tea", price: 15 },
  "26": { name: "Coffee", price: 20 },
  "13": { name: "Cold Coffee", price: 50 },
  "14": { name: "Fresh Lime Soda", price: 35 },
  "15": { name: "Gulab Jamun", price: 40 },
  "16": { name: "Ice Cream Sundae", price: 60 },
  "17": { name: "Chicken Burger", price: 80 },
  "18": { name: "Aloo Tikki Burger", price: 60 },
  "19": { name: "Pani Puri", price: 50 },
  "20": { name: "Dahi Puri", price: 50 },
  "21": { name: "Buttermilk", price: 25 },
  "22": { name: "Manchow Soup", price: 60 },
  "23": { name: "Plain Maggi", price: 50 },
  "24": { name: "Veg Maggi", price: 60 },
  "25": { name: "Cheese Maggi", price: 70 },
  "27": { name: "Veg Schezwan Noodles", price: 80 },
  "28": { name: "Chicken Noodles", price: 100 },
  "29": { name: "Veg Noodles", price: 70 },
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const { items, specialInstructions, latitude, longitude, isParcel } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(JSON.stringify({ error: 'Valid location required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const dist = calculateDistance(latitude, longitude, COLLEGE_LOCATION.latitude, COLLEGE_LOCATION.longitude)
    if (dist > ALLOWED_RADIUS_METERS) {
      return new Response(JSON.stringify({ error: 'Outside campus' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty cart' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let total = 0
    const validatedItems: any[] = []
    for (const item of items) {
      const menuItem = MENU_ITEMS[item.id]
      if (!menuItem) {
        return new Response(JSON.stringify({ error: 'Invalid menu item' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const qty = Math.floor(Number(item.quantity))
      if (qty < 1 || qty > 20) {
        return new Response(JSON.stringify({ error: 'Invalid quantity' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      validatedItems.push({ id: item.id, name: menuItem.name, price: menuItem.price, quantity: qty })
      total += menuItem.price * qty
    }
    if (isParcel) total += PARCEL_CHARGE

    const estimatedReadyTime = new Date(Date.now() + 15 * 60 * 1000)
    const sanitizedInstructions = typeof specialInstructions === 'string' ? sanitizeText(specialInstructions).slice(0, 1000) : null

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error: insertError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        items: validatedItems,
        total_amount: total,
        status: 'placed',
        payment_status: 'pending',
        special_instructions: sanitizedInstructions,
        estimated_ready_time: estimatedReadyTime.toISOString(),
      })
      .select()
      .single()

    if (insertError || !order) {
      console.error('Insert order error', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Create Cashfree order
    const appId = (Deno.env.get('CASHFREE_APP_ID') || '').trim()
    const secretKey = (Deno.env.get('CASHFREE_SECRET_KEY') || '').trim()
    const mode = (Deno.env.get('CASHFREE_MODE') || 'sandbox').trim().toLowerCase()
    const isProd = mode === 'production' || mode === 'live' || mode === 'prod'
    const cfBase = isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'

    if (!appId || !secretKey) {
      console.error('Missing Cashfree credentials')
      return new Response(JSON.stringify({ error: 'Payment not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log(`[cashfree] mode=${isProd ? 'production' : 'sandbox'} appId_prefix=${appId.substring(0, 6)} appId_len=${appId.length} secret_len=${secretKey.length}`)

    const cfRes = await fetch(`${cfBase}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        order_id: order.id,
        order_amount: total,
        order_currency: 'INR',
        customer_details: {
          customer_id: user.id,
          customer_email: user.email || 'customer@example.com',
          customer_phone: (user.user_metadata?.phone as string) || '9999999999',
          customer_name: (user.user_metadata?.full_name as string) || (user.email?.split('@')[0]) || 'Customer',
        },
        order_meta: {
          return_url: `${req.headers.get('origin') || ''}/bill?order_id=${order.id}`,
        },
      }),
    })

    const cfData = await cfRes.json()
    if (!cfRes.ok || !cfData.payment_session_id) {
      console.error('Cashfree error', cfData)
      return new Response(JSON.stringify({ error: 'Payment gateway error', details: cfData }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    await admin.from('orders').update({
      payment_session_id: cfData.payment_session_id,
      cashfree_order_id: cfData.order_id,
    }).eq('id', order.id)

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      paymentSessionId: cfData.payment_session_id,
      cashfreeOrderId: cfData.order_id,
      mode: isProd ? 'production' : 'sandbox',
      order: {
        id: order.id,
        items: validatedItems,
        totalAmount: total,
        status: order.status,
        placedAt: order.placed_at,
        estimatedReadyTime: order.estimated_ready_time,
        specialInstructions: sanitizedInstructions,
      },
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e) {
    console.error('create-payment-session error', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
