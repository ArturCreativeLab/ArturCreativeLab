
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase backend is not configured. The application will run in a limited, offline mode. ' +
    'Please provide your Supabase URL and anonymous key in `lib/supabaseClient.ts` to enable database features and Google Sign-In.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;