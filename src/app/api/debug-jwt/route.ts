import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        // Get the current Clerk session
        const session = await auth();

        if (!session.userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get a token specifically for Supabase
        const token = await session.getToken({ template: 'supabase' });

        // Decode JWT to check payload
        let decodedJWT = null;
        try {
            const payload = token ? token.split('.')[1] : '';
            if (payload) {
                decodedJWT = JSON.parse(Buffer.from(payload, 'base64').toString());
            }
        } catch (e) {
            console.error('Failed to decode JWT:', e);
        }

        // Log token details for debugging (first 20 chars are safe)
        console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');

        // Create Supabase client with token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        // Test a query with explicit filter
        const { data: filteredData } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', session.userId);

        // Regular query to test RLS
        const { data, error } = await supabase.from('products').select('*');

        return NextResponse.json({
            authenticated: !!token,
            tokenStart: token ? `${token.substring(0, 20)}...` : null,
            userId: session.userId,
            decodedJWT,
            data,
            filteredData,
            error: error ? error.message : null
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
} 