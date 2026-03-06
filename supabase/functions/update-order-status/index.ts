import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Valid status transitions for restaurant
const VALID_TRANSITIONS: Record<string, string[]> = {
  placed: ['preparing'],
  preparing: ['ready'],
  ready: ['picked_up'],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to bypass RLS trigger restrictions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Also verify the caller is authenticated
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'orderId and newStatus are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return new Response(
        JSON.stringify({ error: `Cannot transition from ${order.status} to ${newStatus}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'ready') {
      updateData.ready_at = new Date().toISOString();
      // Generate unique pickup token
      const pickupToken = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
      updateData.pickup_token = pickupToken;
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Update error:', JSON.stringify(updateError));
      return new Response(
        JSON.stringify({ error: 'Failed to update order status', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, orderId, newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (_error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
