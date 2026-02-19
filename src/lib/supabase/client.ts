import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Environment variables
// Set these in your .env file at the project root:
//   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '\n⚠️  [Supabase] Missing environment variables!\n' +
        'Open your .env file and set:\n' +
        '  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
        '  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
        'Get these from: Supabase Dashboard → Project Settings → API\n'
    );
}

// ---------------------------------------------------------------------------
// Supabase client — singleton.
// Only import this in service files (src/services/*.ts), never in components.
// ---------------------------------------------------------------------------

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);
