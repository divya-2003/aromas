import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Alliance University campus location
const COLLEGE_LOCATION = {
  latitude: 12.730493,
  longitude: 77.706792,
};
const ALLOWED_RADIUS_METERS = 2000; // 2km radius

// Menu items with validated prices (server-side source of truth)
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
  latitude?: number;
  longitude?: number;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Simple HTML sanitization - strips all HTML tags
function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove HTML tags and decode common entities
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim();
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateOrderRequest = await req.json();
    const { items, specialInstructions, latitude, longitude } = body;

    // Validate location - server-side enforcement
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        isNaN(latitude) || isNaN(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Valid location required to place order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      COLLEGE_LOCATION.latitude,
      COLLEGE_LOCATION.longitude
    );

    if (distance > ALLOWED_RADIUS_METERS) {
      return new Response(
        JSON.stringify({ error: 'Orders can only be placed from within campus premises' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
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
        return new Response(
          JSON.stringify({ error: 'Invalid menu item selected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate quantity
      const quantity = Math.floor(Number(item.quantity));
      if (quantity < 1 || quantity > 20) {
        return new Response(
          JSON.stringify({ error: 'Item quantity must be between 1 and 20' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sanitize and use server-side price (ignore client-submitted price)
      validatedItems.push({
        id: item.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        customizations: Array.isArray(item.customizations) 
          ? item.customizations.slice(0, 10).map(c => sanitizeText(String(c)).slice(0, 100))
          : [],
        specialInstructions: typeof item.specialInstructions === 'string' 
          ? sanitizeText(item.specialInstructions).slice(0, 500) 
          : undefined
      });

      validatedTotal += menuItem.price * quantity;
    }

    // Calculate estimated ready time (15 minutes from now)
    const estimatedReadyTime = new Date();
    estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + 15);

    // Sanitize special instructions
    const sanitizedInstructions = typeof specialInstructions === 'string' 
      ? sanitizeText(specialInstructions).slice(0, 1000) 
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
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

  } catch (_error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});