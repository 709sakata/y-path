import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_KEY || 
  '';

if (!supabaseUrl) console.error('❌ SUPABASE_URL is missing');
if (!supabaseAnonKey) console.error('❌ SUPABASE_ANON_KEY is missing');

console.log('--- Supabase Debug Info ---');
console.log('URL:', supabaseUrl);
console.log('Anon Key (last 5):', supabaseAnonKey.slice(-5));
console.log('Service Key Present:', !!supabaseServiceKey);
if (supabaseServiceKey) {
  console.log('Service Key (last 5):', supabaseServiceKey.slice(-5));
  if (supabaseServiceKey === supabaseAnonKey) {
    console.warn('⚠️ WARNING: Service Role Key is IDENTICAL to Anon Key. RLS will block server operations!');
  }
} else {
  console.warn('⚠️ WARNING: No Service Role Key found. Using Anon Key for all operations.');
}
console.log('---------------------------');

let supabase: any;

try {
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('Invalid or missing SUPABASE_URL');
  }
  supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
} catch (error: any) {
  console.error('❌ Failed to initialize Supabase client:', error.message);
  // Create a mock client that returns errors for all operations to prevent crashes
  const mockHandler = {
    get: () => () => ({
      from: () => mockHandler.get()(),
      select: () => mockHandler.get()(),
      insert: () => mockHandler.get()(),
      update: () => mockHandler.get()(),
      delete: () => mockHandler.get()(),
      eq: () => mockHandler.get()(),
      neq: () => mockHandler.get()(),
      in: () => mockHandler.get()(),
      order: () => mockHandler.get()(),
      then: (resolve: any) => resolve({ data: [], error: { message: 'Supabase not initialized: ' + error.message } }),
    })
  };
  supabase = new Proxy({}, mockHandler);
}

export { supabase };

// For administrative tasks that bypass RLS if needed (using service role key if available)
// For now we use the anon key as provided.
export default supabase;
