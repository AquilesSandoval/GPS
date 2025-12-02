const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

// Create Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
);

// Test database connection
const testConnection = async () => {
  try {
    // Test connection by trying to query a simple table or using a health check
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection,
  
  // Helper method to execute queries (compatibility layer for legacy MySQL code)
  query: async (_sql, _params) => {
    throw new Error('Direct SQL queries are not supported with Supabase. Use supabase client methods instead.');
  },
  
  // Helper method for transactions (compatibility layer for legacy MySQL code)
  transaction: async (_callback) => {
    throw new Error('Transactions need to be implemented using Supabase RPC functions or client methods.');
  },
  
  // Legacy pool export for backward compatibility (will be deprecated)
  pool: {
    execute: async (_sql, _params) => {
      throw new Error('Direct SQL queries are not supported with Supabase. Use supabase client methods instead.');
    },
  },
};
