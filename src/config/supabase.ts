// This file is kept for backward compatibility with src/navigation/AppNavigator.tsx
// The active Supabase client has been replaced with local SQLite.
// Re-exports a stub so existing imports don't break.

// Stub object — methods are no-ops since we use SQLite now
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_event: any, _callback: any) => ({
      data: { subscription: { unsubscribe: () => { } } },
    }),
    signInWithPassword: async () => ({ data: {}, error: { message: 'Use SQLite auth' } }),
    signUp: async () => ({ data: {}, error: { message: 'Use SQLite auth' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: (_table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
};
