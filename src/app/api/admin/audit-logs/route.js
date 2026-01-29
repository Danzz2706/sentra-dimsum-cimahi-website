import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize Supabase Admin Client
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

        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100); // Limit to last 100 logs

        if (error) {
            console.error('Error fetching audit logs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
