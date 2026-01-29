import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        // Use Service Role for updates to bypass RLS if needed, or just standard client if logged in
        // Here we use Service Role to ensure it works from the API route securely
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
            .from('store_settings')
            .update({
                store_name: body.store_name,
                store_address: body.store_address,
                store_phone: body.store_phone,
                shipping_cost: body.shipping_cost,
                store_lat: body.store_lat,
                store_lng: body.store_lng,
                price_per_km: body.price_per_km
            })
            .eq('id', true)
            .select()
            .single();

        if (error) {
            console.error('Error updating settings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
