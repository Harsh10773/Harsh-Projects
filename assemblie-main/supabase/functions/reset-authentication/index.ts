import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
}

const serve = async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error - missing environment variables' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    // Create a Supabase client with the service role key (has admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Delete user authentication data (keep the table structure)
    const responses = {
      vendor_auth: null as any,
      customer_auth: null as any,
      vendor_profiles: null as any,
      customer_profiles: null as any,
      auth_users: null as any,
    }

    // Clear vendor_auth table
    const { error: vendorAuthError } = await supabase
      .from('vendor_auth')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Safety to ensure we don't match a special record
    
    responses.vendor_auth = vendorAuthError ? { error: vendorAuthError.message } : { success: true }
    
    // Clear customer_auth table
    const { error: customerAuthError } = await supabase
      .from('customer_auth')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Safety to ensure we don't match a special record
    
    responses.customer_auth = customerAuthError ? { error: customerAuthError.message } : { success: true }
    
    // Clear vendor_profiles table
    const { error: vendorProfilesError } = await supabase
      .from('vendor_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    responses.vendor_profiles = vendorProfilesError ? { error: vendorProfilesError.message } : { success: true }
    
    // Clear customer_profiles table
    const { error: customerProfilesError } = await supabase
      .from('customer_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    responses.customer_profiles = customerProfilesError ? { error: customerProfilesError.message } : { success: true }
    
    // Delete all users from auth.users (requires admin API call)
    // Get all users first, then delete them
    const { data: users, error: getUsersError } = await supabase.auth.admin.listUsers()
    
    if (getUsersError) {
      responses.auth_users = { error: getUsersError.message }
    } else {
      // Delete each user one by one
      const userDeletionResults = []
      
      for (const user of users.users) {
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)
        userDeletionResults.push({
          userId: user.id,
          email: user.email,
          success: !deleteUserError,
          error: deleteUserError ? deleteUserError.message : null
        })
      }
      
      responses.auth_users = { 
        success: true, 
        usersDeleted: userDeletionResults.filter(r => r.success).length,
        totalUsers: users.users.length,
        details: userDeletionResults
      }
    }

    return new Response(
      JSON.stringify({ success: true, details: responses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in reset-authentication function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

Deno.serve(serve)
