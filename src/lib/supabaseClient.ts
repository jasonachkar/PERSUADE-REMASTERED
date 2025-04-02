// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/clerk-sdk-node';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Basic client for unauthenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get an authenticated client
export async function getAuthenticatedSupabase(userId: string) {
    try {
        // First get active sessions for the user
        const sessions = await clerkClient.sessions.getSession(userId);


        // Now get the JWT token using the session ID
        const token = await clerkClient.sessions.getToken(sessions.id, 'supabase');

        // Return a new client with the auth header
        return createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
    } catch (error) {
        console.error('Error getting authenticated Supabase client:', error);
        // Return the basic client if authentication fails
        return supabase;
    }
}

// Alternative approach using service role key for admin operations
export function getAdminSupabase() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}