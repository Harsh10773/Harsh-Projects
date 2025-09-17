import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface ComponentDetails {
  name: string;
  category: string;
  cores?: string;
  clock_speed?: string;
  memory?: string;
  capacity?: string;
  speed?: string;
  type?: string;
  form_factor?: string;
  description?: string;
  brand?: string;
  model?: string;
  vram?: string;
  reference_id?: string; 
  original_name?: string;
  [key: string]: string | undefined;
}

export const storeCustomerOrderedComponents = async (orderId: string, components: any[]) => {
  try {
    if (!orderId || !orderId.trim()) {
      console.error('Invalid order ID provided to storeCustomerOrderedComponents');
      toast.error('Failed to store components: Invalid order ID');
      return false;
    }
    
    console.log(`COMPONENTS RECEIVED FOR ORDER ${orderId}:`, components);
    
    if (!components || !Array.isArray(components) || components.length === 0) {
      console.error('Invalid components array provided to storeCustomerOrderedComponents:', components);
      toast.error('Failed to store components: No components provided');
      return false;
    }
    
    console.log(`STORING COMPONENTS FOR ORDER ${orderId}:`, JSON.stringify(components, null, 2));
    
    const { data: orderExists, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .maybeSingle();
      
    if (orderError) {
      console.error(`Error verifying order ${orderId} exists:`, orderError);
      toast.error(`Failed to verify order: ${orderError.message}`);
      return false;
    }
    
    if (!orderExists) {
      console.error(`Order with ID ${orderId} does not exist in the database`);
      toast.error('Failed to store components: Order not found');
      return false;
    }
    
    console.log(`Order ${orderId} exists, proceeding with component storage`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const component of components) {
      console.log(`Processing component:`, JSON.stringify(component, null, 2));
      
      // Ensure we capture the original name of the component
      const originalName = component.original_name || component.name || component.model_name || component.component_name;
      
      const componentDetails: ComponentDetails = {
        name: originalName || 'Unknown Component',
        category: component.category || component.component_category || component.component_type || 'Unknown Category',
        description: component.description || originalName || 'Component',
        original_name: originalName
      };
      
      // Copy over all available component details
      if (component.brand) componentDetails.brand = component.brand;
      if (component.model) componentDetails.model = component.model;
      if (component.cores) componentDetails.cores = component.cores;
      if (component.clock_speed) componentDetails.clock_speed = component.clock_speed;
      if (component.memory) componentDetails.memory = component.memory;
      if (component.capacity) componentDetails.capacity = component.capacity;
      if (component.speed) componentDetails.speed = component.speed;
      if (component.type) componentDetails.type = component.type;
      if (component.form_factor) componentDetails.form_factor = component.form_factor;
      if (component.vram) componentDetails.vram = component.vram;
      
      // Process component_details if available
      if (component.component_details) {
        const details = component.component_details;
        if (typeof details === 'object' && !Array.isArray(details)) {
          if (details.brand && !componentDetails.brand) componentDetails.brand = details.brand;
          if (details.model && !componentDetails.model) componentDetails.model = details.model;
          if (details.cores && !componentDetails.cores) componentDetails.cores = details.cores;
          if (details.clock_speed && !componentDetails.clock_speed) componentDetails.clock_speed = details.clock_speed;
          if (details.memory && !componentDetails.memory) componentDetails.memory = details.memory;
          if (details.capacity && !componentDetails.capacity) componentDetails.capacity = details.capacity;
          if (details.speed && !componentDetails.speed) componentDetails.speed = details.speed;
          if (details.type && !componentDetails.type) componentDetails.type = details.type;
          if (details.form_factor && !componentDetails.form_factor) componentDetails.form_factor = details.form_factor;
          if (details.vram && !componentDetails.vram) componentDetails.vram = details.vram;
          if (details.original_name && !componentDetails.original_name) componentDetails.original_name = details.original_name;
        }
      }
      
      const componentId = component.id || component.component_id || null;
      let cleanComponentId = null;
      
      if (componentId && typeof componentId === 'string' && !isUuid(componentId)) {
        console.log(`Component ID ${componentId} is not a UUID, storing as reference ID in details`);
        componentDetails.reference_id = componentId;
      } else {
        cleanComponentId = componentId;
      }
      
      const cleanComponent = {
        order_id: orderId,
        component_name: originalName || componentDetails.name,
        component_id: cleanComponentId,
        component_category: componentDetails.category,
        quantity: component.quantity || 1,
        unit_price: component.price || component.unit_price || 0,
        total_price: (component.price || component.unit_price || 0) * (component.quantity || 1),
        component_details: componentDetails as Json
      };
      
      console.log(`Inserting component: ${cleanComponent.component_name} with details:`, JSON.stringify(cleanComponent.component_details, null, 2));
      
      const { error } = await supabase
        .from('customer_ordered_components')
        .insert(cleanComponent);
        
      if (error) {
        console.error(`Error storing component ${cleanComponent.component_name}:`, error);
        failureCount++;
        toast.error(`Failed to store component: ${cleanComponent.component_name}`);
      } else {
        successCount++;
      }
    }
    
    if (successCount === components.length) {
      console.log(`All ${successCount} components stored successfully`);
      toast.success(`All components saved successfully`);
      return true;
    } else if (successCount > 0) {
      console.warn(`Partial success: ${successCount} components stored, ${failureCount} failed`);
      toast.warning(`Some components could not be saved (${successCount}/${components.length} saved)`);
      return successCount > 0;
    } else {
      console.error('Failed to store any components');
      toast.error('Failed to store any components');
      return false;
    }
  } catch (error) {
    console.error('Error in storeCustomerOrderedComponents:', error);
    toast.error('Failed to store component information');
    return false;
  }
};

function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export const fetchCustomerOrderedComponents = async (orderId: string) => {
  if (!orderId) return [];
  
  try {
    const { data, error } = await supabase
      .from('customer_ordered_components')
      .select('*')
      .eq('order_id', orderId);
      
    if (error) {
      console.error('Error fetching customer ordered components:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCustomerOrderedComponents:', error);
    return [];
  }
};

export const fetchOrderItems = async (orderId: string) => {
  if (!orderId || !orderId.trim()) {
    console.error('Invalid order ID provided to fetchOrderItems');
    return [];
  }
  
  try {
    console.log(`Fetching order items for order ID: ${orderId}`);
    
    const customerComponents = await fetchCustomerOrderedComponents(orderId);
    if (customerComponents && customerComponents.length > 0) {
      console.log(`Found ${customerComponents.length} customer ordered components`);
      
      return customerComponents.map(comp => ({
        id: comp.id,
        order_id: comp.order_id,
        component_name: comp.component_name,
        component_id: comp.component_id,
        quantity: comp.quantity || 1,
        price_at_time: comp.unit_price,
        unit_price: comp.unit_price,
        total_price: comp.total_price,
        component_details: comp.component_details as ComponentDetails,
        component_category: comp.component_category
      }));
    }
    
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (error) {
      console.error(`Error fetching order items for ${orderId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No order items found for order ${orderId}`);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      order_id: item.order_id,
      component_name: item.component_name,
      component_id: item.component_id,
      quantity: item.quantity || 1,
      price_at_time: item.price_at_time,
      unit_price: item.price_at_time,
      total_price: (item.price_at_time || 0) * (item.quantity || 1),
      component_details: {
        name: item.component_name,
        category: 'Component',
        description: item.component_name
      } as ComponentDetails
    }));
  } catch (error) {
    console.error('Error in fetchOrderItems:', error);
    return [];
  }
};

export const storeUserBuilds = async (
  orderId: string,
  selectedComponents: Record<string, any>,
  userId: string,
  extraStorage: Array<{ id: string; name: string; price: number; type: string }> = [],
  componentNames: Record<string, string> = {} // Add component names parameter
) => {
  try {
    if (!orderId || !orderId.trim()) {
      console.error('Invalid order ID provided to storeUserBuilds');
      return null;
    }
    
    const componentsToStore = [];
    
    console.log("Selected components to store:", selectedComponents);
    console.log("Component names to store:", componentNames);
    
    for (const [componentType, component] of Object.entries(selectedComponents)) {
      if (!component || component === 'none') continue;
      
      try {
        console.log(`Processing component type ${componentType}:`, component);
        
        // Get the component name from componentNames or use a fallback
        let originalName = componentNames[componentType] || '';
        
        if (!originalName && typeof component === 'object') {
          originalName = component.name || `${componentType}`;
        } else if (!originalName) {
          // If still no name, try to get it from the database
          try {
            const componentId = typeof component === 'object' ? component.id : component;
            if (componentId) {
              const { data: componentData } = await supabase
                .from('components')
                .select('name')
                .eq('id', componentId)
                .maybeSingle();
                
              if (componentData && componentData.name) {
                originalName = componentData.name;
              } else {
                originalName = `${componentType}`;
              }
            }
          } catch (err) {
            console.error(`Error fetching component name for ${componentType}:`, err);
            originalName = `${componentType}`;
          }
        }
        
        const componentId = typeof component === 'object' ? component.id : component;
        
        if (!componentId) {
          console.warn(`No ID found for component type ${componentType}, storing as custom component`);
          
          const customComponent = {
            component_name: originalName,
            component_id: null,
            component_category: componentType,
            quantity: 1,
            unit_price: typeof component === 'object' && component.price ? component.price : 0,
            total_price: typeof component === 'object' && component.price ? component.price : 0,
            component_details: {
              name: originalName,
              category: componentType,
              description: typeof component === 'object' ? (component.description || componentType) : `Custom ${componentType}`,
              reference_id: componentId,
              original_name: originalName
            }
          };
          componentsToStore.push(customComponent);
          continue;
        }
        
        if (typeof componentId === 'string' && !isUuid(componentId)) {
          const customComponent = {
            component_name: originalName,
            component_id: null,
            component_category: componentType,
            quantity: 1,
            unit_price: typeof component === 'object' && component.price ? component.price : 0,
            total_price: typeof component === 'object' && component.price ? component.price : 0,
            component_details: {
              name: originalName,
              category: componentType,
              description: typeof component === 'object' ? (component.description || componentType) : `${componentType} component`,
              reference_id: componentId,
              original_name: originalName
            }
          };
          componentsToStore.push(customComponent);
          continue;
        }
        
        const { data: componentDetails } = await supabase
          .from('components')
          .select('*')
          .eq('id', componentId)
          .maybeSingle();
          
        console.log(`Component details from database:`, componentDetails);
        
        if (componentDetails) {
          const details: ComponentDetails = {
            name: originalName || componentDetails.name,
            category: componentType,
            description: componentDetails.description || '',
            original_name: originalName || componentDetails.name
          };
          
          const componentData = componentDetails as any;
          
          if (componentData.brand) details.brand = componentData.brand;
          if (componentData.model) details.model = componentData.model;
          if (componentData.cores) details.cores = componentData.cores;
          if (componentData.clock_speed) details.clock_speed = componentData.clock_speed;
          if (componentData.memory) details.memory = componentData.memory;
          if (componentData.capacity) details.capacity = componentData.capacity;
          if (componentData.speed) details.speed = componentData.speed;
          if (componentData.type) details.type = componentData.type;
          if (componentData.form_factor) details.form_factor = componentData.form_factor;
          if (componentData.vram) details.vram = componentData.vram;
          
          if (typeof component === 'object') {
            if (component.brand && !details.brand) details.brand = component.brand;
            if (component.model && !details.model) details.model = component.model;
            if (component.cores && !details.cores) details.cores = component.cores;
            if (component.clock_speed && !details.clock_speed) details.clock_speed = component.clock_speed;
            if (component.memory && !details.memory) details.memory = component.memory;
            if (component.capacity && !details.capacity) details.capacity = component.capacity;
            if (component.speed && !details.speed) details.speed = component.speed;
            if (component.type && !details.type) details.type = component.type;
            if (component.form_factor && !details.form_factor) details.form_factor = component.form_factor;
            if (component.vram && !details.vram) details.vram = component.vram;
            details.original_name = originalName;
          }
          
          console.log(`Creating component with details:`, details);
          
          componentsToStore.push({
            component_name: originalName || componentDetails.name,
            component_id: componentId,
            component_category: componentType,
            quantity: 1,
            unit_price: typeof component === 'object' && component.price ? component.price : componentDetails.price,
            total_price: typeof component === 'object' && component.price ? component.price : componentDetails.price,
            component_details: details
          });
        } else {
          console.warn(`No details found for component ID ${componentId} (${componentType})`);
          
          const fallbackDetails = {
            name: originalName,
            category: componentType,
            description: typeof component === 'object' && component.description ? component.description : `${componentType} component`,
            reference_id: componentId,
            original_name: originalName
          };
          
          componentsToStore.push({
            component_name: originalName,
            component_id: null,
            component_category: componentType,
            quantity: 1,
            unit_price: typeof component === 'object' && component.price ? component.price : 0,
            total_price: typeof component === 'object' && component.price ? component.price : 0,
            component_details: fallbackDetails
          });
        }
      } catch (error) {
        console.error(`Error processing ${componentType}:`, error);
      }
    }
    
    for (const storage of extraStorage) {
      const storageId = storage.id;
      let cleanStorageId = null;
      
      if (storageId && typeof storageId === 'string' && !isUuid(storageId)) {
        console.log(`Storage ID ${storageId} is not a UUID, storing as reference ID`);
        componentsToStore.push({
          component_name: storage.name,
          component_id: null,
          component_category: 'Storage',
          quantity: 1,
          unit_price: storage.price,
          total_price: storage.price,
          component_details: {
            name: storage.name,
            category: 'Storage',
            type: storage.type,
            description: `${storage.name} (${storage.type})`,
            reference_id: storageId,
            original_name: storage.name
          }
        });
      } else {
        componentsToStore.push({
          component_name: storage.name,
          component_id: storageId,
          component_category: 'Storage',
          quantity: 1,
          unit_price: storage.price,
          total_price: storage.price,
          component_details: {
            name: storage.name,
            category: 'Storage',
            type: storage.type,
            description: `${storage.name} (${storage.type})`,
            original_name: storage.name
          }
        });
      }
    }
    
    console.log(`Storing ${componentsToStore.length} components for order ${orderId}:`, JSON.stringify(componentsToStore, null, 2));
    
    if (componentsToStore.length > 0) {
      const result = await storeCustomerOrderedComponents(orderId, componentsToStore);
      if (!result) {
        console.error(`Failed to store components for order ${orderId}`);
      } else {
        console.log(`Successfully stored ${componentsToStore.length} components for order ${orderId}`);
      }
    } else {
      console.warn(`No components to store for order ${orderId}`);
    }
    
    return orderId;
  } catch (error) {
    console.error('Error in storeUserBuilds:', error);
    return null;
  }
};
