import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const forumSlug = params.forumId!;
    const body = await request.json();
    const { title, content, authorId } = body;

    if (!title || !content || !authorId) {
      return new Response(
        JSON.stringify({ error: 'Title, content, and authorId are required' }),
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
        authorId: parseInt(authorId),
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
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create thread' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
