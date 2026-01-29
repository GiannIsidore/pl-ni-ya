import type { APIRoute } from 'astro';
import { getCategories, createCategory, generateSlug } from '../../../lib/services/categories';

export const GET: APIRoute = async ({ request, locals }) => {
    // Check authentication
    const user = (locals as any).user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const search = url.searchParams.get('search') || undefined;

        const result = await getCategories({ page, limit, search });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    // Check authentication
    const user = (locals as any).user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { name, slug: providedSlug, description, icon } = body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Category name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate slug if not provided
        const slug = providedSlug?.trim() || generateSlug(name);

        if (!slug || slug.length === 0) {
            return new Response(JSON.stringify({ error: 'Could not generate valid slug from name' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const category = await createCategory({
            name: name.trim(),
            slug,
            description: description?.trim() || undefined,
            icon: icon?.trim() || undefined
        });

        return new Response(JSON.stringify(category), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error creating category:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to create category' }), {
            status: error.message?.includes('already exists') ? 409 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
