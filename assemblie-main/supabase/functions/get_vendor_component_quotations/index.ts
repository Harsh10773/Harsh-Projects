
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { vendor_id_param, order_id_param } = await req.json();
    
    if (!vendor_id_param || !order_id_param) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // First, check if we have detailed component data from customer_ordered_components
    const { data: customerOrderedComponents, error: customerComponentsError } = await supabase
      .from('customer_ordered_components')
      .select('id, component_name, component_id, component_category, component_details, quantity, unit_price, total_price')
      .eq('order_id', order_id_param);
    
    if (customerComponentsError) {
      console.error('Error fetching customer ordered components:', customerComponentsError);
    }
    
    // If we found detailed components, use them
    if (customerOrderedComponents && customerOrderedComponents.length > 0) {
      console.log(`Found ${customerOrderedComponents.length} customer ordered components for order ${order_id_param}`);
      
      // Check for existing component quotations for this vendor and order
      const { data: existingQuotations, error: quotationsError } = await supabase
        .from('vendor_component_quotations_history')
        .select('order_item_id, quoted_price, status')
        .eq('vendor_id', vendor_id_param)
        .eq('order_id', order_id_param);
      
      if (quotationsError) {
        console.error('Error fetching existing quotations:', quotationsError);
      }
      
      // Map quotation data to components
      const componentsWithQuotations = customerOrderedComponents.map(component => {
        const existingQuote = existingQuotations?.find(q => q.order_item_id === component.id);
        
        // Get the original detailed component name from component_details
        let displayName = component.component_name;
        let fullModelName = '';
        const compDetails = component.component_details;
        
        // Handle component_details safely
        if (compDetails && typeof compDetails === 'object' && !Array.isArray(compDetails)) {
          // Try to use the original name that was saved when the user selected the component
          if (compDetails.original_name) {
            displayName = compDetails.original_name;
          }
          
          // Build a detailed model name
          if (compDetails.brand && compDetails.model) {
            fullModelName = `${compDetails.brand} ${compDetails.model}`;
          } else if (compDetails.brand) {
            fullModelName = compDetails.brand;
          } else if (compDetails.model) {
            fullModelName = compDetails.model;
          }

          // Add specific details based on component category
          if (component.component_category?.toLowerCase().includes('processor') || 
              (compDetails.category && compDetails.category.toLowerCase().includes('processor'))) {
            if (compDetails.cores) {
              fullModelName += ` (${compDetails.cores} cores`;
              if (compDetails.clock_speed) fullModelName += `, ${compDetails.clock_speed}GHz`;
              fullModelName += ')';
            }
          } else if (component.component_category?.toLowerCase().includes('graphics') || 
                    (compDetails.category && compDetails.category.toLowerCase().includes('graphics'))) {
            if (compDetails.vram || compDetails.memory) {
              fullModelName += ` (${compDetails.vram || compDetails.memory}GB)`;
            }
          } else if (component.component_category?.toLowerCase().includes('memory') || 
                    (compDetails.category && compDetails.category.toLowerCase().includes('memory'))) {
            if (compDetails.capacity && compDetails.speed) {
              fullModelName += ` ${compDetails.capacity}GB ${compDetails.speed}MHz`;
            }
          }
        }
        
        // If we have a full model name, use it
        if (fullModelName) {
          displayName = fullModelName;
        }
        
        return {
          id: component.id,
          order_item_id: component.id,
          component_name: displayName,
          component_id: component.component_id,
          component_category: component.component_category,
          component_details: component.component_details,
          quantity: component.quantity || 1,
          unit_price: component.unit_price || 0,
          quoted_price: existingQuote?.quoted_price || component.unit_price || 0,
          status: existingQuote?.status || 'pending',
          specs: component.component_details?.description || null
        };
      });
      
      return new Response(
        JSON.stringify(componentsWithQuotations),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If no customer_ordered_components found, try regular order_items table next
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, component_name, component_id, price_at_time, quantity')
      .eq('order_id', order_id_param);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
    }
    
    if (orderItems && orderItems.length > 0) {
      console.log(`Found ${orderItems.length} order items for order ${order_id_param}`);
      
      // Get detailed component info for each item that has a component_id
      const componentDetailsPromises = orderItems.map(async (item) => {
        if (item.component_id) {
          const { data: componentData, error: componentError } = await supabase
            .from('components')
            .select('*')
            .eq('id', item.component_id)
            .maybeSingle();
          
          if (componentError) {
            console.error(`Error fetching component details for ${item.component_id}:`, componentError);
            return null;
          }
          
          return componentData;
        }
        return null;
      });
      
      const componentsDetails = await Promise.all(componentDetailsPromises);
      
      // Check for existing quotations
      const { data: existingQuotations, error: quotationsError } = await supabase
        .from('vendor_component_quotations_history')
        .select('order_item_id, quoted_price, status')
        .eq('vendor_id', vendor_id_param)
        .eq('order_id', order_id_param);
      
      if (quotationsError) {
        console.error('Error fetching existing quotations:', quotationsError);
      }
      
      // Map component details to order items
      const itemsWithDetails = orderItems.map((item, index) => {
        const componentDetail = componentsDetails[index];
        const existingQuote = existingQuotations?.find(q => q.order_item_id === item.id);
        
        // Construct a details object even if we don't have component details
        const details = componentDetail || {
          name: item.component_name,
          category: inferComponentCategory(item.component_name),
          description: item.component_name
        };
        
        return {
          id: item.id,
          order_item_id: item.id,
          component_name: item.component_name,
          component_id: item.component_id,
          component_category: details.category,
          component_details: details,
          quantity: item.quantity || 1,
          unit_price: item.price_at_time || 0,
          quoted_price: existingQuote?.quoted_price || item.price_at_time || 0,
          status: existingQuote?.status || 'pending',
          specs: details.description || null
        };
      });
      
      return new Response(
        JSON.stringify(itemsWithDetails),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Last resort: try to get data from user_builds
    const { data: userBuilds, error: userBuildsError } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('id', order_id_param)
      .maybeSingle();
    
    if (userBuildsError) {
      console.error('Error fetching order for user builds:', userBuildsError);
    }
    
    if (userBuilds && userBuilds.customer_id) {
      const { data: builds, error: buildsError } = await supabase
        .from('user_builds')
        .select('*')
        .eq('user_id', userBuilds.customer_id)
        .order('created_at', { ascending: false })
        .limit(20);  // Get the most recent builds
      
      if (buildsError) {
        console.error('Error fetching user builds:', buildsError);
      }
      
      if (builds && builds.length > 0) {
        console.log(`Found ${builds.length} user builds for customer ${userBuilds.customer_id}`);
        
        // Try to find the most recent complete build (with all component types)
        const buildIds = [...new Set(builds.map(build => build.build_id))];
        
        // Group components by build_id
        const buildComponents = {};
        buildIds.forEach(buildId => {
          buildComponents[buildId] = builds.filter(b => b.build_id === buildId);
        });
        
        // Find most complete build
        let mostComponentsBuildId = buildIds[0];
        let maxComponentCount = 0;
        
        buildIds.forEach(buildId => {
          const count = buildComponents[buildId].length;
          if (count > maxComponentCount) {
            maxComponentCount = count;
            mostComponentsBuildId = buildId;
          }
        });
        
        const selectedBuildComponents = buildComponents[mostComponentsBuildId];
        
        // Check for existing quotations
        const { data: existingQuotations, error: quotationsError } = await supabase
          .from('vendor_component_quotations_history')
          .select('order_item_id, quoted_price, status')
          .eq('vendor_id', vendor_id_param)
          .eq('order_id', order_id_param);
        
        if (quotationsError) {
          console.error('Error fetching existing quotations:', quotationsError);
        }
        
        // Map user build components to response format
        const userBuildComponents = selectedBuildComponents.map(component => {
          const existingQuote = existingQuotations?.find(q => q.order_item_id === component.id);
          
          return {
            id: component.id,
            order_item_id: component.id,
            component_name: component.model_name,
            component_category: component.component_type,
            component_details: {
              name: component.model_name,
              category: component.component_type,
              description: `${component.model_name} (${component.component_type})`
            },
            quantity: component.quantity || 1,
            unit_price: component.price || 0,
            quoted_price: existingQuote?.quoted_price || component.price || 0,
            status: existingQuote?.status || 'pending',
            specs: `${component.model_name} - ${component.component_type}`
          };
        });
        
        return new Response(
          JSON.stringify(userBuildComponents),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // If we still have nothing, create a fallback component for the whole order
    // Check for existing quotations first
    const { data: existingQuotation, error: existingQuotationError } = await supabase
      .from('vendor_component_quotations_history')
      .select('*')
      .eq('vendor_id', vendor_id_param)
      .eq('order_id', order_id_param)
      .maybeSingle();
    
    if (existingQuotationError && existingQuotationError.code !== 'PGRST116') {
      console.error('Error fetching existing quotation:', existingQuotationError);
    }
    
    // Get order details for fallback
    const { data: orderDetails, error: orderDetailsError } = await supabase
      .from('orders')
      .select('tracking_id')
      .eq('id', order_id_param)
      .maybeSingle();
    
    if (orderDetailsError) {
      console.error('Error fetching order details:', orderDetailsError);
    }
    
    // Create a fallback component
    const fallbackComponent = {
      id: existingQuotation?.order_item_id || `fallback-${order_id_param}`,
      order_item_id: existingQuotation?.order_item_id || `fallback-${order_id_param}`,
      component_name: existingQuotation?.component_name || "Complete Computer Build",
      component_category: "System",
      component_details: {
        name: existingQuotation?.component_name || "Complete Computer Build",
        category: "System",
        description: `Complete custom computer build for order ${orderDetails?.tracking_id || order_id_param}`,
        specs: "Full system build as specified by customer"
      },
      quantity: existingQuotation?.quantity || 1,
      unit_price: 0,
      quoted_price: existingQuotation?.quoted_price || 0,
      status: existingQuotation?.status || 'pending',
      specs: "Full system build"
    };
    
    return new Response(
      JSON.stringify([fallbackComponent]),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch component quotations' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to infer component category from name
function inferComponentCategory(componentName: string): string {
  const name = componentName.toLowerCase();
  
  if (name.includes('processor') || name.includes('cpu') || name.includes('ryzen') || name.includes('intel')) {
    return 'processor';
  } else if (name.includes('graphics') || name.includes('gpu') || name.includes('rtx') || name.includes('gtx')) {
    return 'graphics';
  } else if (name.includes('memory') || name.includes('ram') || name.includes('ddr')) {
    return 'memory';
  } else if (name.includes('storage') || name.includes('ssd') || name.includes('hdd') || name.includes('nvme')) {
    return 'storage';
  } else if (name.includes('cooling') || name.includes('cooler') || name.includes('fan')) {
    return 'cooling';
  } else if (name.includes('power') || name.includes('psu') || name.includes('supply')) {
    return 'power';
  } else if (name.includes('motherboard') || name.includes('mobo')) {
    return 'motherboard';
  } else if (name.includes('case')) {
    return 'pcCase';
  }
  
  return 'other';
}
