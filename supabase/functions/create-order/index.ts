import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Menu items with validated prices (server-side source of truth)
const MENU_ITEMS: Record<string, { name: string; price: number }> = {
  "1": { name: "Butter Chicken", price: 180 },
  "2": { name: "Paneer Butter Masala", price: 160 },
  "3": { name: "Chicken Biryani", price: 150 },
  "4": { name: "Veg Biryani", price: 120 },
  "5": { name: "Samosa", price: 30 },
  "6": { name: "French Fries", price: 60 },
  "7": { name: "Paneer Tikka", price: 140 },
  "8": { name: "Chicken Momos", price: 80 },
  "9": { name: "Red Sauce Pasta", price: 120 },
  "10": { name: "White Sauce Pasta", price: 130 },
  "11": { name: "Pink Sauce Pasta", price: 140 },
  "12": { name: "Masala Chai", price: 20 },
  "13": { name: "Cold Coffee", price: 60 },
  "14": { name: "Lime Soda", price: 30 },
  "15": { name: "Gulab Jamun", price: 40 },
  "16": { name: "Ice Cream Sundae", price: 80 },
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
  specialInstructions?: string;
}

interface CreateOrderRequest {
  items: OrderItem[];
  specialInstructions?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating order for user:', user.id);

    // Parse request body
    const body: CreateOrderRequest = await req.json();
    const { items, specialInstructions } = body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid items array');
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and recalculate prices server-side
    let validatedTotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      // Validate item ID exists
      const menuItem = MENU_ITEMS[item.id];
      if (!menuItem) {
        console.error('Invalid item ID:', item.id);
        return new Response(
          JSON.stringify({ error: `Invalid item: ${item.id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate quantity
      const quantity = Math.floor(Number(item.quantity));
      if (quantity < 1 || quantity > 20) {
        console.error('Invalid quantity:', quantity);
        return new Response(
          JSON.stringify({ error: `Invalid quantity for ${menuItem.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use server-side price (ignore client-submitted price)
      validatedItems.push({
        id: item.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: Array.isArray(item.customizations) ? item.customizations.slice(0, 10) : [],
        specialInstructions: typeof item.specialInstructions === 'string' 
          ? item.specialInstructions.slice(0, 500) 
          : undefined
      });

      validatedTotal += menuItem.price * quantity;
    }

    // Calculate estimated ready time (15 minutes from now)
    const estimatedReadyTime = new Date();
    estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + 15);

    // Sanitize special instructions
    const sanitizedInstructions = typeof specialInstructions === 'string' 
      ? specialInstructions.slice(0, 1000) 
      : null;

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items: validatedItems,
        total_amount: validatedTotal,
        status: 'placed',
        special_instructions: sanitizedInstructions,
        estimated_ready_time: estimatedReadyTime.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: {
          id: order.id,
          items: order.items,
          totalAmount: order.total_amount,
          status: order.status,
          placedAt: order.placed_at,
          estimatedReadyTime: order.estimated_ready_time,
          specialInstructions: order.special_instructions
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
