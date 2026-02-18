
import { createClient } from '@supabase/supabase-js';

// Detect Supabase variables from various possible environment naming conventions
const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  '';

// Export configuration status
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder-url.supabase.co';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
