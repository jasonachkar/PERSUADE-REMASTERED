import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from '@/lib/supabase'; // Adjust the path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name, description, price, image } = req.body;

        const { data, error } = await supabase.from('products').insert({
            name,
            description,
            price,
            image: image ? image : null,
        });


    }
}