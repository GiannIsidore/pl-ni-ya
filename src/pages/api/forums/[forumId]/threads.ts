import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';
import { requireVerifiedUser } from '../../../../lib/authorization';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Require verified user (checks session, DB existence, and ban status)
    const user = await requireVerifiedUser(request);

    const forumSlug = params.forumId!;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find forum by slug
    const forum = await prisma.forum.findUnique({
      where: { slug: forumSlug },
    });

    if (!forum) {
      return new Response(
        JSON.stringify({ error: 'Forum not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists, append number if needed
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.thread.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        slug: finalSlug,
        forumId: forum.id,
        authorId: user.id,
      },
      include: {
        author: true,
        forum: true,
      },
    });

    return new Response(JSON.stringify(thread), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // If error is already a Response (from requireVerifiedUser), return it
    if (error instanceof Response) {
      return error;
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create thread' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
