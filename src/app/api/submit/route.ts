import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Add this helper function at the top of the file
function getPublicImageUrl(supabase: SupabaseClient, bucketName: string, filePath: string) {
    const {
        data: { publicUrl },
    } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    // Ensure the URL uses HTTPS
    return publicUrl.replace('http://', 'https://');
}

export async function GET() {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return a proper NextResponse with the data
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const image = formData.get('image') as File | null;
        const method = formData.get('_method') as string | null;

        // Check if this is an update (PUT) request
        if (method === 'PUT' && formData.has('id')) {
            return handleUpdate(formData);
        }

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
                // Use the helper function to get the correct public URL
                imageUrl = getPublicImageUrl(supabase, 'product-images', imageData.path);
            }
        }

        const { data, error } = await supabase.from('products').insert({
            name,
            description,
            price: parseFloat(price),
            image: imageUrl,
            user_id: userId
        }).select();

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

// Handle DELETE requests
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const { userId } = await auth();

        console.log('Attempting to delete product with ID:', id);

        if (!id) {
            console.error('No ID provided');
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        const { data: user, error: userError } = await supabase.from('products').select('user_id').eq('id', id).single();
        if (userError) {
            console.error('Error fetching product:', userError);
            return NextResponse.json({ error: userError.message }, { status: 400 });
        }
        if (user?.user_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // First get the product to check if it has an image
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching product:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 400 });
        }

        // Delete the image from storage if it exists
        if (product?.image) {
            const imagePath = product.image.split('/').pop(); // Get the filename from the URL
            if (imagePath) {
                console.log('Attempting to delete image:', imagePath);
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove([imagePath]);

                if (storageError) {
                    console.error('Error deleting image:', storageError);
                }
            }
        }

        // Delete the product from the database
        console.log('Deleting product from database...');
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting product:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 400 });
        }

        console.log('Product deleted successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error deleting product:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Helper function to handle update (PUT) requests
async function handleUpdate(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const image = formData.get('image') as File | null;

        // Get current product data
        const { data: existingProduct } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let imageUrl = existingProduct.image;

        // Handle image update if a new image was provided
        if (image) {
            // Delete old image if it exists
            if (existingProduct.image) {
                const oldImagePath = existingProduct.image.split('/').pop();
                if (oldImagePath) {
                    await supabase.storage
                        .from('product-images')
                        .remove([oldImagePath]);
                }
            }

            // Upload new image
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}-${image.name}`.replace(/[^a-zA-Z0-9-_.]/g, '');

            const { data: imageData, error: imageError } = await supabase.storage
                .from('product-images')
                .upload(fileName, image);

            if (imageError) {
                return NextResponse.json({ error: imageError.message }, { status: 400 });
            }

            if (imageData) {
                // Use the helper function here too
                imageUrl = getPublicImageUrl(supabase, 'product-images', imageData.path);
            }
        }

        // Update product record
        const { data, error } = await supabase
            .from('products')
            .update({
                name,
                description,
                price: parseFloat(price),
                image: imageUrl
            })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}