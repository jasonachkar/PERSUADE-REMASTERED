import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Connection successful', data });
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const image = formData.get('image') as File | null;

        let imageUrl = null;

        if (image) {
            // Generate unique filename
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}-${image.name}`.replace(/[^a-zA-Z0-9-_.]/g, '');

            const { data: imageData, error: imageError } = await supabase.storage
                .from('product-images')
                .upload(fileName, image);

            if (imageError) {
                return NextResponse.json({ error: imageError.message }, { status: 400 });
            }

            if (imageData) {
                imageUrl = supabase.storage
                    .from('product-images')
                    .getPublicUrl(imageData.path)
                    .data.publicUrl;
            }
        }

        const { data, error } = await supabase.from('products').insert({
            name,
            description,
            price: parseFloat(price),
            image: imageUrl
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}