
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

const clearStaleSessionData = () => {
    // Supabase's JS client stores the session in a key like `sb-<project_ref>-auth-token`
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            console.log(`Removing stale Supabase auth token: ${key}`);
            localStorage.removeItem(key);
        }
    });
};

// Function to check session validity and clear if necessary
export const validateAndCleanSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If there's an error fetching the session or the session is null,
        // it might be stale or corrupted.
        if (error || !session) {
            console.warn('⚠️ Stale or invalid session detected. Cleaning up.');
            await supabase.auth.signOut({ scope: 'local' }); // Clears local storage for the client
            clearStaleSessionData(); // Extra cleanup just in case
        }
    } catch (e) {
        console.error('🚨 Error validating session, forcing cleanup:', e);
        await supabase.auth.signOut({ scope: 'local' });
        clearStaleSessionData();
    }
};

// Refresh session when app becomes visible
if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            console.log('🔄 App became visible, validating session...');
            await supabase.auth.getSession();
        }
    });
}
