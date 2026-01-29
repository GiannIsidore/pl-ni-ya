import type { APIRoute } from 'astro';
import { getCategoryById, updateCategory, deleteCategory } from '../../../../lib/services/categories';

export const GET: APIRoute = async ({ params, locals }) => {
    // Check authentication
    const user = (locals as any).user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const id = parseInt(params.id || '');
        if (isNaN(id)) {
            return new Response(JSON.stringify({ error: 'Invalid category ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const category = await getCategoryById(id);

        if (!category) {
            return new Response(JSON.stringify({ error: 'Category not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(category), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch category' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    // Check authentication
    const user = (locals as any).user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const id = parseInt(params.id || '');
        if (isNaN(id)) {
            return new Response(JSON.stringify({ error: 'Invalid category ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { name, slug, description, icon } = body;

        // Validation
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            return new Response(JSON.stringify({ error: 'Category name cannot be empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const category = await updateCategory(id, {
            ...(name !== undefined && { name: name.trim() }),
            ...(slug !== undefined && { slug: slug.trim() }),
            ...(description !== undefined && { description: description?.trim() || undefined }),
            ...(icon !== undefined && { icon: icon?.trim() || undefined })
        });

        return new Response(JSON.stringify(category), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error updating category:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to update category' }), {
            status: error.message?.includes('already exists') ? 409 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    // Check authentication
    const user = (locals as any).user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const id = parseInt(params.id || '');
        if (isNaN(id)) {
            return new Response(JSON.stringify({ error: 'Invalid category ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await deleteCategory(id);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to delete category' }), {
            status: error.message?.includes('Cannot delete') ? 400 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
