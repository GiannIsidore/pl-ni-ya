import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        // Authorization check
        const user = (locals as any).user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
        }

        const id = parseInt(params.id || '');
        if (isNaN(id)) {
            return new Response(JSON.stringify({ message: 'Invalid ID' }), { status: 400 });
        }

        // Check if blog exists
        const blog = await prisma.blog.findUnique({
            where: { id }
        });

        if (!blog) {
            return new Response(JSON.stringify({ message: 'Blog not found' }), { status: 404 });
        }

        // Check permissions (Author or Admin)
        if (user.role !== 'ADMIN' && blog.authorId !== user.id) {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        await prisma.blog.delete({
            where: { id }
        });

        return new Response(JSON.stringify({ message: 'Blog deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
    try {
        // Authorization check
        const user = (locals as any).user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
        }

        const id = parseInt(params.id || '');
        if (isNaN(id)) {
            return new Response(JSON.stringify({ message: 'Invalid ID' }), { status: 400 });
        }

        const body = await request.json();
        const { status, featuredImageId: rawFeaturedImageId } = body;

        // Check if blog exists
        const blog = await prisma.blog.findUnique({
            where: { id }
        });

        if (!blog) {
            return new Response(JSON.stringify({ message: 'Blog not found' }), { status: 404 });
        }

        // Check permissions
        if (user.role !== 'ADMIN' && blog.authorId !== user.id) {
             return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }
        
        const data: any = {};
        if (status) data.status = status;

        // Handle image update if provided
        if (rawFeaturedImageId !== undefined) {
            const featuredImageId = rawFeaturedImageId ? parseInt(String(rawFeaturedImageId)) : null;
             if (featuredImageId) {
                data.featuredImage = { connect: { id: featuredImageId } };
            } else {
                data.featuredImage = { disconnect: true };
            }
        }

        const updatedBlog = await prisma.blog.update({
            where: { id },
            data
        });

        return new Response(JSON.stringify({ blog: updatedBlog }), { status: 200 });

    } catch (error) {
        console.error('Error updating blog:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
