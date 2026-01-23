import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const parentId = parseInt(params.commentId!);
    const body = await request.json();
    const { content, authorId, threadId } = body;

    if (!content || !authorId || !threadId) {
      return new Response(
        JSON.stringify({ error: 'Content, authorId, and threadId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify parent comment exists
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return new Response(
        JSON.stringify({ error: 'Parent comment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reply = await prisma.comment.create({
      data: {
        content,
        threadId: parseInt(threadId),
        authorId: parseInt(authorId),
        parentId,
      },
      include: {
        author: true,
        parent: true,
      },
    });

    return new Response(JSON.stringify(reply), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create reply' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
