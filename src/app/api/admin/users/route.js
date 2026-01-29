import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize Supabase Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log("API Debug: URL exists?", !!supabaseUrl);
        console.log("API Debug: Key exists?", !!serviceRoleKey);

        if (!serviceRoleKey) {
            return NextResponse.json({ error: "Missing Service Role Key" }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Fetch users from auth.users
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        console.log("API Debug: Fetch result:", { data: data ? "present" : "missing", error });

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const users = data.users;

        // Map to a cleaner format
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || 'Tanpa Nama',
            phone: user.user_metadata?.phone || '-',
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at
        }));

        return NextResponse.json(formattedUsers);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
