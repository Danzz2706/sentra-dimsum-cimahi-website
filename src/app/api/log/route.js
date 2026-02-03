import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
    try {
        const body = await request.json();
        const { user_id, user_email, action, details } = body;

        // Get IP address
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        // Initialize Supabase Admin Client (Service Role) to ensure we can write to audit_logs
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { error } = await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    user_id: user_id || null,
                    user_email: user_email || 'Anonymous',
                    action,
                    details: details || {},
                    ip_address: ip
                }
            ]);

        if (error) {
            console.error('Error logging activity:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
