import { createClient } from '@supabase/supabase-js';

// These will be your actual Supabase credentials
// You'll get these from your Supabase project dashboard
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Only create client if we have valid credentials
let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

export { supabase };
