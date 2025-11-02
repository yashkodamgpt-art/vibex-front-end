import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and anon key
// FIX: Explicitly typing the variables as strings prevents TypeScript from inferring
// a narrow literal type, which would cause an error when comparing against the placeholder values.
const supabaseUrl: string = 'https://rblpwmgbuqjwevqngqkm.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibHB3bWdidXFqd2V2cW5ncWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjQ1MTMsImV4cCI6MjA3NzYwMDUxM30.kF7KQQCqpEQUCJl6PNFAY0kyZy_4qqHbdyW3YFsH6YY';

if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-anon-key') {
    console.warn("Supabase credentials are placeholders. Please replace them in lib/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
