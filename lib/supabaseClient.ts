
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rblpwmgbuqjwevqngqkm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibHB3bWdidXFqd2V2cW5ncWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjQ1MTMsImV4cCI6MjA3NzYwMDUxM30.kF7KQQCqpEQUCJl6PNFAY0kyZy_4qqHbdyW3YFsH6YY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Refresh session when app becomes visible
if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            supabase.auth.getSession();
        }
    });
}
