import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'images', 'blogs');

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        // 1. Authorization Check
        const user = (locals as any).user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return new Response(
                JSON.stringify({ message: 'Unauthorized. Admin access required.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file || file.size === 0) {
            return new Response(
                JSON.stringify({ message: 'No image file provided.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Image Processing and Compression using sharp
        const baseName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`;
        const filename = `${path.parse(baseName).name}.webp`;
        const filePath = path.join(UPLOADS_DIR, filename);
        
        // Process: resize (max width 1200), convert to webp, compress (quality 80)
        const processedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // 4. Save the file
        await fs.writeFile(filePath, processedBuffer);

        // 5. Construct URL and return response
        const imageUrl = `/uploads/images/blogs/${filename}`;

        // Create Image record in the database
        const newImage = await prisma.image.create({
            data: {
                url: imageUrl,
                blogId: null // Explicitly set to null to avoid connecting to the content image relation
            }
        });

        // 5. Construct URL and return response
        return new Response(
            JSON.stringify({
                message: 'Image uploaded and compressed successfully.',
                url: imageUrl,
                id: newImage.id
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error during image upload:', error);
        return new Response(
            JSON.stringify({
                message: 'Internal server error during image upload.',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const GET: APIRoute = () => {
    return new Response(null, { status: 405 });
}
