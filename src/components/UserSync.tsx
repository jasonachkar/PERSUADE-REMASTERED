'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UserSync() {
    const { user } = useUser();

    useEffect(() => {
        async function saveUserToSupabase() {
            if (user) {
                const { error } = await supabase
                    .from('users')
                    .upsert({
                        clerk_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'clerk_id'
                    });

                if (error) {
                    console.error('Error saving user to Supabase:', error);
                }
            }
        }

        saveUserToSupabase();
    }, [user]);

    return null; // This component doesn't render anything
} 